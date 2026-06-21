"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, X, Clock3, CalendarDays, Users, Search, Filter, Eye, CreditCard } from "lucide-react";

export default function StaffReservasiPage() {
  const supabase = createClient();
  const [reservasi, setReservasi] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [updating, setUpdating] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchReservasi = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservasi")
      .select("*, meja(*, outlets(*)), users!reservasi_user_id_fkey(nama, username, email), pembayaran(jumlah_dp, bukti_pembayaran, status)")
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false });
    setReservasi(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchReservasi(); }, [fetchReservasi]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await supabase.from("reservasi").update({ status }).eq("id", id);
    await fetchReservasi();
    setUpdating(null);
  }

  const filtered = reservasi.filter((r) => {
    const meja = r.meja as Record<string, unknown>;
    const outlet = (meja?.outlets as Record<string, unknown>);
    const userR = r.users as Record<string, unknown>;
    const matchSearch = !search ||
      String(meja?.nomor || "").toLowerCase().includes(search.toLowerCase()) ||
      String(outlet?.nama_outlet || "").toLowerCase().includes(search.toLowerCase()) ||
      String(userR?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      String(userR?.username || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
    "Menunggu Konfirmasi": { bg: "#fef3c7", text: "#92400e" },
    Mendatang: { bg: "#ede9fe", text: "#5b21b6" },
    Selesai: { bg: "#dcfce7", text: "#15803d" },
    Dibatalkan: { bg: "#fee2e2", text: "#b91c1c" },
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Semua Reservasi</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Konfirmasi atau tolak reservasi pelanggan</p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari meja, pelanggan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400 appearance-none">
            {["Semua", "Menunggu Konfirmasi", "Mendatang", "Selesai", "Dibatalkan"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Tidak ada data reservasi.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((r) => {
              const meja = r.meja as Record<string, unknown>;
              const outlet = (meja?.outlets as Record<string, unknown>);
              const userR = r.users as Record<string, unknown>;
              const badge = STATUS_BADGE[r.status as string] || STATUS_BADGE.Mendatang;
              return (
                <div key={r.id as string} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: "#1e0d3a" }}>
                        {String(meja?.nomor || "—")} — {String(outlet?.nama_outlet || "—")}
                      </p>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: badge.bg, color: badge.text }}>
                        {String(r.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />
                        {new Date(r.tanggal as string).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{String(r.sesi)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{String(r.jumlah_orang)} Orang</span>
                      <span className="text-purple-400">👤 {String(userR?.nama || userR?.username || "—")}</span>
                    </div>
                    {/* Pembayaran Info */}
                    {Boolean(r.pembayaran) && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-600 rounded-md flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> DP: Rp {Number(
                            Array.isArray(r.pembayaran) ? r.pembayaran[0]?.jumlah_dp : (r.pembayaran as any)?.jumlah_dp || 0
                          ).toLocaleString("id-ID")}
                        </span>
                        {(Array.isArray(r.pembayaran) ? r.pembayaran[0]?.bukti_pembayaran : (r.pembayaran as any)?.bukti_pembayaran) && (
                          <button onClick={() => setPreviewUrl(Array.isArray(r.pembayaran) ? r.pembayaran[0]?.bukti_pembayaran : (r.pembayaran as any)?.bukti_pembayaran)}
                            className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {r.status === "Menunggu Konfirmasi" && (
                    <div className="flex gap-2 shrink-0 self-start md:self-auto w-full md:w-auto mt-2 md:mt-0">
                      <button onClick={() => updateStatus(r.id as string, "Mendatang")}
                        disabled={updating === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" /> Konfirmasi
                      </button>
                      <button onClick={() => updateStatus(r.id as string, "Dibatalkan")}
                        disabled={updating === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50">
                        <X className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-semibold text-purple-900">Bukti Pembayaran</p>
              <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Bukti pembayaran" className="w-full object-contain max-h-96" />
          </div>
        </div>
      )}
    </div>
  );
}
