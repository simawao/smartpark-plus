"use client";

import { ArrowRight, CalendarDays, Clock3, MapPin, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { recordsApi } from "../services/api";
import { PublicFooter, PublicHeader } from "./PublicChrome";

type PublicEvent={id:number;title:string;park:string;type:string;date:string;status:string;capacity?:number;description?:string};
const baseEvents:PublicEvent[]=[
  {id:1,title:"Körfez Kıyısında Yoga",park:"Sekapark",type:"Spor",date:"25.07.2026 09:00",status:"Yayında",capacity:80,description:"Körfez manzarası eşliğinde her seviyeye açık sabah yoga buluşması. Katılımcıların matlarını yanlarında getirmeleri önerilir."},
  {id:2,title:"Açık Hava Sineması",park:"İzmit Millet Bahçesi",type:"Sinema",date:"26.07.2026 21:00",status:"Yayında",capacity:300,description:"İzmit Millet Bahçesi etkinlik çayırında ücretsiz açık hava film gösterimi. Oturma alanları ücretsizdir ve kayıt gerektirmez."},
  {id:3,title:"Çocuk Doğa Atölyesi",park:"Ormanya Doğal Yaşam Parkı",type:"Çocuk",date:"28.07.2026 14:00",status:"Yayında",capacity:120,description:"Çocukların bitkileri, hayvan izlerini ve doğal yaşamı tanıyacağı eğitici keşif atölyesi. Etkinlik 7-12 yaş grubuna uygundur."},
];
function parts(value:string){const [date,time]=value.split(" ");const [day,month]=date.split(".");return {day,month:["","OCA","ŞUB","MAR","NİS","MAY","HAZ","TEM","AĞU","EYL","EKİ","KAS","ARA"][Number(month)],time}}
export default function EventsPage(){
  const [events,setEvents]=useState<PublicEvent[]>([]);
  useEffect(()=>{void(async()=>{try{let rows=await recordsApi.list<PublicEvent>("events");if(rows.length===0)rows=await recordsApi.bootstrap("events",baseEvents);setEvents(rows.filter(event=>event.status==="Yayında"))}catch{setEvents([])}})()},[]);
  const [selected,setSelected]=useState<PublicEvent|null>(null);
  return <main className="public-page events-page"><PublicHeader/><section className="inner-hero"><CalendarDays/><span>ETKİNLİK TAKVİMİ</span><h1>Parklarda hayat var</h1><p>Kocaeli’nin parklarında ücretsiz ve herkese açık buluşmaları keşfedin.</p></section><section className="events-section standalone"><div className="event-grid">{events.map(event=>{const date=parts(event.date.replace("T"," "));return <article key={event.id}><div className="event-date"><strong>{date.day}</strong><span>{date.month}</span></div><span className="event-type">{event.type}</span><h3>{event.title}</h3><p><MapPin/>{event.park}</p><p><Clock3/>{date.time}</p><button className="event-info-button" onClick={()=>setSelected(event)}>Bilgi al <ArrowRight/></button></article>})}</div></section>{selected&&<div className="event-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="event-info-modal" role="dialog" aria-modal="true" aria-labelledby="event-title"><div className="event-modal-head"><div className="event-date"><strong>{parts(selected.date.replace("T"," ")).day}</strong><span>{parts(selected.date.replace("T"," ")).month}</span></div><button onClick={()=>setSelected(null)} aria-label="Bilgi kutusunu kapat"><X/></button></div><span className="event-modal-type">{selected.type}</span><h2 id="event-title">{selected.title}</h2><p className="event-description">{selected.description||`${selected.title} etkinliği tüm vatandaşların ücretsiz katılımına açıktır.`}</p><div className="event-meta"><div><MapPin/><span>Etkinlik yeri</span><strong>{selected.park}</strong></div><div><Clock3/><span>Tarih ve saat</span><strong>{selected.date.replace("T"," ")}</strong></div><div><Users/><span>Kontenjan</span><strong>{selected.capacity?`${selected.capacity} kişi`:"Herkese açık"}</strong></div></div><div className="event-modal-actions"><button onClick={()=>setSelected(null)}>Kapat</button></div></section></div>}<PublicFooter/></main>
}
