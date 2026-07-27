"use client";

import dynamic from "next/dynamic";
import {
  Archive, CalendarDays, Check, ChevronDown, CircleAlert, CircleHelp, ClipboardCheck,
  Eye, FileSpreadsheet, FileText, Filter, MapPin, Pencil,
  Plus, Search, Settings, Trash2, TreePine, UserRound, Wrench, X,
} from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useOperations } from "../context/OperationsContext";
import { isActive, isCompleted, isCritical, isOverdue, ModuleKey, OperationRow } from "../data/operations";
import { KOCAELI_DISTRICTS, KOCAELI_PARKS, parksForDistrict } from "../data/kocaeliParks";

const ParkMap = dynamic(() => import("./ParkMap"), { ssr: false });
type Row = OperationRow;
type Config = {
  key: ModuleKey;
  title: string;
  eyebrow: string;
  columns: [string, string][];
  fields: [string, string, string][];
  icon: ReactNode;
};

const STATUS_OPTIONS: Record<ModuleKey, string[]> = {
  parks: ["Aktif", "Bakım Gerekli", "Geçici Kapalı", "Kapalı"],
  equipment: ["İyi", "Bakım Gerekli", "Arızalı"],
  maintenance: ["Bekliyor", "Atandı", "Devam Ediyor", "Tamamlandı"],
  faults: ["Bekliyor", "İnceleniyor", "Çalışma Başladı", "Tamamlandı", "Reddedildi"],
  tasks: ["Bekliyor", "Atandı", "Devam Ediyor", "Tamamlandı"],
  reports: ["Bekliyor", "İnceleniyor", "Çalışma Başladı", "Tamamlandı", "Reddedildi"],
  staff: ["Müsait", "Sahada", "İzinli", "Pasif"],
  events: ["Taslak", "Yayında", "Tamamlandı", "İptal Edildi"],
  support: ["Açık", "İnceleniyor", "Çözüldü"],
};

const EQUIPMENT_TYPES = [
  "Bank", "Kamelya", "Çocuk Oyun Grubu", "Fitness Alanı", "Basketbol Sahası",
  "Futbol Sahası", "Tuvalet", "Çeşme", "Çöp Kutusu", "Aydınlatma", "Yönlendirme", "Diğer",
];
const SELECT_OPTIONS: Record<string, string[]> = {
  maintenanceType: ["Sulama", "Çim Biçme", "Temizlik", "Boyama", "Budama", "Ekipman Onarımı", "Elektrik Bakımı", "Peyzaj", "Genel Bakım", "Diğer"],
  faultCategory: ["Oyun Grubu", "Aydınlatma", "Sulama", "Temizlik", "Zemin", "Kent Mobilyası", "Güvenlik", "Diğer"],
  reportCategory: ["Arıza", "Temizlik", "Ekipman", "Aydınlatma", "Erişilebilirlik", "Öneri", "Diğer"],
  priority: ["Düşük", "Orta", "Yüksek", "Kritik", "Diğer"],
  staffRole: ["Bakım Personeli", "Peyzaj Görevlisi", "Elektrik Teknisyeni", "Temizlik Personeli", "Sulama Personeli", "Saha Sorumlusu", "Diğer"],
  eventType: ["Konser", "Çocuk Etkinliği", "Spor", "Yoga", "Sinema", "Atölye", "Doğa Etkinliği", "Diğer"],
  taskType: ["Bakım", "Temizlik", "Sulama", "Ekipman Güvenliği", "Denetim", "Boyama", "Diğer"],
};

