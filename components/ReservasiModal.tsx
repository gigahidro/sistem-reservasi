"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Meja, Outlet } from "@/lib/types";
import { X, Users, CreditCard, Upload, CheckCircle, Loader } from "lucide-react";

interface ReservasiModalProps {
  meja: Meja & { outlets: Outlet };
  sesi: string;
  tanggal: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservasiModal({
  meja,
  sesi,
  tanggal,
  userId,
  onClose,
  onSuccess,
}: ReservasiModalProps) {
  const supabase = createClient();
  const [jumlahOrang, setJumlahOrang] = useState(1);
  const [jumlahDp, setJumlahDp] = useState("");
  const [bukti, setBukti] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!bukti) {
      setError("Bukti pembayaran wajib diunggah.");
      setLoading(false);
      return;
    }

    try {
      // 1. Insert reservasi
      const { data: reservasi, error: resErr } = await supabase
        .from("reservasi")
        .insert({
          user_id: userId,
          meja_id: meja.id,
          tanggal,
          sesi,
          jumlah_orang: jumlahOrang,
          status: "Menunggu Konfirmasi",
        })
        .select()
        .single();

      if (resErr) throw resErr;

      // 2. Upload bukti if provided
      let buktiUrl: string | null = null;
      if (bukti) {
        const ext = bukti.name.split(".").pop();
        const path = `bukti-pembayaran/${reservasi.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("pembayaran")
          .upload(path, bukti, { upsert: true });

        if (uploadErr) {
          console.error("Upload error:", uploadErr);
          throw new Error("Gagal mengunggah foto. Pastikan bucket 'pembayaran' sudah dibuat dan diatur ke public.");
        }

        const { data: urlData } = supabase.storage
          .from("pembayaran")
          .getPublicUrl(path);
        buktiUrl = urlData.publicUrl;
      }

      // 3. Insert pembayaran
      const { error: payErr } = await supabase.from("pembayaran").insert({
        reservasi_id: reservasi.id,
        jumlah_dp: parseFloat(jumlahDp) || 0,
        bukti_pembayaran: buktiUrl,
        status: false, // Selalu false di awal, menunggu Staff ACC
      });

      if (payErr) {
        console.error("Insert pembayaran error:", payErr);
        throw new Error("Gagal menyimpan data pembayaran: " + payErr.message);
      }

      // 4. Insert notifikasi
      await supabase.from("notifikasi").insert({
        reservasi_id: reservasi.id,
        tipe: "Reservasi Baru",
        pesan: `Reservasi ${meja.nomor} pada ${tanggal} ${sesi} berhasil dibuat.`,
      });

      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-purple-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-3xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-purple-200/30">
          <div>
            <h3 className="text-purple-900 font-bold text-lg">
              {step === "success" ? "Reservasi Berhasil! 🎉" : "Detail Reservasi"}
            </h3>
            {step === "form" && (
              <p className="text-purple-600 text-xs mt-0.5">
                {meja.outlets?.nama_outlet}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-purple-700" />
          </button>
        </div>

        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-purple-800 font-semibold">
              Reservasi Anda telah dikonfirmasi!
            </p>
            <p className="text-purple-500 text-sm mt-2">
              {meja.nomor} — {sesi}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Meja Info */}
            <div className="bg-purple-800/10 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-500">Meja</span>
                <span className="font-semibold text-purple-900">{meja.nomor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-500">Kapasitas</span>
                <span className="font-semibold text-purple-900">{meja.kapasitas} Pax</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-500">Sesi</span>
                <span className="font-semibold text-purple-900 text-right max-w-[180px]">{sesi}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-500">Tanggal</span>
                <span className="font-semibold text-purple-900">
                  {new Date(tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Jumlah Orang */}
            <div>
              <label className="block text-purple-700 text-sm font-medium mb-1.5">
                <Users className="w-3.5 h-3.5 inline mr-1.5" />
                Jumlah Tamu
              </label>
              <select
                id="modal-jumlah-orang"
                value={jumlahOrang}
                onChange={(e) => setJumlahOrang(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-purple-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                {Array.from({ length: meja.kapasitas }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} Orang
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-purple-700 text-sm font-medium mb-1.5">
                <CreditCard className="w-3.5 h-3.5 inline mr-1.5" />
                Jumlah DP (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-jumlah-dp"
                type="number"
                value={jumlahDp}
                onChange={(e) => setJumlahDp(e.target.value)}
                placeholder="Minimal Rp 50.000"
                required
                min="50000"
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-purple-900 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder:text-purple-300"
              />
            </div>

            <div>
              <label className="block text-purple-700 text-sm font-medium mb-1.5">
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                Bukti Pembayaran <span className="text-red-500">*</span>
              </label>
              <label
                htmlFor="modal-bukti"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-purple-300 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-500 truncate">
                  {bukti ? bukti.name : "Klik untuk upload gambar"}
                </span>
              </label>
              <input
                id="modal-bukti"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setBukti(e.target.files?.[0] || null)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-purple-200 text-purple-700 text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn-confirm-reservasi"
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Konfirmasi"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
