"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { KOCAELI_PARKS } from "../data/kocaeliParks";

const districtCenters: Record<string,[number,number]> = {
  Başiskele:[40.696,29.927], Çayırova:[40.826,29.374], Darıca:[40.770,29.386],
  Derince:[40.758,29.833], Dilovası:[40.786,29.542], Gebze:[40.802,29.431],
  Gölcük:[40.716,29.829], İzmit:[40.766,29.940], Kandıra:[41.070,30.153],
  Karamürsel:[40.691,29.616], Kartepe:[40.745,30.020], Körfez:[40.777,29.738],
};

const parks = KOCAELI_PARKS.map((park,index)=>{
  const center=districtCenters[park.district];
  const offsetLat=((index%5)-2)*0.006;
  const offsetLng=(((index*3)%7)-3)*0.008;
  const score=22+((index*13)%67);
  return {name:park.name,district:park.district,position:[center[0]+offsetLat,center[1]+offsetLng] as [number,number],score,color:score>79?"#dc3f4f":score>59?"#f2a61a":"#18a66a"};
});

const icon = (color: string) => L.divIcon({ className: "park-marker-wrap", html: `<span class="park-marker" style="--marker:${color}"><span></span></span>`, iconSize: [34, 42], iconAnchor: [17, 38] });

export default function ParkMap({onOpenDetails}:{onOpenDetails?:()=>void}) {
  return <div className="leaflet-shell"><MapContainer center={[40.754, 29.760]} zoom={9} minZoom={8} maxZoom={18} scrollWheelZoom zoomControl doubleClickZoom touchZoom boxZoom><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{parks.map(park => <Marker key={park.name} position={park.position} icon={icon(park.color)}><Popup><strong>{park.name}</strong><br/>{park.district}<br/>Bakım puanı: {park.score}/100</Popup></Marker>)}</MapContainer>{onOpenDetails&&<button className="map-detail" onClick={onOpenDetails}>Kocaeli haritasını aç <ChevronIcon/></button>}</div>;
}

function ChevronIcon(){ return <span>→</span>; }
