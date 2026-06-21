"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import MejaCard from "@/components/MejaCard";
import ReservasiModal from "@/components/ReservasiModal";
import type { Meja, Outlet, Reservasi } from "@/lib/types";
import { SESI_OPTIONS } from "@/lib/types";
import { MapPin, Clock, CalendarDays, Info } from "lucide-react";

interface DenahClientProps {
  userId: string;
  outlets: Outlet[];
}

// Layout positions for the 6 tables to match the reference UI
// Grid positions: [col, row] in a 3-col visual layout
const MEJA_LAYOUT_ORDER = [
  "Meja 1",
  "Meja 6",
  "Meja 2",
  "Meja 5",
  "Meja 3",
  "Meja 4",
];

export default function DenahClient({ userId, outlets }: DenahClientProps) {
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(
    outlets[0] || null
  );
  const [selectedSesi, setSelectedSesi] = useState(SESI_OPTIONS[0]);
  const [selectedTanggal, setSelectedTanggal] = useState(today);
  const [mejaList, setMejaList] = useState<(Meja & { outlets: Outlet })[]>([]);
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([]);
  const [selectedMeja, setSelectedMeja] = useState<
    (Meja & { outlets: Outlet }) | null
  >(null);
  const [loadingMeja, setLoadingMeja] = useState(false);

  const fetchMejaAndReservasi = useCallback(async () => {
    if (!selectedOutlet) return;
    setLoadingMeja(true);

    // Fetch meja for selected outlet
    const { data: meja } = await supabase
      .from("meja")
      .select("*, outlets(*)")
      .eq("outlet_id", selectedOutlet.id)
      .order("nomor");

    // Fetch active reservasi for this outlet/sesi/tanggal
    const { data: reservasi } = await supabase
      .from("reservasi")
      .select("*, meja(*)")
      .eq("tanggal", selectedTanggal)
      .eq("sesi", selectedSesi)
      .neq("status", "Dibatalkan");

    // Filter reservasi only for this outlet's meja
    const outletMejaIds = (meja || []).map((m) => m.id);
    const filteredReservasi = (reservasi || []).filter((r) =>
      outletMejaIds.includes(r.meja_id)
    );

    setMejaList((meja as (Meja & { outlets: Outlet })[]) || []);
    setReservasiList(filteredReservasi as Reservasi[]);
    setLoadingMeja(false);
  }, [selectedOutlet, selectedSesi, selectedTanggal, supabase]);

  useEffect(() => {
    fetchMejaAndReservasi();
  }, [fetchMejaAndReservasi]);

  // Sort meja according to layout order
  const sortedMeja = MEJA_LAYOUT_ORDER.map(
    (name) => mejaList.find((m) => m.nomor === name)!
  ).filter(Boolean);

  return (
    <div className="p-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-purple-900 font-extrabold text-3xl">
          Reservasi Meja
        </h1>
        <p className="text-purple-500 text-sm mt-1">
          Pilih meja dan sesi yang tersedia sesuai kebutuhan Anda.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Outlet */}
          <div>
            <label className="flex items-center gap-1.5 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Outlet
            </label>
            <select
              id="filter-outlet"
              value={selectedOutlet?.id || ""}
              onChange={(e) => {
                const outlet = outlets.find((o) => o.id === e.target.value);
                setSelectedOutlet(outlet || null);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-purple-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nama_outlet}
                </option>
              ))}
            </select>
          </div>

          {/* Sesi */}
          <div>
            <label className="flex items-center gap-1.5 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              Pilih Sesi
            </label>
            <select
              id="filter-sesi"
              value={selectedSesi}
              onChange={(e) => setSelectedSesi(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-purple-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              {SESI_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="flex items-center gap-1.5 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              Tanggal
            </label>
            <input
              id="filter-tanggal"
              type="date"
              value={selectedTanggal}
              min={today}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-purple-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-5 px-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-700 shadow" />
          <span className="text-purple-700 text-sm font-medium">Tersedia</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 shadow" />
          <span className="text-purple-700 text-sm font-medium">
            Tidak Tersedia (Full)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold-400 shadow" />
          <span className="text-purple-700 text-sm font-medium">
            Klik Meja Untuk Detail
          </span>
        </div>
      </div>

      {/* Denah Floor Plan */}
      <div className="denah-floor rounded-3xl p-8 shadow-inner min-h-[420px] relative">
        {loadingMeja ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-16 gap-y-10 max-w-lg">
            {sortedMeja.map((meja) => (
              <MejaCard
                key={meja.id}
                meja={meja}
                reservasi={reservasiList}
                onClick={() => setSelectedMeja(meja)}
              />
            ))}

            {/* Kasir box — absolutely positioned right */}
            <div
              className="absolute right-8 top-1/2 -translate-y-1/2"
              style={{
                width: "110px",
                height: "90px",
                border: "2px solid #d97706",
                borderRadius: "12px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="text-gold-600 font-bold text-lg">Kasir</span>
            </div>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="mt-4 px-5 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <p className="text-blue-700 text-sm">
          Klik pada meja untuk melihat detail dan melakukan reservasi
        </p>
      </div>

      {/* Modal */}
      {selectedMeja && (
        <ReservasiModal
          meja={selectedMeja}
          sesi={selectedSesi}
          tanggal={selectedTanggal}
          userId={userId}
          onClose={() => setSelectedMeja(null)}
          onSuccess={fetchMejaAndReservasi}
        />
      )}
    </div>
  );
}