const configs: Record<string, Config> = {
  Parklar: {
    key: "parks", title: "Kocaeli Park Yönetimi", eyebrow: "Dinamik park envanteri", icon: <TreePine />,
    columns: [["name", "Park"], ["district", "İlçe"], ["neighborhood", "Mahalle"], ["occupancy", "Doluluk"], ["score", "Öncelik Puanı"], ["status", "Durum"]],
    fields: [["name", "Park adı", "text"], ["district", "İlçe", "district"], ["neighborhood", "Mahalle", "text"], ["address", "Açık adres", "text"], ["latitude", "Enlem", "number-step"], ["longitude", "Boylam", "number-step"], ["hours", "Çalışma saatleri", "text"], ["amenities", "İmkânlar", "text"], ["occupancy", "Doluluk oranı (%)", "number"], ["capacity", "Kapasite", "number"], ["score", "Bakım öncelik puanı", "number"], ["criticalReason", "Kritik durum nedeni", "textarea"], ["status", "Durum", "status"]],
  },
  Ekipmanlar: {
    key: "equipment", title: "Ekipman Yönetimi", eyebrow: "Park ekipmanları ve bakım durumu", icon: <Settings />,
    columns: [["name", "Ekipman"], ["park", "Park"], ["type", "Tür"], ["lastMaintenance", "Son Bakım"], ["priority", "Öncelik"], ["condition", "Durum"]],
    fields: [["name", "Ekipman adı", "text"], ["district", "İlçe", "district"], ["park", "Park", "park"], ["type", "Tür", "equipmentType"], ["lastMaintenance", "Son bakım tarihi", "date"], ["priority", "Öncelik", "priority"], ["criticalReason", "Kritik durum nedeni", "textarea"], ["condition", "Durum", "status"]],
  },
  "Bakım Yönetimi": {
    key: "maintenance", title: "Bakım Yönetimi", eyebrow: "Gerçek kayıtlardan hesaplanan bakım performansı", icon: <Wrench />,
    columns: [["title", "Bakım"], ["park", "Park"], ["type", "Tür"], ["assignee", "Görevli"], ["due", "Termin"], ["priority", "Öncelik"], ["status", "Durum"]],
    fields: [["title", "Bakım başlığı", "text"], ["district", "İlçe", "district"], ["park", "Park", "park"], ["type", "Bakım türü", "maintenanceType"], ["assignee", "Görevli", "staffSelect"], ["start", "Başlangıç tarihi", "date"], ["due", "Planlanan bitiş", "date"], ["completedAt", "Tamamlanma tarihi", "date-optional"], ["priority", "Öncelik", "priority"], ["score", "Bakım puanı", "number"], ["criticalReason", "Kritik durum nedeni", "textarea"], ["status", "Durum", "status"]],
  },
  "Arıza Kayıtları": {
    key: "faults", title: "Arıza Kayıtları", eyebrow: "İlçe ve parka göre saha arızaları", icon: <CircleAlert />,
    columns: [["title", "Arıza"], ["district", "İlçe"], ["park", "Park"], ["category", "Kategori"], ["priority", "Öncelik"], ["status", "Durum"]],
    fields: [["title", "Arıza başlığı", "text"], ["district", "İlçe", "district"], ["park", "Park", "park"], ["category", "Arıza türü", "faultCategory"], ["date", "Kayıt tarihi", "date"], ["priority", "Öncelik", "priority"], ["criticalReason", "Kritik durum nedeni", "textarea"], ["status", "Durum", "status"], ["description", "Ayrıntılı açıklama", "textarea"]],
  },
  Görevler: {
    key: "tasks", title: "Görev Yönetimi", eyebrow: "Aktif, tamamlanan, gecikmiş ve kritik görevler", icon: <ClipboardCheck />,
    columns: [["title", "Görev"], ["park", "Park"], ["assignee", "Personel"], ["type", "Tür"], ["due", "Bitiş"], ["priority", "Öncelik"], ["status", "Durum"]],
    fields: [["title", "Görev başlığı", "text"], ["district", "İlçe", "district"], ["park", "Park", "park"], ["assignee", "Personel", "staffSelect"], ["type", "Görev türü", "taskType"], ["start", "Başlangıç", "date"], ["due", "Planlanan bitiş", "date"], ["completedAt", "Tamamlanma tarihi", "date-optional"], ["priority", "Öncelik", "priority"], ["criticalReason", "Kritik durum nedeni", "textarea"], ["status", "Durum", "status"]],
  },
  "Vatandaş Bildirimleri": {
    key: "reports", title: "Vatandaş Bildirimleri", eyebrow: "Vatandaşlardan gelen ayrıntılı mesajlar", icon: <CircleAlert />,
    columns: [["title", "Bildirim"], ["district", "İlçe"], ["park", "Park"], ["citizen", "Vatandaş"], ["category", "Kategori"], ["date", "Tarih"], ["status", "Durum"]],
    fields: [["title", "Bildirim başlığı", "text"], ["district", "İlçe", "district"], ["park", "Park", "park"], ["citizen", "Vatandaş", "text"], ["category", "Kategori", "reportCategory"], ["date", "Tarih", "date"], ["status", "Durum", "status"], ["description", "Mesajın tamamı", "textarea"]],
  },
  Personel: {
    key: "staff", title: "Kocaeli Saha Personeli", eyebrow: "Saha ve müsaitlik durumu otomatik güncellenir", icon: <UserRound />,
    columns: [["name", "Ad Soyad"], ["role", "Uzmanlık"], ["district", "İlçe"], ["activeTasks", "Aktif Görev"], ["status", "Durum"]],
    fields: [["name", "Ad soyad", "text"], ["role", "Uzmanlık", "staffRole"], ["district", "İlçe", "district"], ["status", "Durum", "status"]],
  },
  Etkinlikler: {
    key: "events", title: "Etkinlik Yönetimi", eyebrow: "Başlangıç ve bitiş zamanı doğrulanan etkinlikler", icon: <CalendarDays />,
    columns: [["title", "Etkinlik"], ["park", "Park"], ["type", "Tür"], ["startAt", "Başlangıç"], ["endAt", "Bitiş"], ["status", "Durum"]],
    fields: [["title", "Etkinlik adı", "text"], ["district", "İlçe", "district"], ["park", "Park", "park"], ["type", "Tür", "eventType"], ["startAt", "Başlangıç tarihi ve saati", "datetime-local"], ["endAt", "Bitiş tarihi ve saati", "datetime-local"], ["capacity", "Kapasite", "number"], ["status", "Durum", "status"]],
  },
};

export default function ModuleWorkspace({ active }: { active: string }) {
  if (active === "Harita") return <MapModule />;
  if (active === "Raporlar") return <ReportsModule />;
  if (active === "Sistem Ayarları") return <SettingsModule />;
  if (active === "Destek Merkezi") return <SupportModule />;
  return <CrudModule key={active} config={configs[active] ?? configs.Parklar} />;
}

