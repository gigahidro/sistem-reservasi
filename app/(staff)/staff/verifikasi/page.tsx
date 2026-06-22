"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, X, Eye, CreditCard, AlertCircle } from "lucide-react";

export default function StaffVerifikasiPage() {
  const supabase = createClient();
  const [pembayaran, setPembayaran] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("pembayaran")
      .select("*, reservasi!inner(*, meja(*, outlets(*)), users:users!reservasi_user_id_fkey(nama, username))")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Fetch pembayaran error:", error);
      setErrorMsg(error.message);
    }
    
    setPembayaran(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function verify(id: string, reservasiId: string, approved: boolean) {
    setUpdating(id);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("pembayaran").update({
      status: approved,
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
    }).eq("id", id);

    // Update reservasi status
    const { data: updatedRes, error: resErr } = await supabase.from("reservasi").update({
      status: approved ? "Mendatang" : "Dibatalkan",
    }).eq("id", reservasiId).select();

    if (resErr || !updatedRes || updatedRes.length === 0) {
      console.error("Gagal update reservasi:", resErr);
      setErrorMsg("Gagal update status reservasi. RLS memblokir update atau ID tidak ditemukan.");
    }

    // Tambah notifikasi
    await supabase.from("notifikasi").insert({
      reservasi_id: reservasiId,
      tipe: "Pembayaran",
      pesan: approved ? "Pembayaran DP berhasil dikonfirmasi. Status reservasi Anda sekarang Mendatang." : "Pembayaran DP ditolak. Reservasi Anda Dibatalkan.",
      is_read: false,
    });

    await fetchData();
    setUpdating(null);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Verifikasi Pembayaran</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Periksa dan verifikasi bukti pembayaran dari pelanggan</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Memuat data...</div>
        ) : errorMsg ? (
          <div className="p-10 text-center text-red-500 font-bold">
            ERROR: {errorMsg}
          </div>
        ) : pembayaran.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Tidak ada data pembayaran.
          </div>
        ) : (
        <div className="space-y-4">
          {pembayaran.map((p) => {
            const res = p.reservasi as Record<string, unknown>;
            const meja = res?.meja as Record<string, unknown>;
            const outlet = (meja?.outlets as Record<string, unknown>);
            const userR = res?.users as Record<string, unknown>;
            const isProcessed = p.verified_at !== null;
            const isApproved = isProcessed && p.status === true;
            const isRejected = isProcessed && p.status === false;
            const isPending = !isProcessed;

            return (
              <div key={p.id as string} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isApproved ? "bg-green-100" : isRejected ? "bg-red-100" : "bg-amber-100"}`}>
                    {isApproved
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : isRejected
                        ? <X className="w-5 h-5 text-red-600" />
                        : <CreditCard className="w-5 h-5 text-amber-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm" style={{ color: "#1e0d3a" }}>
                        {String(meja?.nomor || "—")} — {String(outlet?.nama_outlet || "—")}
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isApproved ? "bg-green-100 text-green-700" : isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {isApproved ? "Terverifikasi" : isRejected ? "Ditolak" : "Menunggu Verifikasi"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      👤 {String(userR?.nama || userR?.username || "—")} · {String(res?.tanggal || "")} · {String(res?.sesi || "")}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: "#5b2d8a" }}>
                      DP: Rp {Number(p.jumlah_dp || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {typeof p.bukti_pembayaran === "string" && p.bukti_pembayaran && (
                      <button onClick={() => setPreviewUrl(p.bukti_pembayaran as string)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                      </button>
                    )}
                    {isPending && (
                      <div className="flex gap-1.5">
                        <button onClick={() => verify(p.id as string, res.id as string, true)} disabled={updating === p.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                          <CheckCircle className="w-3 h-3" /> ACC
                        </button>
                        <button onClick={() => verify(p.id as string, res.id as string, false)} disabled={updating === p.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50">
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Image preview modal */}
      {previewUrl && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
        </div>,
        document.body
      )}
    </div>
  );
}
