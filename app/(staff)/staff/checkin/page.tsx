"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserCheck, Clock3, CheckCircle, Search, CalendarDays, Users } from "lucide-react";
import { SESI_OPTIONS } from "@/lib/types";

export default function StaffCheckinPage() {
  const supabase = createClient();
  const [reservasi, setReservasi] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [sesi, setSesi] = useState("Semua");

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reservasi")
      .select("*, meja(*, outlets(*)), users!reservasi_user_id_fkey(nama, username)")
      .eq("tanggal", tanggal)
      .eq("status", "Mendatang")
      .order("sesi");
    if (sesi !== "Semua") query = query.eq("sesi", sesi);
    const { data } = await query;
    setReservasi(data || []);
    setLoading(false);
  }, [supabase, tanggal, sesi]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCheckin(id: string) {
    setUpdating(id);
    await supabase.from("reservasi").update({
      checked_in_at: new Date().toISOString(),
      status: "Selesai",
    }).eq("id", id);
    await fetchData();
    setUpdating(null);
  }

  const filtered = reservasi.filter(r => {
    if (!search) return true;
    const meja = r.meja as Record<string, unknown>;
    const userR = r.users as Record<string, unknown>;
    return String(meja?.nomor || "").toLowerCase().includes(search.toLowerCase()) ||
      String(userR?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      String(userR?.username || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Check-in Pelanggan</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Tandai kehadiran pelanggan yang datang</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari meja atau pelanggan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400" />
        </div>
        <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400" />
        <select value={sesi} onChange={e => setSesi(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400">
          <option value="Semua">Semua Sesi</option>
          {SESI_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">Tidak ada reservasi yang menunggu check-in.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const meja = r.meja as Record<string, unknown>;
            const outlet = (meja?.outlets as Record<string, unknown>);
            const userR = r.users as Record<string, unknown>;
            return (
              <div key={r.id as string} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-100">
                  <Clock3 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm mb-1" style={{ color: "#1e0d3a" }}>
                    {String(meja?.nomor || "—")} — {String(outlet?.nama_outlet || "—")}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{String(r.tanggal || "")}</span>
                    <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{String(r.sesi || "")}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{String(r.jumlah_orang || "")} Orang</span>
                    <span className="text-purple-500 font-medium">👤 {String(userR?.nama || userR?.username || "—")}</span>
                  </div>
                </div>
                <button onClick={() => handleCheckin(r.id as string)} disabled={updating === r.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 shrink-0">
                  {updating === r.id
                    ? <div className="w-4 h-4 border-2 border-green-400 border-t-green-700 rounded-full animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Check-in
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