function CrudModule({ config }: { config: Config }) {
  const { data, loading, error, refresh, createRow, updateRow, removeRow } = useOperations();
  const rows = data[config.key];
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [assignmentStaff, setAssignmentStaff] = useState<Row | null>(null);
  const [toast, setToast] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [priorityFilter, setPriorityFilter] = useState("Tümü");
  const [districtFilter, setDistrictFilter] = useState("Tümü");
  const [parkFilter, setParkFilter] = useState("Tümü");
  const [detailFilter, setDetailFilter] = useState("Tümü");
  const [archiveFilter, setArchiveFilter] = useState("Güncel");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const hasParkFilter = ["parks", "equipment", "maintenance", "faults", "tasks", "reports", "events"].includes(config.key);
  const detailKey = ({ equipment: "type", maintenance: "type", faults: "category", tasks: "type", reports: "category", staff: "role", events: "type" } as Record<string, string>)[config.key];
  const statusOptions = useMemo(() => ["Tümü", ...new Set(rows.map(row => displayStatus(config.key, row)).filter(Boolean))], [rows, config.key]);
  const parkOptions = useMemo(() => {
    if (!hasParkFilter) return [];
    const names = [
      ...KOCAELI_PARKS.filter(park => districtFilter === "Tümü" || park.district === districtFilter).map(park => park.name),
      ...rows.filter(row => districtFilter === "Tümü" || districtForRow(row) === districtFilter).map(row => String(config.key === "parks" ? row.name : row.park ?? "")),
    ].filter(Boolean);
    return ["Tümü", ...new Set(names)];
  }, [rows, config.key, districtFilter, hasParkFilter]);
  const detailOptions = useMemo(() => detailKey ? ["Tümü", ...new Set(rows.map(row => String(row[detailKey] ?? "")).filter(Boolean))] : [], [rows, detailKey]);

  const filtered = useMemo(() => rows.filter(row => {
    const text = Object.values(row).join(" ").toLocaleLowerCase("tr");
    const status = displayStatus(config.key, row);
    const date = recordDate(row);
    const archived = Boolean(row.archived) || isCompleted(row);
    return text.includes(query.toLocaleLowerCase("tr"))
      && (statusFilter === "Tümü" || status === statusFilter)
      && (priorityFilter === "Tümü" || (priorityFilter === "Kritik" ? isCritical(row) : priorityFilter === "Kritik Değil" ? !isCritical(row) : String(row.priority ?? "") === priorityFilter))
      && (districtFilter === "Tümü" || districtForRow(row) === districtFilter)
      && (parkFilter === "Tümü" || String(config.key === "parks" ? row.name : row.park ?? "") === parkFilter)
      && (!detailKey || detailFilter === "Tümü" || String(row[detailKey] ?? "") === detailFilter)
      && (archiveFilter === "Tümü" || (archiveFilter === "Arşiv" ? archived : !archived))
      && (!dateFrom || !date || date >= dateFrom)
      && (!dateTo || !date || date <= dateTo);
  }), [rows, query, statusFilter, priorityFilter, districtFilter, parkFilter, detailFilter, detailKey, archiveFilter, dateFrom, dateTo, config.key]);

  const activeCount = rows.filter(row => isActive(row) || row.status === "Aktif" || row.status === "Yayında").length;
  const pendingCount = rows.filter(row => !isCompleted(row) && ["Bekliyor", "Atandı", "Bakım Gerekli", "Arızalı", "Taslak"].includes(displayStatus(config.key, row))).length;
  const criticalCount = rows.filter(isCritical).length;
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pagedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };

  const save = async (record: Record<string, string | number | boolean>) => {
    try {
      if (editing) await updateRow(config.key, editing.id, { ...editing, ...record });
      else await createRow(config.key, { ...(config.key === "parks" ? { score: 0 } : {}), archived: false, ...record });
      setModalOpen(false);
      setEditing(null);
      flash(editing ? "Kayıt güncellendi ve ilgili ekranlara yansıtıldı." : "Yeni kayıt oluşturuldu.");
    } catch {
      flash("Kayıt veritabanına yazılamadı.");
    }
  };

  return <section className="module-workspace">
    {toast && <div className="app-toast"><Check size={16} />{toast}</div>}
    {error && <div className="api-error"><CircleAlert size={17} /><span><strong>Veritabanı bağlantısı kurulamadı.</strong>{error}</span><button onClick={() => void refresh()}>Tekrar dene</button></div>}
    <ModuleHeader icon={config.icon} title={config.title} eyebrow={`${rows.length} kayıt · ${criticalCount} kritik`}>
      <button className="primary-btn" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} />{config.key === "parks" ? "Yeni park ekle" : config.key === "maintenance" ? "Yeni bakım oluştur" : "Yeni kayıt"}</button>
    </ModuleHeader>
    <div className="module-kpis">
      <MiniKpi label="Toplam kayıt" value={String(rows.length)} tone="green" />
      <MiniKpi label={config.key === "staff" ? "Sahada" : "Aktif"} value={String(config.key === "staff" ? rows.filter(row => row.status === "Sahada").length : activeCount)} tone="blue" />
      <MiniKpi label={config.key === "staff" ? "Müsait" : "Kritik / bekleyen"} value={String(config.key === "staff" ? rows.filter(row => row.status === "Müsait").length : criticalCount || pendingCount)} tone="orange" />
    </div>
    <article className="data-card">
      <div className="data-toolbar">
        <div className="table-search"><Search size={16} /><input value={query} onChange={event => {setQuery(event.target.value);setCurrentPage(1);}} placeholder={config.key === "staff" ? "Görevli adına göre ara..." : "Kayıt adına göre ara..."} /></div>
        <div className="toolbar-filters">
          <FilterSelect label="Arşiv görünümü" value={archiveFilter} onChange={value=>{setArchiveFilter(value);setCurrentPage(1);}} options={["Güncel", "Arşiv", "Tümü"]} firstLabel="Güncel kayıtlar" icon={<Archive size={15} />} />
          <FilterSelect label="İlçeye göre filtrele" value={districtFilter} onChange={value => { setDistrictFilter(value); setParkFilter("Tümü"); setCurrentPage(1); }} options={["Tümü", ...KOCAELI_DISTRICTS]} firstLabel="Tüm ilçeler" icon={<MapPin size={15} />} />
          {hasParkFilter && <FilterSelect label="Park adına göre filtrele" value={parkFilter} onChange={value=>{setParkFilter(value);setCurrentPage(1);}} options={parkOptions} firstLabel="Tüm parklar" icon={<TreePine size={15} />} />}
          {detailKey && <FilterSelect label="Tür filtresi" value={detailFilter} onChange={value=>{setDetailFilter(value);setCurrentPage(1);}} options={detailOptions} firstLabel="Tüm türler" />}
          {["parks", "equipment", "maintenance", "faults", "tasks"].includes(config.key) && <FilterSelect label="Öncelik filtresi" value={priorityFilter} onChange={value=>{setPriorityFilter(value);setCurrentPage(1);}} options={["Tümü", "Kritik", "Kritik Değil", "Yüksek", "Orta", "Düşük"]} firstLabel="Tüm öncelikler" icon={<CircleAlert size={15} />} />}
          <FilterSelect label="Durum filtresi" value={statusFilter} onChange={value=>{setStatusFilter(value);setCurrentPage(1);}} options={statusOptions} firstLabel="Tüm durumlar" />
          <label className="filter-date">Başlangıç<input type="date" value={dateFrom} onChange={event => {setDateFrom(event.target.value);setCurrentPage(1);}} /></label>
          <label className="filter-date">Bitiş<input type="date" min={dateFrom} value={dateTo} onChange={event => {setDateTo(event.target.value);setCurrentPage(1);}} /></label>
        </div>
      </div>
      <div className="table-scroll"><table><thead><tr>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>İşlemler</th></tr></thead><tbody>
        {pagedRows.map(row => <tr key={row.id} className={isCritical(row) ? "critical-row" : ""}>{config.columns.map(([key]) => <td key={key}>{renderCell(key, row, config.key)}</td>)}<td><div className="row-actions">
          <button aria-label="Ayrıntıyı gör" title="Ayrıntıyı gör" onClick={() => setViewing(row)}><Eye size={15} /></button>
          {config.key === "staff" && row.status === "Müsait" && <button aria-label="Görev ata" title="Aktif göreve ata" onClick={() => setAssignmentStaff(row)}><ClipboardCheck size={15} /></button>}
          <button aria-label="Düzenle" title="Düzenle" onClick={() => { setEditing(row); setModalOpen(true); }}><Pencil size={15} /></button>
          <button aria-label="Arşivle veya geri al" title="Arşivle veya geri al" onClick={() => void updateRow(config.key, row.id, { ...row, archived: !Boolean(row.archived) }).then(() => flash(Boolean(row.archived) ? "Kayıt arşivden çıkarıldı." : "Kayıt arşivlendi."))}><Archive size={15} /></button>
          <button aria-label="Sil" title="Sil" onClick={() => { if (window.confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?")) void removeRow(config.key, row.id).then(() => flash("Kayıt silindi.")); }}><Trash2 size={15} /></button>
        </div></td></tr>)}
      </tbody></table>
        {!loading && filtered.length === 0 && <div className="empty-table"><Search /><strong>Filtrelere uygun kayıt yok</strong><span>Filtreleri temizleyin veya yeni kayıt oluşturun.</span></div>}
        {loading && <div className="empty-table"><span className="api-loader" /><strong>Veriler yükleniyor</strong><span>MySQL kayıtları getiriliyor.</span></div>}
      </div>
      <div className="table-footer"><span>{filtered.length===0?"0 kayıt":`${(safePage-1)*pageSize+1}-${Math.min(safePage*pageSize,filtered.length)} arası gösteriliyor · Toplam ${filtered.length} kayıt`}</span><div className="pagination-controls"><button type="button" disabled={safePage===1} onClick={()=>setCurrentPage(page=>Math.max(1,page-1))}>Önceki</button>{Array.from({length:pageCount},(_,index)=>index+1).map(page=><button type="button" key={page} className={page===safePage?"current":""} aria-label={`${page}. sayfayı aç`} onClick={()=>setCurrentPage(page)}>{page}</button>)}<button type="button" disabled={safePage===pageCount} onClick={()=>setCurrentPage(page=>Math.min(pageCount,page+1))}>Sonraki</button></div><button type="button" onClick={() => { setQuery(""); setStatusFilter("Tümü"); setPriorityFilter("Tümü"); setDistrictFilter("Tümü"); setParkFilter("Tümü"); setDetailFilter("Tümü"); setArchiveFilter("Güncel"); setDateFrom(""); setDateTo(""); setCurrentPage(1); }}>Filtreleri temizle</button></div>
    </article>
    {modalOpen && <RecordModal config={config} initial={editing} staff={data.staff} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={save} />}
    {viewing && <DetailModal row={viewing} onClose={() => setViewing(null)} />}
    {assignmentStaff && <AssignmentModal staff={assignmentStaff} onClose={() => setAssignmentStaff(null)} onSave={async record => { await createRow("tasks", record); setAssignmentStaff(null); flash(`${assignmentStaff.name} göreve atandı ve durumu Sahada oldu.`); }} />}
  </section>;
}

function RecordModal({ config, initial, staff, onClose, onSave }: { config: Config; initial: Row | null; staff: Row[]; onClose: () => void; onSave: (row: Record<string, string | number | boolean>) => void | Promise<void> }) {
  const initialDistrict = String(initial?.district ?? KOCAELI_PARKS.find(park => park.name === initial?.park)?.district ?? "");
  const [district, setDistrict] = useState(initialDistrict);
  const [selectedPark, setSelectedPark] = useState(String(initial?.park ?? ""));
  const [startAt, setStartAt] = useState(String(initial?.startAt ?? ""));
  const [endAt, setEndAt] = useState(String(initial?.endAt ?? ""));
  const [validation, setValidation] = useState("");
  const districtParks = useMemo(() => district ? parksForDistrict(district) : [], [district]);
  const availableStaff = staff.filter(row => row.status === "Müsait" || row.name === initial?.assignee);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (config.key === "events" && (!startAt || !endAt || new Date(endAt) <= new Date(startAt))) {
      setValidation("Bitiş zamanı başlangıç zamanından sonra olmalıdır.");
      return;
    }
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    void onSave({ ...values, ...(config.key === "events" ? { startAt, endAt } : {}) });
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="record-modal" onSubmit={submit}>
      <div className="modal-head"><div><strong>{initial ? "Kaydı düzenle" : config.key === "parks" ? "Yeni park ekle" : "Yeni kayıt oluştur"}</strong><span>{config.title}</span></div><button type="button" onClick={onClose} aria-label="Kapat"><X /></button></div>
      <div className="modal-fields">{config.fields.map(([key, label, type]) => <label key={key} className={type === "textarea" ? "wide" : ""}>{label}
        {type === "district" ? <select name={key} required value={district} onChange={event => { setDistrict(event.target.value); setSelectedPark(""); }}><option value="" disabled>İlçe seçin</option>{KOCAELI_DISTRICTS.map(item => <option key={item}>{item}</option>)}<option>Diğer</option></select>
          : type === "park" ? <select name={key} required value={selectedPark} onChange={event => setSelectedPark(event.target.value)} disabled={!district}><option value="" disabled>{district ? "Park seçin" : "Önce ilçe seçin"}</option>{districtParks.map(park => <option key={park.name}>{park.name}</option>)}<option>Diğer</option></select>
            : type === "equipmentType" ? <OptionSelect name={key} value={initial?.[key]} placeholder="Ekipman türü seçin" options={EQUIPMENT_TYPES} />
              : type === "staffSelect" ? <OptionSelect name={key} value={initial?.[key]} placeholder={availableStaff.length ? "Müsait personel seçin" : "Müsait personel yok"} options={availableStaff.map(row => String(row.name))} />
                : SELECT_OPTIONS[type] ? <OptionSelect name={key} value={initial?.[key]} placeholder={`${label} seçin`} options={SELECT_OPTIONS[type]} />
                  : type === "status" ? <select name={key} required defaultValue={String(initial?.[key] ?? defaultStatus(config.key))}>{STATUS_OPTIONS[config.key].map(option => <option key={option}>{option}</option>)}</select>
                    : type === "textarea" ? <textarea name={key} rows={4} defaultValue={String(initial?.[key] ?? "")} placeholder="Ayrıntılı açıklama yazın." />
                      : type === "datetime-local" ? <input name={key} type="datetime-local" required value={key === "startAt" ? startAt : endAt} min={key === "endAt" ? startAt : undefined} onChange={event => key === "startAt" ? (setStartAt(event.target.value), endAt && new Date(endAt) <= new Date(event.target.value) && setEndAt("")) : setEndAt(event.target.value)} />
                        : <input name={key} type={type === "number-step" ? "number" : type.replace("-optional", "")} step={type === "number-step" ? "any" : undefined} required={!type.endsWith("-optional")} defaultValue={String(initial?.[key] ?? "")} />}
      </label>)}</div>
      {config.key === "events" && startAt && endAt && <p className="date-preview"><CalendarDays size={16} />{formatDateTime(startAt)} → {formatDateTime(endAt)}</p>}
      {validation && <p className="form-validation"><CircleAlert size={16} />{validation}</p>}
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Vazgeç</button><button className="primary-btn" type="submit"><Check size={16} />{initial ? "Değişiklikleri kaydet" : "Kaydı oluştur"}</button></div>
    </form>
  </div>;
}

function AssignmentModal({ staff, onClose, onSave }: { staff: Row; onClose: () => void; onSave: (row: Omit<Row, "id">) => Promise<void> }) {
  const [district, setDistrict] = useState(String(staff.district ?? ""));
  const [park, setPark] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    void onSave({ ...values, assignee: staff.name, district, park, status: "Atandı", completedAt: "", archived: false });
  };
  return <div className="modal-backdrop"><form className="record-modal" onSubmit={submit}><div className="modal-head"><div><strong>Aktif göreve ata</strong><span>{staff.name} · Müsait</span></div><button type="button" onClick={onClose}><X /></button></div><div className="modal-fields">
    <label>Görev başlığı<input name="title" required /></label>
    <label>Görev türü<OptionSelect name="type" placeholder="Görev türü seçin" options={SELECT_OPTIONS.taskType} /></label>
    <label>İlçe<select required value={district} onChange={event => { setDistrict(event.target.value); setPark(""); }}>{KOCAELI_DISTRICTS.map(item => <option key={item}>{item}</option>)}</select></label>
    <label>Park<select required value={park} onChange={event => setPark(event.target.value)}><option value="" disabled>Park seçin</option>{parksForDistrict(district).map(item => <option key={item.name}>{item.name}</option>)}</select></label>
    <label>Başlangıç<input name="start" type="date" required defaultValue={today()} /></label>
    <label>Planlanan bitiş<input name="due" type="date" required min={today()} /></label>
    <label>Öncelik<OptionSelect name="priority" placeholder="Öncelik seçin" options={SELECT_OPTIONS.priority} /></label>
    <label className="wide">Açıklama<textarea name="criticalReason" rows={3} /></label>
  </div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Vazgeç</button><button className="primary-btn"><ClipboardCheck size={16} />Görevi ata</button></div></form></div>;
}

function DetailModal({ row, onClose }: { row: Row; onClose: () => void }) {
  const mapsUrl = row.latitude && row.longitude ? `https://www.google.com/maps/search/?api=1&query=${row.latitude},${row.longitude}` : "";
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><article className="record-modal detail-modal">
    <div className="modal-head"><div><strong>{row.title ?? row.name}</strong><span>Kayıt ayrıntısı · #{row.id}</span></div><button type="button" onClick={onClose}><X /></button></div>
    <div className="detail-grid">{Object.entries(row).filter(([key]) => !["id", "archived"].includes(key)).map(([key, value]) => <div className={["description", "detail", "criticalReason", "amenities", "address"].includes(key) ? "wide" : ""} key={key}><span>{fieldLabel(key)}</span><strong>{formatValue(key, value)}</strong></div>)}</div>
    {isCritical(row) && <div className="critical-explanation"><CircleAlert /><div><strong>Kritik kayıt</strong><p>{row.criticalReason || "Bakım öncelik puanı kritik eşiği aştı."}</p></div></div>}
    <div className="modal-actions">{mapsUrl && <a className="primary-btn" href={mapsUrl} target="_blank" rel="noreferrer"><MapPin size={16} />Konuma git</a>}<button className="secondary-btn" type="button" onClick={onClose}>Kapat</button></div>
  </article></div>;
}

function MapModule() {
  const { data } = useOperations();
  return <section className="module-workspace"><ModuleHeader icon={<MapPin />} title="Kocaeli Park Haritası" eyebrow={`${data.parks.length} park · ${new Set(data.parks.map(row => row.district)).size} ilçe kapsamı`}><span className="admin-only">Yakınlaştırma ve sürükleme aktif</span></ModuleHeader><div className="map-summary"><span><i className="green-dot" /> Envanter görünümü</span><span><i className="amber-dot" /> Bakım gerekli</span><span><i className="red-dot" /> Kritik</span></div><article className="full-map card"><ParkMap /></article></section>;
}

function ReportsModule() {
  const { data } = useOperations();
  const [reportType, setReportType] = useState("Tüm Kayıtlar");
  const [province, setProvince] = useState("Kocaeli");
  const [district, setDistrict] = useState("Tümü");
  const [status, setStatus] = useState("Tümü");
  const [maintenanceType, setMaintenanceType] = useState("Tümü");
  const [taskType, setTaskType] = useState("Tümü");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState("");
  const [reportPage, setReportPage] = useState(1);

  const source = useMemo(() => {
    const selected = reportType === "Bakım" ? data.maintenance : reportType === "Görev" ? data.tasks : reportType === "Park" ? data.parks : [...data.maintenance, ...data.tasks, ...data.parks];
    return selected.filter(row => {
      const date = recordDate(row);
      return (district === "Tümü" || districtForRow(row) === district)
        && (status === "Tümü" || displayStatus("maintenance", row) === status)
        && (maintenanceType === "Tümü" || row.type === maintenanceType)
        && (taskType === "Tümü" || row.type === taskType)
        && (!dateFrom || !date || date >= dateFrom)
        && (!dateTo || !date || date <= dateTo);
    });
  }, [data, reportType, district, status, maintenanceType, taskType, dateFrom, dateTo]);

  const chartData = KOCAELI_DISTRICTS.map(name => ({
    name,
    bakım: data.maintenance.filter(row => districtForRow(row) === name && (district === "Tümü" || district === name)).length,
    görev: data.tasks.filter(row => districtForRow(row) === name && (district === "Tümü" || district === name)).length,
  })).filter(item => item.bakım || item.görev);
  const filters = [`Rapor: ${reportType}`, `İl: ${province}`, `İlçe: ${district}`, `Durum: ${status}`, `Bakım türü: ${maintenanceType}`, `Görev türü: ${taskType}`, `Tarih: ${dateFrom || "Başlangıç yok"} - ${dateTo || "Bitiş yok"}`];
  const reportRows = source.map(row => [
    String(row.id),
    String(row.title ?? row.name ?? "-"),
    districtForRow(row) || "-",
    String(row.park ?? row.name ?? "-"),
    String(row.type ?? "Park"),
    displayStatus("maintenance", row) || "-",
    String(row.priority ?? (isCritical(row) ? "Kritik" : "-")),
    recordDate(row) || "-",
  ]);
  const reportHeaders = ["Kayıt No", "Kayıt", "İlçe", "Park", "Tür", "Durum", "Öncelik", "Tarih"];
  const fileStamp = new Date().toISOString().slice(0, 10);
  const reportPageCount = Math.max(1, Math.ceil(source.length / 10));
  const currentReportPage = Math.min(reportPage, reportPageCount);
  const visibleReportRows = source.slice((currentReportPage - 1) * 10, currentReportPage * 10);
  const downloadPdf = () => {
    downloadTablePdf({
      headers: reportHeaders,
      rows: reportRows,
      metadata: [
        `Rapor: ${reportType}`,
        `Konum: ${province} / ${district}`,
        `Durum: ${status}`,
        `Tarih: ${dateFrom || "Tum tarihler"} - ${dateTo || "Tum tarihler"}`,
      ],
      summary: `Toplam: ${source.length}   Kritik: ${source.filter(isCritical).length}   Tamamlanan: ${source.filter(isCompleted).length}`,
      filename: `ko-park-${slug(reportType)}-${fileStamp}.pdf`,
    });
    setToast("Seçili filtrelere ait PDF raporu indirildi.");
    window.setTimeout(() => setToast(""), 2500);
  };
  const downloadCsv = () => {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const content = [reportHeaders, ...reportRows].map(row => row.map(escape).join(";")).join("\r\n");
    downloadBlob(`\uFEFF${content}`, "text/csv;charset=utf-8", `ko-park-${slug(reportType)}-${fileStamp}.csv`);
    setToast("Düzenli CSV raporu indirildi.");
    window.setTimeout(() => setToast(""), 2500);
  };
  const downloadExcel = () => {
    const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const filterRows = filters.map(item => `<tr><td colspan="${reportHeaders.length}">${escape(item)}</td></tr>`).join("");
    const headers = reportHeaders.map(header => `<th>${escape(header)}</th>`).join("");
    const rows = reportRows.map(row => `<tr>${row.map(value => `<td>${escape(value)}</td>`).join("")}</tr>`).join("");
    const workbook = `<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Arial}th{background:#0b3a55;color:#fff}th,td{border:1px solid #cbd8d1;padding:7px}tr:nth-child(even){background:#f5faf7}h1{color:#0b3a55}</style></head><body><h1>KO-PARK Operasyon Raporu</h1><p>Oluşturulma: ${new Date().toLocaleString("tr-TR")}</p><table>${filterRows}<tr><td colspan="${reportHeaders.length}"><b>Toplam: ${source.length} · Kritik: ${source.filter(isCritical).length} · Tamamlanan: ${source.filter(isCompleted).length}</b></td></tr><tr>${headers}</tr>${rows}</table></body></html>`;
    downloadBlob(`\uFEFF${workbook}`, "application/vnd.ms-excel;charset=utf-8", `ko-park-${slug(reportType)}-${fileStamp}.xls`);
    setToast("Biçimlendirilmiş Excel raporu indirildi.");
    window.setTimeout(() => setToast(""), 2500);
  };

  return <section className="module-workspace">
    {toast && <div className="app-toast"><Check size={16} />{toast}</div>}
    <ModuleHeader icon={<FileSpreadsheet />} title="Raporlar ve Analiz" eyebrow="Filtrelenebilir canlı operasyon raporu"><button className="secondary-btn" onClick={downloadCsv}><FileSpreadsheet size={15} />CSV</button><button className="secondary-btn" onClick={downloadExcel}><FileSpreadsheet size={15} />Excel</button><button className="primary-btn" onClick={downloadPdf}><FileText size={15} />PDF</button></ModuleHeader>
    <article className="data-card report-filter-card"><div className="toolbar-filters">
      <FilterSelect label="Rapor türü" value={reportType} onChange={setReportType} options={["Tüm Kayıtlar", "Bakım", "Görev", "Park"]} firstLabel="Tüm kayıtlar" />
      <FilterSelect label="İl" value={province} onChange={setProvince} options={["Kocaeli"]} firstLabel="Kocaeli" icon={<MapPin size={15} />} />
      <FilterSelect label="İlçe" value={district} onChange={setDistrict} options={["Tümü", ...KOCAELI_DISTRICTS]} firstLabel="Tüm ilçeler" />
      <FilterSelect label="Durum" value={status} onChange={setStatus} options={["Tümü", "Bekliyor", "Atandı", "Devam Ediyor", "Tamamlandı", "Aktif", "Bakım Gerekli"]} firstLabel="Tüm durumlar" />
      <FilterSelect label="Bakım türü" value={maintenanceType} onChange={setMaintenanceType} options={["Tümü", ...SELECT_OPTIONS.maintenanceType]} firstLabel="Tüm bakım türleri" />
      <FilterSelect label="Görev türü" value={taskType} onChange={setTaskType} options={["Tümü", ...SELECT_OPTIONS.taskType]} firstLabel="Tüm görev türleri" />
      <label className="filter-date">Başlangıç<input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} /></label>
      <label className="filter-date">Bitiş<input type="date" min={dateFrom} value={dateTo} onChange={event => setDateTo(event.target.value)} /></label>
    </div></article>
    <div className="module-kpis"><MiniKpi label={`${province} toplam park`} value={String(data.parks.filter(row => district === "Tümü" || row.district === district).length)} tone="green" /><MiniKpi label="Aktif / tamamlanan bakım" value={`${data.maintenance.filter(isActive).length} / ${data.maintenance.filter(isCompleted).length}`} tone="blue" /><MiniKpi label="Kritik kayıt" value={String(source.filter(isCritical).length)} tone="orange" /></div>
    <article className="data-card report-preview"><div className="card-head"><div><h3>Rapor ön izlemesi</h3><p>{reportType} · {province} / {district} · {status === "Tümü" ? "Tüm durumlar" : status} · {dateFrom || "Başlangıç yok"} — {dateTo || "Bitiş yok"}</p></div><strong>{source.length} kayıt</strong></div><div className="table-scroll"><table className="report-table"><thead><tr><th>No</th><th>Kayıt bilgisi</th><th>Konum</th><th>Tür</th><th>Durum</th><th>Öncelik</th><th>Tarih</th></tr></thead><tbody>{visibleReportRows.map(row => <tr key={`${row.title ?? row.name}-${row.id}`} className={isCritical(row) ? "critical-row" : ""}><td><span className="report-id">#{row.id}</span></td><td><span className="report-record"><strong>{row.title ?? row.name}</strong><small>{row.park && row.park !== row.title ? String(row.park) : "Park kaydı"}</small></span></td><td><span className="report-location"><strong>{districtForRow(row) || "-"}</strong><small>{province}</small></span></td><td>{row.type ?? "Park"}</td><td><span className={`table-status ${slug(displayStatus("maintenance", row))}`}>{displayStatus("maintenance", row) || "-"}</span></td><td><span className={`table-status ${slug(String(row.priority ?? (isCritical(row) ? "Kritik" : "Normal")))}`}>{row.priority ?? (isCritical(row) ? "Kritik" : "Normal")}</span></td><td>{recordDate(row) || "-"}</td></tr>)}</tbody></table>{source.length === 0 && <div className="empty-table"><FileSpreadsheet /><strong>Filtreye uygun kayıt yok</strong><span>Filtre seçimlerini değiştirerek tekrar deneyin.</span></div>}</div>{source.length > 0 && <div className="table-footer"><span>{source.length} kayıttan {(currentReportPage - 1) * 10 + 1}–{Math.min(currentReportPage * 10, source.length)} arası gösteriliyor</span><div><button disabled={currentReportPage === 1} onClick={() => setReportPage(Math.max(1, currentReportPage - 1))}>Önceki</button><button className="current">{currentReportPage} / {reportPageCount}</button><button disabled={currentReportPage === reportPageCount} onClick={() => setReportPage(Math.min(reportPageCount, currentReportPage + 1))}>Sonraki</button></div></div>}</article>
    <article className="data-card report-chart-card"><div className="card-head"><div><h3>{district === "Tümü" ? "Kocaeli ilçe bazlı operasyonlar" : `${district} operasyonları`}</h3><p>Filtre seçimine göre güncellenen bakım ve görev grafiği</p></div></div><div className="report-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid vertical={false} stroke="#e7edf1" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="bakım" fill="#159b62" radius={[5, 5, 0, 0]} /><Bar dataKey="görev" fill="#163f5c" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
  </section>;
}

function SupportModule() {
  const [faq, setFaq] = useState<number | null>(0);
  const faqs = [
    ["Park kaydı nasıl eklenir?", "Parklar sayfasındaki “Yeni park ekle” düğmesini kullanın."],
    ["Görevli nasıl atanır?", "Personel sayfasında müsait görevlinin yanındaki görev ikonuna basın."],
    ["PDF, Excel veya CSV raporu nasıl alınır?", "Raporlar sayfasında istediğiniz filtreleri seçtikten sonra sağ üstteki PDF, Excel veya CSV düğmesini kullanın."],
    ["Bakım öncelik puanı neyi gösterir?", "Puan; son bakım tarihi, vatandaş bildirimleri, aktif arızalar, ekipman durumu ve park yoğunluğuna göre 0–100 arasında hesaplanır."],
    ["Kritik parkları nasıl görüntülerim?", "Genel Bakış ekranındaki “Kritik bakım gereken parklar” alanını veya Parklar sayfasındaki kritik durum filtresini kullanın."],
    ["Bir kaydın durumunu nasıl değiştiririm?", "İlgili modülde kayıt satırındaki düzenle simgesine basın ve durum listesinden yeni değeri seçerek kaydedin."],
    ["Haritada nasıl yakınlaştırma yapılır?", "Haritanın sol üstündeki artı ve eksi düğmelerini ya da fare tekerleğini kullanabilirsiniz. Haritayı sürükleyerek farklı bölgelere geçebilirsiniz."],
    ["Vatandaş bildirimleri nerede görünür?", "Vatandaşların giriş yapmadan gönderdiği mesajlar “Vatandaş Bildirimleri” sayfasına düşer; yeni kayıt varsa menüde bildirim sayısı görünür."],
  ];
  return <section className="module-workspace">
    <ModuleHeader icon={<CircleHelp />} title="Destek Merkezi" eyebrow="KO-PARK kullanım soruları ve açıklamalar"><span className="admin-only">Soru · Cevap</span></ModuleHeader>
    <article className="settings-card support-faq-card"><div className="support-faq-intro"><CircleHelp/><div><h3>Sık sorulan sorular</h3><p>Bir soruya tıklayarak açıklamasını görüntüleyebilirsiniz.</p></div></div>{faqs.map(([question, answer], index) => <button className={`faq-row ${faq === index ? "open" : ""}`} key={question} onClick={() => setFaq(faq === index ? null : index)}><strong>{question}</strong><ChevronDown />{faq === index && <span>{answer}</span>}</button>)}</article>
  </section>;
}

function SettingsModule() {
  const [saved, setSaved] = useState(false);
  return <section className="module-workspace"><ModuleHeader icon={<Settings />} title="Sistem Ayarları" eyebrow="Kocaeli genel yapılandırması ve puanlama"><span className="admin-only">Yalnızca Admin</span></ModuleHeader><form className="settings-grid" onSubmit={event => { event.preventDefault(); setSaved(true); window.setTimeout(() => setSaved(false), 2200); }}><article className="settings-card"><h3>Genel bilgiler</h3><label>Belediye adı<input defaultValue="Kocaeli Büyükşehir Belediyesi" /></label><label>Destek e-postası<input type="email" defaultValue="parkbahceler@kocaeli.local" /></label><label>Varsayılan bölge<select defaultValue="Europe/Istanbul"><option>Europe/Istanbul</option></select></label></article><article className="settings-card"><h3>Bakım öncelik ağırlıkları</h3><Weight label="Son bakım tarihi" value="25" /><Weight label="Vatandaş bildirimleri" value="25" /><Weight label="Aktif arızalar" value="20" /><Weight label="Ekipman durumu" value="20" /><Weight label="Park yoğunluğu" value="10" /></article><article className="settings-card wide"><h3>Bildirim kanalları</h3><Toggle label="Dashboard bildirimleri" checked /><Toggle label="E-posta bildirimleri" checked /><Toggle label="Push bildirimleri" /></article><div className="settings-submit"><button className="primary-btn"><Check size={16} />{saved ? "Kaydedildi" : "Ayarları kaydet"}</button></div></form></section>;
}

function ModuleHeader({ icon, title, eyebrow, children }: { icon: ReactNode; title: string; eyebrow: string; children: ReactNode }) {
  return <div className="module-header"><div className="module-heading-icon">{icon}</div><div><p>{eyebrow}</p><h2>{title}</h2></div><div className="module-header-actions">{children}</div></div>;
}
function FilterSelect({ label, value, onChange, options, firstLabel, icon }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; firstLabel: string; icon?: ReactNode }) {
  return <label className="filter-select" aria-label={label}>{icon ?? <Filter size={15} />}<select value={value} onChange={event => onChange(event.target.value)}>{options.map((option, index) => <option key={`${option}-${index}`} value={option}>{index === 0 ? firstLabel : option}</option>)}</select><ChevronDown size={14} /></label>;
}
function OptionSelect({ name, value, placeholder, options }: { name: string; value?: string | number | boolean; placeholder: string; options: string[] }) {
  return <select name={name} required defaultValue={String(value ?? "")}><option value="" disabled>{placeholder}</option>{options.map(option => <option key={option}>{option}</option>)}</select>;
}
function MiniKpi({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className={`mini-kpi ${tone}`}><span>{label}</span><strong>{value}</strong></div>; }
function Weight({ label, value }: { label: string; value: string }) { return <label>{label}<div className="weight-input"><input type="number" min="0" max="100" defaultValue={value} /><span>%</span></div></label>; }
function Toggle({ label, checked = false }: { label: string; checked?: boolean }) { return <label className="toggle-row"><span>{label}</span><input type="checkbox" defaultChecked={checked} /><i /></label>; }
function districtForRow(row: Row) { return String(row.district ?? KOCAELI_PARKS.find(park => park.name === row.park)?.district ?? ""); }
function slug(value: string) { return value.toLocaleLowerCase("tr").replaceAll(" ", "-").replaceAll("ı", "i").replaceAll("ş", "s").replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("ü", "u").replaceAll("ö", "o"); }
function defaultStatus(key: ModuleKey) { return key === "parks" ? "Aktif" : key === "equipment" ? "İyi" : key === "events" ? "Taslak" : key === "staff" ? "Müsait" : key === "support" ? "Açık" : "Bekliyor"; }
function displayStatus(key: ModuleKey, row: Row) { return String(key === "equipment" ? row.condition ?? "" : row.status ?? ""); }
function recordDate(row: Row) { return String(row.startAt ?? row.start ?? row.date ?? row.due ?? row.createdAt ?? "").slice(0, 10); }
function today() { return new Date().toISOString().slice(0, 10); }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date); }
function formatValue(key: string, value: string | number | boolean) { if (key === "startAt" || key === "endAt" || key === "createdAt") return formatDateTime(String(value)); if (typeof value === "boolean") return value ? "Evet" : "Hayır"; return String(value || "Belirtilmedi"); }
function fieldLabel(key: string) { return ({ name: "Ad", title: "Başlık", district: "İlçe", neighborhood: "Mahalle", address: "Açık adres", latitude: "Enlem", longitude: "Boylam", hours: "Çalışma saatleri", amenities: "İmkânlar", park: "Park", status: "Durum", condition: "Durum", priority: "Öncelik", score: "Bakım puanı", criticalReason: "Kritik durum nedeni", description: "Açıklama", assignee: "Görevli", start: "Başlangıç", due: "Planlanan bitiş", completedAt: "Tamamlanma", startAt: "Başlangıç", endAt: "Bitiş", type: "Tür", category: "Kategori", occupancy: "Doluluk", capacity: "Kapasite", detail: "Detay", role: "Uzmanlık", activeTasks: "Aktif görev", date: "Tarih" } as Record<string, string>)[key] ?? key; }
function renderCell(key: string, row: Row, module: ModuleKey) {
  const value = key === "status" || key === "condition" ? displayStatus(module, row) : row[key];
  if (key === "status" || key === "condition") return <span className={`table-status ${slug(String(value))}`}>{value}</span>;
  if (key === "priority") return <span className={`table-status ${slug(String(value))}`}>{value || (isCritical(row) ? "Kritik" : "-")}</span>;
  if (key === "score") return <strong className={`score-inline ${isCritical(row) ? "critical" : Number(value) > 59 ? "medium" : "normal"}`}>{value}/100</strong>;
  if (key === "occupancy") return <span>%{value}</span>;
  if (key === "startAt" || key === "endAt") return <span>{formatDateTime(String(value))}</span>;
  if (key === "due" && isOverdue(row)) return <span className="overdue-date">{value} · Gecikmiş</span>;
  return <span>{String(value ?? "-")}</span>;
}

