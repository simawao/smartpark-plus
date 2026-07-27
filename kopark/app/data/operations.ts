import { KOCAELI_PARKS } from "./kocaeliParks";

export type OperationRow = Record<string, string | number | boolean> & { id: number };

export const MODULE_KEYS = [
  "parks", "equipment", "maintenance", "faults", "tasks",
  "reports", "staff", "events", "support",
] as const;

export type ModuleKey = typeof MODULE_KEYS[number];

const generatedStaff: OperationRow[] = Array.from({ length: 58 }, (_, index) => {
  const number = index + 7;
  const district = KOCAELI_PARKS[index % KOCAELI_PARKS.length].district;
  return {
    id: number,
    name: `Saha Görevlisi ${String(number).padStart(2, "0")}`,
    role: ["Bakım Personeli", "Peyzaj Görevlisi", "Temizlik Personeli", "Sulama Personeli"][index % 4],
    district,
    activeTasks: 0,
    status: "Müsait",
    archived: false,
  };
});

const generatedActiveTasks: OperationRow[] = Array.from({ length: 24 }, (_, index) => {
  const park = KOCAELI_PARKS[(index * 2 + 4) % KOCAELI_PARKS.length];
  const number = index + 5;
  return {
    id: number,
    title: `Planlı saha görevi ${String(number).padStart(2, "0")}`,
    district: park.district,
    park: park.name,
    assignee: `Saha Görevlisi ${String(index + 7).padStart(2, "0")}`,
    type: ["Bakım", "Temizlik", "Sulama", "Denetim"][index % 4],
    start: `2026-07-${String(24 + (index % 4)).padStart(2, "0")}`,
    due: index < 3 ? `2026-07-${String(20 + index).padStart(2, "0")}` : `2026-08-${String(2 + (index % 15)).padStart(2, "0")}`,
    completedAt: "",
    status: index % 2 === 0 ? "Atandı" : "Devam Ediyor",
    priority: index === 4 || index === 17 ? "Kritik" : index % 3 === 0 ? "Yüksek" : "Orta",
    criticalReason: index === 4 || index === 17 ? "Yoğun kullanılan alanda güvenlik ve hizmet sürekliliği riski." : "",
    archived: false,
  };
});

const generatedPendingMaintenance: OperationRow[] = Array.from({ length: 12 }, (_, index) => {
  const park = KOCAELI_PARKS[(index * 3 + 8) % KOCAELI_PARKS.length];
  const number = index + 5;
  return {
    id: number,
    title: `Planlı park bakımı ${String(number).padStart(2, "0")}`,
    district: park.district,
    park: park.name,
    type: ["Sulama", "Çim Biçme", "Temizlik", "Budama", "Genel Bakım"][index % 5],
    assignee: `Saha Görevlisi ${String(index + 31).padStart(2, "0")}`,
    start: `2026-07-${String(22 + (index % 6)).padStart(2, "0")}`,
    due: `2026-08-${String(3 + (index % 18)).padStart(2, "0")}`,
    completedAt: "",
    status: index % 3 === 0 ? "Bekliyor" : index % 3 === 1 ? "Atandı" : "Devam Ediyor",
    priority: index < 2 ? "Kritik" : index % 3 === 0 ? "Yüksek" : "Orta",
    score: index < 2 ? 88 - index : 45 + index,
    criticalReason: index < 2 ? "Yüksek yoğunluk, gecikmiş periyodik bakım ve açık saha riski." : "",
    archived: false,
  };
});

