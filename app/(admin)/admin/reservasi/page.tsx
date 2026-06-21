"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, CalendarDays, Clock3, Users, CheckCircle, X } from "lucide-react";

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  "Menunggu Konfirmasi": { bg: "#fef3c7", text: "#92400e" },
  Mendatang: { bg: "#ede9fe", text: "#5b21b6" },
  Selesai: { bg: "#dcfce7", text: "#15803d" },
  Dibatalkan: { bg: "#fee2e2", text: "#b91c1c" },
};

export default function AdminReservasiPage() {
  const supabase = createClient();
  const [reservasi, setReservasi] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservasi")
      .select("*, meja(*, outlets(*)), users!reservasi_user_id_fkey(nama, username, email)")
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false });
    setReservasi(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const { data: { user } } = await supabase.auth.getUser();

    // Update reservasi
    await supabase.from("reservasi").update({ status }).eq("id", id);

    // Update pembayaran (jika ada)
    await supabase.from("pembayaran").update({
      status: status === "Mendatang",
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
    }).eq("reservasi_id", id);

    // Insert notifikasi
    await supabase.from("notifikasi").insert({
      reservasi_id: id,
      tipe: "Pembayaran",
      pesan: status === "Mendatang" 
        ? "Pembayaran DP berhasil dikonfirmasi. Status reservasi Anda sekarang Mendatang." 
        : "Pembayaran DP ditolak. Reservasi Anda Dibatalkan.",
      is_read: false,
    });

    await fetchData();
    setUpdating(null);
  }

  const filtered = reservasi.filter(r => {
    const meja = r.meja as Record<string, unknown>;
    const outlet = (meja?.outlets as Record<string, unknown>);
    const userR = r.users as Record<string, unknown>;
    const matchSearch = !search ||
      String(meja?.nomor || "").toLowerCase().includes(search.toLowerCase()) ||
      String(outlet?.nama_outlet || "").toLowerCase().includes(search.toLowerCase()) ||
      String(userR?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      String(userR?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Semua Reservasi</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Pantau seluruh reservasi di semua outlet</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {["Semua", "Menunggu Konfirmasi", "Mendatang", "Selesai", "Dibatalkan"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={filterStatus === s
              ? { background: "#2d1152", color: "white", boxShadow: "0 2px 8px rgba(45,17,82,0.25)" }
              : { color: "#6b7280", background: "transparent" }}>
            {s}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..."
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400 w-48" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span className="col-span-3">Meja / Outlet</span>
          <span className="col-span-3">Pelanggan</span>
          <span className="col-span-2">Tanggal</span>
          <span className="col-span-3">Sesi</span>
          <span className="col-span-1 text-right">Status</span>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Tidak ada data.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(r => {
              const meja = r.meja as Record<string, unknown>;
              const outlet = (meja?.outlets as Record<string, unknown>);
              const userR = r.users as Record<string, unknown>;
              const badge = STATUS_BADGE[r.status as string] || STATUS_BADGE.Mendatang;
              return (
                <div key={r.id as string} className="px-6 py-3.5 grid grid-cols-12 items-center gap-2">
                  <div className="col-span-3">
                    <p className="font-semibold text-sm" style={{ color: "#1e0d3a" }}>{String(meja?.nomor || "—")}</p>
                    <p className="text-xs text-gray-400">{String(outlet?.nama_outlet || "—")}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700">{String(userR?.nama || userR?.username || "—")}</p>
                    <p className="text-xs text-gray-400">{String(userR?.email || "")}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-sm text-gray-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{new Date(r.tanggal as string).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-1 text-xs text-gray-500">
                    <Clock3 className="w-3 h-3" />
                    <span className="truncate">{String(r.sesi || "")}</span>
                  </div>
                  <div className="col-span-1 flex flex-col items-end gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: badge.bg, color: badge.text }}>
                      {String(r.status)}
                    </span>
                    {r.status === "Menunggu Konfirmasi" && (
                      <div className="flex gap-1.5 mt-1">
                        <button onClick={() => updateStatus(r.id as string, "Mendatang")}
                          disabled={updating === r.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                          <CheckCircle className="w-3 h-3" /> ACC
                        </button>
                        <button onClick={() => updateStatus(r.id as string, "Dibatalkan")}
                          disabled={updating === r.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50">
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
