"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Check, Leaf, LogIn, MapPinned, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import Dashboard from "./Dashboard";
import { OperationsProvider } from "../context/OperationsContext";

export default function AuthorityPortal() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAuthenticated(sessionStorage.getItem("smartpark:authority") === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const login = () => {
    sessionStorage.setItem("smartpark:authority", "true");
    setAuthenticated(true);
  };

  if (authenticated) return <OperationsProvider><Dashboard onLogout={() => { sessionStorage.removeItem("smartpark:authority"); setAuthenticated(false); }} /></OperationsProvider>;

  return <main className="login-page">
    <span className="login-glow one"/><span className="login-glow two"/><span className="login-grid-pattern"/>
    <Link className="login-back" href="/"><ArrowLeft/> Vatandaş ana sayfasına dön</Link>
    <section className="login-card">
      <div className="login-showcase">
        <div className="login-brand inverse"><span><Leaf/></span><strong>KO-PARK</strong><small>Kocaeli Yetkili Portalı</small></div>
        <span className="login-kicker"><Sparkles/> Akıllı şehir operasyon merkezi</span>
        <h1>Kocaeli’nin yeşil alanlarını tek merkezden yönetin.</h1>
        <p>Park, bakım, görev, arıza ve vatandaş bildirimlerini bütün ilçeler için düzenli biçimde takip edin.</p>
        <div className="login-feature-list"><div><MapPinned/><span><strong>12 ilçe</strong><small>Kocaeli geneli park takibi</small></span></div><div><Wrench/><span><strong>Bakım ve arıza</strong><small>Öncelikli saha operasyonları</small></span></div><div><Building2/><span><strong>Tek panel</strong><small>Tüm belediye modülleri</small></span></div></div>
        <div className="login-live"><i/><span>Sistem kullanıma hazır</span><strong>Demo ortamı</strong></div>
      </div>
      <div className="login-entry">
        <div className="login-entry-icon"><ShieldCheck/></div>
        <span className="entry-label">YETKİLİ ERİŞİMİ</span>
        <h2>Yönetim paneline hoş geldiniz</h2>
        <p>Prototip özelliklerini incelemek için herhangi bir kullanıcı bilgisi girmeden panele geçebilirsiniz.</p>
        <div className="login-security"><Check/><div><strong>Hazır demo hesabı</strong><span>Yetkili yetkileri otomatik olarak tanımlanır.</span></div></div>
        <button className="login-submit" type="button" onClick={login}><span><LogIn/> Demo yönetici paneline gir</span><b>→</b></button>
        <div className="login-trust"><ShieldCheck/><span>Yerel prototip · Güvenli demo oturumu</span></div>
        <p className="login-help">Bu hızlı giriş yalnızca proje gösterimi içindir.</p>
      </div>
    </section>
  </main>;
}
