"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Meja, Outlet, Reservasi } from "@/lib/types";
import { SESI_OPTIONS } from "@/lib/types";
import { MapPin, Clock, CalendarDays, Users } from "lucide-react";

interface StaffDenahClientProps {
  outlets: Outlet[];
}

const MEJA_LAYOUT_ORDER = [
  "Meja 1",
  "Meja 6",
  "Meja 2",
  "Meja 5",
  "Meja 3",
  "Meja 4",
];

export default function StaffDenahClient({ outlets }: StaffDenahClientProps) {
  const supabase = createClient();
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(outlets[0] || null);
  const [selectedSesi, setSelectedSesi] = useState(SESI_OPTIONS[0]);
  const [selectedTanggal, setSelectedTanggal] = useState(today);
  const [mejaList, setMejaList] = useState<(Meja & { outlets: Outlet })[]>([]);
  const [reservasiList, setReservasiList] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedOutlet) return;
    setLoading(true);

    const { data: meja } = await supabase
      .from("meja")
      .select("*, outlets(*)")
      .eq("outlet_id", selectedOutlet.id)
      .order("nomor");

    const { data: reservasi } = await supabase
      .from("reservasi")
      .select("*, meja(*), users!reservasi_user_id_fkey(nama, username)")
      .eq("tanggal", selectedTanggal)
      .eq("sesi", selectedSesi)
      .neq("status", "Dibatalkan");

    const outletMejaIds = (meja || []).map((m) => m.id);
    const filteredReservasi = (reservasi || []).filter((r) => outletMejaIds.includes(r.meja_id));

    setMejaList((meja as (Meja & { outlets: Outlet })[]) || []);
    setReservasiList(filteredReservasi || []);
    setLoading(false);
  }, [selectedOutlet, selectedSesi, selectedTanggal, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedMeja = MEJA_LAYOUT_ORDER.map(
    (name) => mejaList.find((m) => m.nomor === name)!
  ).filter(Boolean);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Ketersediaan Sesi</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Pantau status meja per sesi dalam satu hari</p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 min-w-48">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" /> Outlet
          </label>
          <select
            value={selectedOutlet?.id || ""}
            onChange={(e) => setSelectedOutlet(outlets.find((o) => o.id === e.target.value) || null)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-purple-400"
          >
            {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama_outlet}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <CalendarDays className="w-3.5 h-3.5" /> Tanggal
          </label>
          <input
            type="date"
            value={selectedTanggal}
            onChange={(e) => setSelectedTanggal(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>
        <div className="flex-1 min-w-48">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" /> Sesi
          </label>
          <select
            value={selectedSesi}
            onChange={(e) => setSelectedSesi(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-purple-400"
          >
            {SESI_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5 px-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600 text-sm font-medium">Kosong</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600 text-sm font-medium">Dipesan</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-gray-600 text-sm font-medium">Ditutup</span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[420px] relative overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-max mx-auto relative py-4">
            <div className="grid grid-cols-2 gap-x-16 gap-y-10">
            {sortedMeja.map((meja) => {
              const res = reservasiList.find(r => r.meja_id === meja.id);
              const isAvailable = meja.is_available;
              
              let bg = "bg-green-100 border-green-200";
              let text = "text-green-700";
              
              if (!isAvailable) {
                bg = "bg-gray-100 border-gray-200";
                text = "text-gray-500";
              } else if (res) {
                bg = "bg-red-100 border-red-200";
                text = "text-red-700";
              }

              return (
                <div key={meja.id} className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${bg}`}>
                  <span className={`font-bold text-lg mb-1 ${text}`}>{meja.nomor}</span>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${text}`}>
                    <Users className="w-3.5 h-3.5" />
                    {meja.kapasitas} Pax
                  </div>
                  
                  {res && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-md border border-red-100 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap z-10 font-medium text-gray-800 flex flex-col items-center">
                      <span className="text-red-600 font-bold">{res.users?.nama || res.users?.username}</span>
                      <span className="text-[10px] text-gray-400">{res.status}</span>
                    </div>
                  )}
                  {!isAvailable && !res && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white shadow-md rounded-lg px-2 py-0.5 text-[10px] whitespace-nowrap z-10 font-bold uppercase tracking-wider">
                      Ditutup
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
