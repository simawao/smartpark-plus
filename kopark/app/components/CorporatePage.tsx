import Link from "next/link";
import {
  ArrowRight, BarChart3, Building2, CheckCircle2, Compass, HeartHandshake,
  Info, Leaf, MapPinned, ShieldCheck, Sparkles, Target, Trees, Users,
} from "lucide-react";
import { ReactNode } from "react";
import { PublicFooter, PublicHeader } from "./PublicChrome";

type CorporateType = "about" | "mission" | "vision";
type CorporateContent = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  quote: string;
  stats: [string, string][];
  items: { icon: ReactNode; title: string; description: string }[];
};

const content: Record<CorporateType, CorporateContent> = {
  about: {
    icon: <Info/>,
    eyebrow: "HAKKIMIZDA",
    title: "Kocaeli’nin yeşil alanları için ortak dijital nokta",
    body: "KO-PARK, vatandaşların parkları keşfetmesini ve belediye ekiplerinin bakım süreçlerini düzenli biçimde yönetmesini sağlayan akıllı şehir platformudur.",
    quote: "Parkları yalnızca izlemiyor; yaşam kalitesini birlikte büyütüyoruz.",
    stats: [["12", "İlçe"], ["57", "Park"], ["7/24", "Dijital erişim"]],
    items: [
      { icon: <MapPinned/>, title: "Tek noktadan erişim", description: "Kocaeli genelindeki park, doluluk ve etkinlik bilgilerine kolayca ulaşın." },
      { icon: <HeartHandshake/>, title: "Vatandaşla birlikte", description: "Üyelik gerektirmeyen iletişim kanalıyla görüş ve bildirimlerinizi paylaşın." },
      { icon: <Building2/>, title: "Güçlü saha yönetimi", description: "Bakım, görev, ekipman ve arıza süreçlerini düzenli biçimde takip edin." },
    ],
  },
  mission: {
    icon: <Target/>,
    eyebrow: "MİSYONUMUZ",
    title: "Park hizmetlerini erişilebilir ve takip edilebilir kılmak",
    body: "Vatandaşların doğru parka ve doğru belediye birimine hızlıca ulaşmasını; saha ekiplerinin bakım, arıza ve görev kayıtlarını şeffaf biçimde takip etmesini sağlıyoruz.",
    quote: "Her bildirimi doğru ekibe, her ihtiyacı zamanında çözüme ulaştırmak.",
    stats: [["Hızlı", "Yönlendirme"], ["Açık", "İletişim"], ["Düzenli", "Saha takibi"]],
    items: [
      { icon: <Users/>, title: "Herkes için erişim", description: "Vatandaşların park bilgilerine ücretsiz, anlaşılır ve hızlı erişmesini sağlamak." },
      { icon: <ShieldCheck/>, title: "Güvenilir hizmet", description: "Bakım ve arıza süreçlerini kayıtlı, ölçülebilir ve takip edilebilir hale getirmek." },
      { icon: <CheckCircle2/>, title: "Etkin operasyon", description: "Belediye ekiplerinin görevlerini doğru öncelik ve güncel verilerle yönetmek." },
    ],
  },
  vision: {
    icon: <Compass/>,
    eyebrow: "VİZYONUMUZ",
    title: "Yeşil alan yönetiminde örnek şehir olmak",
    body: "Kocaeli’nin bütün ilçelerinde veriye dayalı, sürdürülebilir ve herkes için erişilebilir park yönetimi oluşturmayı hedefliyoruz.",
    quote: "Teknolojiyle güçlenen, doğayla uyumlu ve insan odaklı bir Kocaeli.",
    stats: [["Yeşil", "Gelecek"], ["Akıllı", "Kararlar"], ["Ortak", "Şehir kültürü"]],
    items: [
      { icon: <Leaf/>, title: "Sürdürülebilir parklar", description: "Kaynakları verimli kullanan, bakımlı ve gelecek kuşaklara değer katan alanlar." },
      { icon: <Sparkles/>, title: "Katılımcı belediyecilik", description: "Vatandaş görüşlerinin şehir hizmetlerinin gelişimine doğrudan katkı sunduğu yapı." },
      { icon: <BarChart3/>, title: "Veriye dayalı kararlar", description: "Yoğunluk, bakım ve bildirim verileriyle doğru zamanda doğru müdahale." },
    ],
  },
};

export default function CorporatePage({type}:{type:CorporateType}) {
  const item = content[type];
  return <main className={`public-page corporate-theme ${type}`}>
    <PublicHeader/>
    <section className="corporate-hero">
      <div className="corporate-copy">
        <div className="corporate-eyebrow"><span>{item.icon}</span>{item.eyebrow}</div>
        <h1>{item.title}</h1>
        <p>{item.body}</p>
        <div className="corporate-actions">
          <Link href="/parklar">Parkları keşfet <ArrowRight/></Link>
          <Link className="light" href="/iletisim">Bize ulaşın</Link>
        </div>
        <div className="corporate-stats">
          {item.stats.map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </div>
      <div className="corporate-visual" aria-hidden="true">
        <div className="corporate-orbit orbit-one"/>
        <div className="corporate-orbit orbit-two"/>
        <div className="corporate-emblem"><Trees/><span>KO-PARK</span><small>KOCAELİ</small></div>
        <div className="corporate-quote"><Leaf/><p>{item.quote}</p></div>
      </div>
    </section>
    <section className="corporate-values">
      <div className="corporate-section-head">
        <span>YAKLAŞIMIMIZ</span>
        <h2>Yeşil alanlara değer katan ilkeler</h2>
        <p>İnsan, doğa ve teknolojiyi aynı hedefte buluşturuyoruz.</p>
      </div>
      <div className="corporate-card-grid">
        {item.items.map((value,index)=><article key={value.title}>
          <div className="corporate-card-top"><span>{value.icon}</span><strong>0{index+1}</strong></div>
          <h3>{value.title}</h3>
          <p>{value.description}</p>
        </article>)}
      </div>
    </section>
    <PublicFooter/>
  </main>;
}
