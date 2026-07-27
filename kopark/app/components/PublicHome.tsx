"use client";
/* eslint-disable @next/next/no-img-element */

import { ArrowRight, CalendarDays, MessageSquareText, Sparkles, TreePine } from "lucide-react";
import Link from "next/link";
import { usePublicParks } from "../hooks/usePublicParks";
import { PublicFooter, PublicHeader } from "./PublicChrome";

export default function PublicHome(){
  const {parks}=usePublicParks();
  return <main className="public-page">
    <PublicHeader/>
    <section className="public-hero">
      <div className="hero-copy">
        <span className="hero-kicker"><Sparkles/> Kocaeli’nin yeşil alanları tek ekranda</span>
        <h1>Parkını seç,<br/><em>şehrin nefesini</em> keşfet.</h1>
        <p>İlçendeki parkların doluluk durumunu gör, ücretsiz etkinlikleri keşfet ve görüşlerini giriş yapmadan belediyeye ilet.</p>
        <div className="hero-actions"><Link href="/parklar">Parkları keşfet <ArrowRight/></Link><Link className="ghost" href="/iletisim">Bize yazın <MessageSquareText/></Link></div>
        <div className="hero-stats"><div><strong>12</strong><span>İlçe</span></div><div><strong>{parks.length||"—"}</strong><span>Park</span></div><div><strong>7/24</strong><span>Açık iletişim</span></div></div>
      </div>
      <div className="hero-visual">
        <div className="visual-orbit home-brand-orbit" aria-hidden="true">
          <span className="tree-one"><TreePine/></span>
          <span className="tree-two"><TreePine/></span>
          <div className="city-mark"><TreePine/><strong>KO-PARK</strong><span>KOCAELİ</span></div>
          <div className="occupancy-bubble home-quote-bubble"><TreePine/><strong>Parkları yalnızca izlemiyor; yaşam kalitesini birlikte büyütüyoruz.</strong></div>
        </div>
      </div>
    </section>
    <section className="home-park-showcase">
      <div className="showcase-heading">
        <div><span>KOCAELİ’DEN YEŞİL KARELER</span><h2>Şehrin farklı köşelerinde hayat</h2></div>
        <Link href="/parklar">Tüm parkları incele <ArrowRight/></Link>
      </div>
      <div className="showcase-grid">
        <article className="showcase-card showcase-wide"><img src="/images/parks/kocaeli-park-2.jpg" alt="Göl ve çocuk oyun alanı bulunan Kocaeli parkı"/></article>
        <article className="showcase-card"><img src="/images/parks/kocaeli-park-3.jpg" alt="Yürüyüş ve egzersiz alanları bulunan park"/></article>
        <article className="showcase-card"><img src="/images/parks/kocaeli-skatepark.jpg" alt="Kocaeli Büyükşehir Belediyesi skatepark alanı"/></article>
      </div>
    </section>
    <section className="home-route-grid">
      <Link href="/parklar"><TreePine/><div><span>PARK REHBERİ</span><h2>İlçene göre parkları incele</h2><p>Doluluk, konum ve park özelliklerini ayrı park sayfasında görüntüle.</p></div><ArrowRight/></Link>
      <Link href="/etkinlikler"><CalendarDays/><div><span>ETKİNLİKLER</span><h2>Parklardaki etkinlikleri keşfet</h2><p>Konser, spor, çocuk ve kültür etkinliklerini takip et.</p></div><ArrowRight/></Link>
      <Link href="/iletisim"><MessageSquareText/><div><span>VATANDAŞ İLETİŞİMİ</span><h2>Belediyeye doğrudan yaz</h2><p>Parkla ilgili sorun veya önerini üyelik olmadan ilet.</p></div><ArrowRight/></Link>
    </section>
    <PublicFooter/>
  </main>
}
