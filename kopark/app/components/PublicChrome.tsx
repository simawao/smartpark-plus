"use client";

import { Leaf, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links=[
  ["/hakkimizda","Hakkımızda"],["/misyon","Misyon"],["/vizyon","Vizyon"],
  ["/parklar","Parklar"],["/etkinlikler","Etkinlikler"],["/iletisim","İletişim"],
];

export function PublicHeader(){
  const [open,setOpen]=useState(false);
  return <header className="public-header"><Link className="public-brand" href="/"><span><Leaf/></span><strong>KO-PARK</strong><small>Kocaeli</small></Link><nav className={open?"open":""}>{links.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<Link className="authority-link" href="/yetkili"><ShieldCheck/> Yetkili Girişi</Link></nav><button className="public-menu" onClick={()=>setOpen(!open)} aria-label="Menü">{open?<X/>:<Menu/>}</button></header>
}

export function PublicFooter(){
  return <footer className="public-footer"><Link className="public-brand" href="/"><span><Leaf/></span><strong>KO-PARK</strong><small>Kocaeli</small></Link><p>Kocaeli’nin parkları için açık, erişilebilir ve katılımcı şehir platformu.</p><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link><Link href="/yetkili">Yetkili Girişi</Link></footer>
}
