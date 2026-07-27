"use client";

import { ChevronDown, Clock, ExternalLink, MapPin, Trees, TreePine, X } from "lucide-react";
import { useMemo, useState } from "react";
import { KOCAELI_DISTRICTS, KOCAELI_PARKS } from "../data/kocaeliParks";
import type { PublicParkRecord } from "../hooks/usePublicParks";
import { usePublicParks } from "../hooks/usePublicParks";
import { PublicFooter, PublicHeader } from "./PublicChrome";

export default function ParksPage(){
  const [district,setDistrict]=useState("Tümü");
  const [selected,setSelected]=useState<PublicParkRecord|null>(null);
  const {parks:allParks,loading,error}=usePublicParks();
  const parks=useMemo(()=>district==="Tümü"?allParks:district==="Diğer"?allParks.filter(park=>!KOCAELI_DISTRICTS.some(item=>item===park.district)):allParks.filter(park=>park.district===district),[district,allParks]);
  return <main className="public-page"><PublicHeader/><section className="inner-hero"><TreePine/><span>PARK REHBERİ</span><h1>Kocaeli parkları</h1><p>İlçe seçerek parkları, doluluk durumlarını ve temel özelliklerini görüntüleyin.</p></section><section className="public-section parks-section"><div className="section-heading"><div><span>{parks.length} PARK LİSTELENİYOR</span><h2>{district==="Tümü"?"Tüm ilçeler":district}</h2><p>Bir parkın kartına dokunarak adres, çalışma saati, imkânlar ve konum bilgilerini açın.</p></div><label>İlçe seçin<div><MapPin/><select value={district} onChange={e=>setDistrict(e.target.value)}><option>Tümü</option>{KOCAELI_DISTRICTS.map(d=><option key={d}>{d}</option>)}<option>Diğer</option></select><ChevronDown/></div></label></div>{error&&<div className="public-empty"><strong>Park verileri yüklenemedi</strong><span>{error}</span></div>}{loading&&<div className="public-empty"><span className="api-loader"/><strong>Parklar yükleniyor</strong></div>}<div className="public-park-grid">{parks.map(park=>{const occupancy=Number(park.occupancy??0);const status=occupancy>=75?"Yoğun":occupancy<50?"Sakin":"Orta";return <button type="button" key={park.id} className="public-park-card" onClick={()=>setSelected(park)}><div className="park-card-top"><span className={`occupancy-ring ${occupancy>=75?"busy":occupancy<50?"quiet":"medium"}`} style={{"--value":`${occupancy*3.6}deg`} as React.CSSProperties}><strong>%{occupancy}</strong></span><span className={`public-status ${status.toLocaleLowerCase("tr")}`}><i/>{status}</span></div><h3>{park.name}</h3><p><MapPin/>{park.district} · {park.neighborhood}</p><p>{park.detail||"Park ve rekreasyon alanı"}</p><div className="occupancy-track"><i style={{width:`${occupancy}%`}}/></div><span className="park-detail-link">Park detayını görüntüle <ExternalLink/></span></button>})}</div></section>{selected&&<PublicParkDetail park={selected} onClose={()=>setSelected(null)}/>}<PublicFooter/></main>
}

function PublicParkDetail({park,onClose}:{park:PublicParkRecord;onClose:()=>void}){
  const inventory=KOCAELI_PARKS.find(item=>item.name===park.name);
  const latitude=Number(park.latitude||40.7654);
  const longitude=Number(park.longitude||29.9408);
  const maps=`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  return <div className="modal-backdrop public-detail-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><article className="public-park-detail"><button className="public-modal-close" onClick={onClose} aria-label="Kapat"><X/></button><span className="public-detail-kicker"><TreePine/> PARK DETAYI</span><h2>{park.name}</h2><p className="public-detail-address"><MapPin/>{park.address||`${park.neighborhood} Mahallesi, ${park.district}/Kocaeli`}</p><div className="public-detail-grid"><div><MapPin/><span>Konum</span><strong>{park.district}, Kocaeli</strong><small>{latitude.toFixed(4)}, {longitude.toFixed(4)}</small></div><div><Clock/><span>Çalışma saatleri</span><strong>{park.hours||"07:00 – 23:00"}</strong><small>Haftanın her günü</small></div><div><Trees/><span>Mevcut durum</span><strong>{park.status||"Aktif"}</strong><small>Doluluk %{park.occupancy}</small></div></div><section><h3>Parkın sunduğu imkânlar</h3><p>{park.amenities||park.detail||inventory?.detail||"Yeşil alan, dinlenme ve yürüyüş alanları"}</p></section>{park.status!=="Aktif"&&<div className="public-maintenance-note"><strong>Bakım / geçici durum bilgisi</strong><p>{park.criticalReason||"Parkın belirli bir bölümünde planlı bakım çalışması yürütülmektedir."}</p></div>}<div className="public-detail-actions"><button className="secondary-btn" onClick={onClose}>Kapat</button><a className="primary-btn" href={maps} target="_blank" rel="noreferrer"><MapPin/>Konuma Git</a></div></article></div>
}