export const OPERATION_SEEDS: Record<ModuleKey, OperationRow[]> = {
  parks: KOCAELI_PARKS.map((park, index) => {
    const critical = ["Sekapark", "Darıca Millet Bahçesi"].includes(park.name);
    return {
      id: index + 1,
      name: park.name,
      district: park.district,
      neighborhood: park.neighborhood,
      address: `${park.neighborhood} Mahallesi, ${park.district}/Kocaeli`,
      latitude: 40.72 + ((index % 9) * 0.025),
      longitude: 29.73 + ((index % 12) * 0.04),
      hours: "07:00 – 23:00",
      amenities: park.detail,
      capacity: 500 + ((index * 173) % 4500),
      occupancy: park.occupancy,
      detail: park.detail,
      status: critical || index === 27 ? "Bakım Gerekli" : "Aktif",
      score: park.name === "Sekapark" ? 92 : park.name === "Darıca Millet Bahçesi" ? 86 : 22 + ((index * 13) % 57),
      criticalReason: park.name === "Sekapark"
        ? "Aydınlatma arızası, yüksek yoğunluk ve gecikmiş elektrik bakımı."
        : park.name === "Darıca Millet Bahçesi"
          ? "Oyun grubu arızası ve açık vatandaş bildirimleri."
          : "",
      archived: false,
    };
  }),
  equipment: [
    { id: 1, name: "Çocuk Oyun Grubu #3", district: "Darıca", park: "Darıca Millet Bahçesi", type: "Çocuk Oyun Grubu", condition: "Arızalı", lastMaintenance: "2026-07-04", priority: "Kritik", criticalReason: "Taşıyıcı bağlantıda kırılma; kullanım güvenli değil.", archived: false },
    { id: 2, name: "Sahil LED Aydınlatma #18", district: "İzmit", park: "Sekapark", type: "Aydınlatma", condition: "Bakım Gerekli", lastMaintenance: "2026-05-12", priority: "Kritik", criticalReason: "Sahil yürüyüş hattında üç armatür devre dışı.", archived: false },
    { id: 3, name: "Doğa Parkuru Yönlendirmesi #7", district: "Kartepe", park: "Ormanya Doğal Yaşam Parkı", type: "Yönlendirme", condition: "İyi", lastMaintenance: "2026-07-16", priority: "Düşük", criticalReason: "", archived: false },
  ],
  maintenance: [
    { id: 1, title: "Sahil aydınlatma onarımı", district: "İzmit", park: "Sekapark", type: "Elektrik Bakımı", assignee: "Mert Demir", start: "2026-07-20", due: "2026-07-23", completedAt: "", status: "Devam Ediyor", priority: "Kritik", score: 94, criticalReason: "Yoğun kullanılan sahil hattında gece güvenliği riski.", archived: false },
    { id: 2, title: "Tematik bahçe bakımı", district: "Darıca", park: "Darıca Millet Bahçesi", type: "Peyzaj", assignee: "Ayşe Şen", start: "2026-07-22", due: "2026-07-29", completedAt: "", status: "Devam Ediyor", priority: "Yüksek", score: 72, criticalReason: "", archived: false },
    { id: 3, title: "Yürüyüş yolu kontrolü", district: "Gölcük", park: "Gölcük Örcün Millet Bahçesi", type: "Genel Bakım", assignee: "Can Polat", start: "2026-06-10", due: "2026-06-12", completedAt: "2026-06-12", status: "Tamamlandı", priority: "Orta", score: 48, criticalReason: "", archived: true },
    { id: 4, title: "Sulama hattı yenileme", district: "Kartepe", park: "Ormanya Doğal Yaşam Parkı", type: "Sulama", assignee: "Elif Aydın", start: "2026-05-03", due: "2026-05-08", completedAt: "2026-05-07", status: "Tamamlandı", priority: "Orta", score: 44, criticalReason: "", archived: true },
    ...generatedPendingMaintenance,
  ],
  faults: [
    { id: 1, title: "Ana yürüyüş yolunda aydınlatma kesintisi", district: "İzmit", park: "Sekapark", category: "Aydınlatma", priority: "Kritik", status: "Çalışma Başladı", description: "Sahil yürüyüş yolunun doğu bölümünde üç direk çalışmıyor.", criticalReason: "Gece yaya güvenliğini doğrudan etkiliyor.", date: "2026-07-25", archived: false },
  ],
  tasks: [
    { id: 1, title: "Kırık salıncağı güvenli alana al", district: "Darıca", park: "Darıca Millet Bahçesi", assignee: "Mert Demir", type: "Ekipman Güvenliği", start: "2026-07-22", due: "2026-07-28", completedAt: "", status: "Devam Ediyor", priority: "Kritik", criticalReason: "Çocuk güvenliği riski nedeniyle alan kapatıldı.", archived: false },
    { id: 2, title: "Çöp kutularını yenile", district: "İzmit", park: "İzmit Millet Bahçesi", assignee: "Ayşe Şen", type: "Temizlik", start: "2026-07-24", due: "2026-07-30", completedAt: "", status: "Atandı", priority: "Orta", criticalReason: "", archived: false },
    { id: 3, title: "Sulama hattı kontrolü", district: "Gölcük", park: "Gölcük Örcün Millet Bahçesi", assignee: "Can Polat", type: "Sulama", start: "2026-07-18", due: "2026-07-20", completedAt: "", status: "Devam Ediyor", priority: "Yüksek", criticalReason: "", archived: false },
    { id: 4, title: "Eski bankların boyanması", district: "Körfez", park: "Tütünçiftlik Sahil Parkı", assignee: "Emre Kaya", type: "Boyama", start: "2026-05-02", due: "2026-05-05", completedAt: "2026-05-05", status: "Tamamlandı", priority: "Düşük", criticalReason: "", archived: true },
    ...generatedActiveTasks,
  ],
  reports: [],
  staff: [
    { id: 1, name: "Mert Demir", role: "Elektrik Teknisyeni", district: "İzmit", activeTasks: 1, status: "Sahada", archived: false },
    { id: 2, name: "Ayşe Şen", role: "Peyzaj Görevlisi", district: "Darıca", activeTasks: 1, status: "Sahada", archived: false },
    { id: 3, name: "Can Polat", role: "Bakım Personeli", district: "Gölcük", activeTasks: 1, status: "Sahada", archived: false },
    { id: 4, name: "Elif Aydın", role: "Sulama Personeli", district: "Kartepe", activeTasks: 0, status: "Müsait", archived: false },
    { id: 5, name: "Emre Kaya", role: "Temizlik Personeli", district: "Körfez", activeTasks: 0, status: "Müsait", archived: false },
    { id: 6, name: "Zeynep Çelik", role: "Saha Sorumlusu", district: "Gebze", activeTasks: 0, status: "Müsait", archived: false },
    ...generatedStaff,
  ],
  events: [
    { id: 1, title: "Körfez Kıyısında Yoga", district: "İzmit", park: "Sekapark", type: "Yoga", startAt: "2026-08-02T09:00", endAt: "2026-08-02T10:30", capacity: 80, status: "Yayında", archived: false },
    { id: 2, title: "Açık Hava Sineması", district: "İzmit", park: "İzmit Millet Bahçesi", type: "Sinema", startAt: "2026-08-06T21:00", endAt: "2026-08-06T23:15", capacity: 300, status: "Yayında", archived: false },
    { id: 3, title: "Geçmiş Bahar Atölyesi", district: "Kartepe", park: "Ormanya Doğal Yaşam Parkı", type: "Atölye", startAt: "2026-04-12T13:00", endAt: "2026-04-12T16:00", capacity: 120, status: "Tamamlandı", archived: true },
  ],
  support: [],
};

export function isCompleted(row: OperationRow) {
  return String(row.status ?? "") === "Tamamlandı";
}

export function isActive(row: OperationRow) {
  return ["Atandı", "Devam Ediyor", "Çalışma Başladı", "Sahada"].includes(String(row.status ?? ""));
}

export function isCritical(row: OperationRow) {
  return String(row.priority ?? "") === "Kritik" || Number(row.score ?? 0) >= 80;
}

export function isOverdue(row: OperationRow, now = new Date()) {
  if (isCompleted(row) || !row.due) return false;
  const date = new Date(`${String(row.due).slice(0, 10)}T23:59:59`);
  return !Number.isNaN(date.getTime()) && date < now;
}
