"use client";

import { useEffect, useState } from "react";
import { KOCAELI_PARKS } from "../data/kocaeliParks";
import { recordsApi } from "../services/api";

export type PublicParkRecord = {
  id: number;
  name: string;
  district: string;
  neighborhood: string;
  occupancy?: number;
  detail?: string;
  status?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hours?: string;
  amenities?: string;
  criticalReason?: string;
};

export function usePublicParks() {
  const [parks,setParks]=useState<PublicParkRecord[]>(()=>KOCAELI_PARKS.map((park,index)=>({id:index+1,...park,status:"Aktif"})));
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{void(async()=>{
    try {
      let records=await recordsApi.list<PublicParkRecord>("parks");
      if(records.length===0)records=await recordsApi.bootstrap("parks",KOCAELI_PARKS.map((park,index)=>({id:index+1,...park,status:"Aktif",score:0,capacity:500})));
      setParks(records);setError("");
    } catch(exception) {setError(exception instanceof Error?exception.message:"Parklar yüklenemedi.")}
    finally {setLoading(false)}
  })()},[]);
  return {parks,loading,error};
}