function downloadTablePdf({ headers, rows, metadata, summary, filename }: { headers: string[]; rows: string[][]; metadata: string[]; summary: string; filename: string }) {
  const clean = (value: string) => value
    .replaceAll("ı", "i").replaceAll("İ", "I").replaceAll("ş", "s").replaceAll("Ş", "S")
    .replaceAll("ğ", "g").replaceAll("Ğ", "G").replaceAll("ç", "c").replaceAll("Ç", "C")
    .replaceAll("ö", "o").replaceAll("Ö", "O").replaceAll("ü", "u").replaceAll("Ü", "U")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "-")
    .replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
  const columnWidths = [46, 176, 82, 148, 86, 90, 78, 80];
  const tableWidth = columnWidths.reduce((total, width) => total + width, 0);
  const pageRows = 19;
  const pages = Array.from({ length: Math.max(1, Math.ceil(rows.length / pageRows)) }, (_, index) => rows.slice(index * pageRows, (index + 1) * pageRows));
  const objects: string[] = [];
  const pageIds: number[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>", "");
  const fontId = 3 + pages.length * 2;
  const text = (value: string, x: number, y: number, size = 7, bold = false) => `BT /F${bold ? 2 : 1} ${size} Tf ${x} ${y} Td (${clean(value)}) Tj ET`;
  pages.forEach((pageRowsForPdf, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontId + 1} 0 R >> >> /Contents ${contentId} 0 R >>`;
    const commands: string[] = [
      "0.04 0.18 0.27 rg",
      text("KO-PARK OPERASYON RAPORU", 28, 558, 17, true),
      text("Kocaeli Buyuksehir Belediyesi Akilli Park Sistemi", 28, 542, 8),
      text(`Olusturulma: ${new Date().toLocaleString("tr-TR")}`, 630, 558, 7),
      "0.10 0.55 0.36 RG 1.5 w 28 532 m 814 532 l S",
      ...metadata.map((item, itemIndex) => text(item, 28 + (itemIndex % 2) * 390, 514 - Math.floor(itemIndex / 2) * 15, 8)),
      "0.91 0.97 0.94 rg 28 465 786 26 re f",
      text(summary, 40, 474, 9, true),
    ];
    const tableTop = 446;
    const headerHeight = 24;
    commands.push(`0.04 0.23 0.33 rg 28 ${tableTop - headerHeight} ${tableWidth} ${headerHeight} re f`);
    let x = 28;
    headers.forEach((header, columnIndex) => {
      commands.push("1 1 1 rg", text(header.toUpperCase(), x + 5, tableTop - 15, 7, true));
      x += columnWidths[columnIndex];
    });
    pageRowsForPdf.forEach((row, rowIndex) => {
      const rowTop = tableTop - headerHeight - rowIndex * 20;
      if (rowIndex % 2 === 1) commands.push(`0.97 0.99 0.98 rg 28 ${rowTop - 20} ${tableWidth} 20 re f`);
      let cellX = 28;
      row.forEach((value, columnIndex) => {
        const width = columnWidths[columnIndex];
        const characterLimit = Math.max(4, Math.floor((width - 10) / 4.2));
        const display = value.length > characterLimit ? `${value.slice(0, characterLimit - 1)}.` : value;
        commands.push("0.12 0.22 0.27 rg", text(display, cellX + 5, rowTop - 13, 7, columnIndex === 0 || columnIndex === 1));
        cellX += width;
      });
    });
    const rowCount = Math.max(1, pageRowsForPdf.length);
    const tableBottom = tableTop - headerHeight - rowCount * 20;
    commands.push(`0.72 0.82 0.77 RG 0.45 w 28 ${tableBottom} ${tableWidth} ${headerHeight + rowCount * 20} re S`);
    x = 28;
    columnWidths.slice(0, -1).forEach(width => {
      x += width;
      commands.push(`${x} ${tableBottom} m ${x} ${tableTop} l S`);
    });
    for (let rowIndex = 0; rowIndex <= rowCount; rowIndex += 1) {
      const y = tableTop - headerHeight - rowIndex * 20;
      commands.push(`28 ${y} m ${28 + tableWidth} ${y} l S`);
    }
    commands.push("0.35 0.45 0.49 rg", text(`Sayfa ${index + 1} / ${pages.length}`, 740, 20, 7), text(`Toplam ${rows.length} kayit`, 28, 20, 7));
    const body = commands.join("\n");
    objects[contentId - 1] = `<< /Length ${body.length} >>\nstream\n${body}\nendstream`;
  });
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[fontId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>";
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadBlob(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
