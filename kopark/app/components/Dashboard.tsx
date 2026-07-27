"use client";

import dynamic from "next/dynamic";
import {
  Bell, Building2, CalendarDays, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck,
  FileWarning, LayoutDashboard, Leaf, LogOut, Map, Menu, Search,
  Settings, ShieldCheck, Sprout, TreePine, Users, Wrench, X
} from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ModuleWorkspace from "./ModuleWorkspace";
import { useOperations } from "../context/OperationsContext";
import { isActive, isCompleted, isCritical, isOverdue } from "../data/operations";

const ParkMap = dynamic(() => import("./ParkMap"), { ssr: false });

const nav = [
  ["Genel Bakış", LayoutDashboard], ["Parklar", TreePine], ["Harita", Map], ["Ekipmanlar", Sprout],
  ["Bakım Yönetimi", Wrench], ["Arıza Kayıtları", FileWarning], ["Görevler", ClipboardCheck], ["Vatandaş Bildirimleri", FileWarning],
  ["Personel", Users], ["Etkinlikler", CalendarDays], ["Raporlar", Building2], ["Destek Merkezi", CircleHelp],
] as const;

export default function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const [active, setActive] = useState("Genel Bakış");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("Bu hafta");
  const {data, loading, error, refresh}=useOperations();
  const panelReports=data.reports;
  const openReportCount=panelReports.filter(report=>report.status!=="Tamamlandı"&&report.status!=="Reddedildi").length;
  const activeTasks=data.tasks.filter(isActive);
  const overdueTasks=data.tasks.filter(row=>isOverdue(row));
  const pendingMaintenance=data.maintenance.filter(row=>!isCompleted(row));
  const completedMaintenance=data.maintenance.filter(isCompleted);
  const criticalMaintenance=data.maintenance.filter(isCritical);
  const fieldStaff=data.staff.filter(row=>row.status==="Sahada");
  const availableStaff=data.staff.filter(row=>row.status==="Müsait");
  const criticalParks=useMemo(()=>data.parks.filter(isCritical).sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,3),[data.parks]);
  const completionRate=data.maintenance.length?Math.round((completedMaintenance.length/data.maintenance.length)*100):0;
  const activeChartData=useMemo(()=>{
    const windowDays=chartPeriod==="Bu ay"?30:chartPeriod==="Son 3 ay"?90:7;
    const bucketDays=Math.ceil(windowDays/7);
    const end=new Date();end.setHours(23,59,59,999);
    return Array.from({length:7},(_,index)=>{
      const bucketEnd=new Date(end);bucketEnd.setDate(end.getDate()-(6-index)*bucketDays);
      const bucketStart=new Date(bucketEnd);bucketStart.setDate(bucketEnd.getDate()-bucketDays+1);bucketStart.setHours(0,0,0,0);
      const inside=(value:unknown)=>{if(!value)return false;const date=new Date(`${String(value).slice(0,10)}T12:00:00`);return !Number.isNaN(date.getTime())&&date>=bucketStart&&date<=bucketEnd};
      return {
        day:bucketDays===1?bucketEnd.toLocaleDateString("tr-TR",{weekday:"short"}):bucketEnd.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"}),
        planned:data.maintenance.filter(row=>inside(row.start)).length,
        completed:data.maintenance.filter(row=>inside(row.completedAt)).length,
      };
    });
  },[data.maintenance,chartPeriod]);

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Leaf size={21} /></div><div><strong>KO-PARK</strong><small>Kocaeli Park Yönetimi</small></div></div>
        <button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Menüyü kapat"><X /></button>
        <nav>
          <p className="nav-label">YÖNETİM</p>
          {nav.map(([label, Icon]) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => { setActive(label); setSidebarOpen(false); }}>
              <Icon size={19} /><span>{label}</span>{label === "Vatandaş Bildirimleri" && openReportCount>0 && <em>{openReportCount}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={active === "Sistem Ayarları" ? "active" : ""} onClick={() => setActive("Sistem Ayarları")}><Settings size={19} /><span>Sistem Ayarları</span></button>
          <button className="help-card" onClick={()=>setActive("Destek Merkezi")}><ShieldCheck size={22}/><div><strong>Yardıma mı ihtiyacınız var?</strong><small>Destek merkezine ulaşın</small></div><ChevronRight size={17}/></button>
        </div>
      </aside>

      {sidebarOpen && <button className="overlay" onClick={() => setSidebarOpen(false)} aria-label="Menüyü kapat" />}

      <section className="main-panel">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menüyü aç"><Menu /></button>
          <div className="search"><Search size={18}/><input placeholder="Park, görev veya bildirim ara..." onKeyDown={event => { if (event.key !== "Enter") return; const value=event.currentTarget.value.toLocaleLowerCase("tr"); if(value.includes("bildirim"))setActive("Vatandaş Bildirimleri");else if(value.includes("görev"))setActive("Görevler");else if(value.includes("bakım"))setActive("Bakım Yönetimi");else setActive("Parklar"); }} /></div>
          <div className="top-actions">
            <button className="notification-btn" aria-label="Bildirimler" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={20}/>{openReportCount>0&&<i />}</button>
            <button className="user" onClick={onLogout} title="Güvenli çıkış"><div className="avatar">SK</div><div><strong>Selin Kaya</strong><small>Belediye Operatörü</small></div><LogOut size={16}/></button>
          </div>
          {notificationsOpen && <div className="notification-popover"><strong>Bildirimler</strong>{openReportCount>0?<p>{openReportCount} vatandaş bildirimi işlem bekliyor.</p>:<p>Yeni bildiriminiz bulunmuyor.</p>}</div>}
        </header>

        <div className="content">
          {error&&<div className="api-error overview-api-error"><CircleHelp size={17}/><span><strong>Canlı veritabanı bağlantısı yenileniyor.</strong>Geçici olarak güvenli örnek kayıtlar gösteriliyor. {error}</span><button onClick={()=>void refresh()}>Tekrar dene</button></div>}
          <div className="welcome">
            <div><p>22 Temmuz 2026, Çarşamba · Kocaeli</p><h1>Günaydın, Selin <span>👋</span></h1><h2>Kocaeli’nin park ve millet bahçelerinde bugün neler oluyor?</h2></div>
            {active==="Genel Bakış"&&<button className="primary-btn" onClick={() => setActive("Bakım Yönetimi")}><Wrench size={17}/> Yeni bakım oluştur</button>}
          </div>

          {active !== "Genel Bakış" && <ModuleWorkspace active={active} />}

          {active === "Genel Bakış" && <>
            <section className="stats-grid">
              <Stat onClick={()=>setActive("Parklar")} icon={<TreePine/>} tone="green" value={loading?"…":String(data.parks.length)} label="Kayıtlı Park" detail={`${new Set(data.parks.map(row=>row.district)).size} ilçede aktif`} trend="Parkları yönet" />
              <Stat onClick={()=>setActive("Personel")} icon={<Users/>} tone="blue" value={loading?"…":String(data.staff.length)} label="Saha Personeli" detail={`${fieldStaff.length} sahada · ${availableStaff.length} müsait`} trend="Personeli yönet" />
              <Stat onClick={()=>setActive("Görevler")} icon={<ClipboardCheck/>} tone="purple" value={loading?"…":String(activeTasks.length)} label="Aktif Görev" detail={`${overdueTasks.length} görev gecikmiş`} trend="Görevleri aç" warning={overdueTasks.length>0} />
              <Stat onClick={()=>setActive("Bakım Yönetimi")} icon={<Wrench/>} tone="orange" value={loading?"…":String(pendingMaintenance.length)} label="Bekleyen Bakım" detail={`${criticalMaintenance.length} kritik bakım`} trend="Bakımları aç" warning={criticalMaintenance.length>0} />
              <Stat onClick={()=>setActive("Vatandaş Bildirimleri")} icon={<FileWarning/>} tone="red" value={String(openReportCount)} label="Açık Bildirim" detail={openReportCount>0?`${openReportCount} işlem bekliyor`:"Yeni bildirim yok"} trend={openReportCount>0?"Bildirimleri aç":"Güncel"} warning={openReportCount>0} />
            </section>

            <section className="dashboard-grid">
              <article className="card chart-card">
                <div className="card-head"><div><h3>Bakım performansı</h3><p>{chartPeriod} için planlanan ve tamamlanan bakımlar</p></div><label className="period-label"><select value={chartPeriod} onChange={e=>setChartPeriod(e.target.value)} aria-label="Grafik dönemi"><option>Bu hafta</option><option>Bu ay</option><option>Son 3 ay</option></select><ChevronDown size={15}/></label></div>
                <div className="chart-summary"><div><strong>{data.maintenance.length}</strong><span>Toplam bakım</span></div><div><strong>%{completionRate}</strong><span>Tamamlanma oranı</span></div><div className="legend"><i className="planned"/> Planlanan <i className="completed"/> Tamamlanan</div></div>
                <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activeChartData}><defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#19a66a" stopOpacity={0.25}/><stop offset="95%" stopColor="#19a66a" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf0"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#718096",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#718096",fontSize:12}}/><Tooltip/><Area type="monotone" dataKey="planned" stroke="#cbd5e1" fill="transparent" strokeDasharray="5 5"/><Area type="monotone" dataKey="completed" stroke="#16945e" strokeWidth={3} fill="url(#greenFill)"/></AreaChart></ResponsiveContainer></div>
              </article>

              <article className="card priority-card">
                <div className="card-head"><div><h3>Kritik bakım gereken parklar</h3><p>Bakım öncelik puanına göre sıralandı</p></div></div>
                <div className="priority-list">{criticalParks.map((park, index) => <button className="priority-row" key={park.id} onClick={()=>setActive("Parklar")}><span className={`score ${index===0?"red":"orange"}`}>{park.score}</span><span className="park-info"><strong>{park.name}</strong><small>{park.district} · {park.criticalReason||"Yüksek bakım öncelik puanı"}</small></span><ChevronRight size={18}/><b>Kritik</b></button>)}</div>
                {criticalParks.length===0&&<div className="dashboard-empty"><ShieldCheck/><strong>Kritik park yok</strong><span>Güncel kayıtlarda kritik eşik aşılmadı.</span></div>}
                <button className="text-btn" onClick={()=>setActive("Parklar")}>Tüm kritik parkları görüntüle <ChevronRight size={16}/></button>
              </article>
            </section>

            <section className="dashboard-grid lower">
              <article className="card map-card"><div className="card-head"><div><h3>Park haritası</h3><p>Parkların güncel durumunu haritada takip edin</p></div><div className="map-legend"><span><i className="green-dot"/>Normal</span><span><i className="amber-dot"/>Bakım gerekli</span><span><i className="red-dot"/>Kritik</span></div></div><ParkMap onOpenDetails={()=>setActive("Harita")} /></article>
              <article className="card reports-card"><div className="card-head"><div><h3>Son vatandaş bildirimleri</h3><p>Yeni ve işlem bekleyen kayıtlar</p></div></div><div>{panelReports.length===0?<div className="dashboard-empty"><Bell/><strong>Yeni bildirim yok</strong><span>Vatandaştan mesaj geldiğinde burada görünecek.</span></div>:panelReports.slice(0,3).map(report => <button className="report-row" key={report.id} onClick={()=>setActive("Vatandaş Bildirimleri")}><span className="report-avatar">{String(report.initials??report.citizen??"V").split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()}</span><span><strong>{String(report.title??"Vatandaş bildirimi")}</strong><small>{String(report.park??"Park belirtilmedi")} · {String(report.time??report.date??"")}</small></span><em className={`status ${String(report.status??"Bekliyor").replaceAll(" ", "-").toLowerCase()}`}>{String(report.status??"Bekliyor")}</em></button>)}</div>{panelReports.length>0&&<button className="text-btn" onClick={()=>setActive("Vatandaş Bildirimleri")}>Tüm bildirimleri görüntüle <ChevronRight size={16}/></button>}</article>
            </section>
          </>}
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, tone, value, label, detail, trend, warning = false, onClick }: { icon: React.ReactNode; tone: string; value: string; label: string; detail: string; trend: string; warning?: boolean; onClick:()=>void }) {
  return <button className="stat-card stat-button" onClick={onClick} aria-label={`${label} bölümünü aç`}><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-value"><strong>{value}</strong><span>{label}</span></div><div className="stat-foot"><span className={warning ? "warn" : ""}>{detail}</span><small>{trend} →</small></div></button>;
}
