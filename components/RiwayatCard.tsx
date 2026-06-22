"use client";

import { createClient } from "@/lib/supabase/client";
import type { Reservasi, ReservasiStatus } from "@/lib/types";
import Link from "next/link";
import { CalendarDays, Clock, Users, X, CheckCircle, Clock3, Loader, Ticket } from "lucide-react";
import { useState } from "react";

interface RiwayatCardProps {
  reservasi: Reservasi;
  onUpdate: () => void;
}

const STATUS_CONFIG: Record<
  ReservasiStatus,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    icon: React.ReactNode;
  }
> = {
  "Menunggu Konfirmasi": {
    label: "Menunggu Konfirmasi",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    icon: <Clock3 className="w-5 h-5" />,
  },
  Mendatang: {
    label: "Mendatang",
    badgeBg: "#ede9fe",
    badgeText: "#5b21b6",
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    icon: <Clock3 className="w-5 h-5" />,
  },
  Selesai: {
    label: "Selesai",
    badgeBg: "#dcfce7",
    badgeText: "#15803d",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  Dibatalkan: {
    label: "Dibatalkan",
    badgeBg: "#fee2e2",
    badgeText: "#b91c1c",
    iconBg: "#fee2e2",
    iconColor: "#dc2626",
    icon: <X className="w-5 h-5" />,
  },
};

export default function RiwayatCard({ reservasi, onUpdate }: RiwayatCardProps) {
  const supabase = createClient();
  const [cancelling, setCancelling] = useState(false);

  const cfg = STATUS_CONFIG[reservasi.status];
  const meja = reservasi.meja;
  const outlet = meja?.outlets;

  const formattedDate = new Date(reservasi.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleCancel() {
    if (!confirm("Yakin ingin membatalkan reservasi ini?")) return;
    setCancelling(true);
    await supabase
      .from("reservasi")
      .update({ status: "Dibatalkan" })
      .eq("id", reservasi.id);
    await supabase.from("notifikasi").insert({
      reservasi_id: reservasi.id,
      tipe: "Pembatalan",
      pesan: `Reservasi ${meja?.nomor} pada ${reservasi.tanggal} telah dibatalkan.`,
    });
    setCancelling(false);
    onUpdate();
  }

  return (
    <div
      id={`riwayat-card-${reservasi.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4"
    >
      <div className="flex items-center gap-4">
        {/* Colored icon box */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.iconBg, color: cfg.iconColor }}
        >
          {cfg.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-base mb-1" style={{ color: "#1e0d3a" }}>
            {meja?.nomor || "—"}
            {outlet && (
              <span className="font-bold"> — {outlet.nama_outlet}</span>
            )}
          </h3>

          {/* Date + Sesi row */}
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {reservasi.sesi}
            </span>
          </div>

          {/* People */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span>{reservasi.jumlah_orang} Orang</span>
          </div>
        </div>

        {/* Status badge + optional cancel */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-center"
            style={{ background: cfg.badgeBg, color: cfg.badgeText }}
          >
            {cfg.label}
            {reservasi.status === "Menunggu Konfirmasi" && Array.isArray(reservasi.pembayaran) && reservasi.pembayaran[0]?.status === false && (
              <span className="block text-[10px] mt-0.5 font-normal opacity-80">(Menunggu Verifikasi Pembayaran)</span>
            )}
          </span>

          {reservasi.status === "Mendatang" && (
            <Link 
              href={`/dashboard/tiket/${reservasi.id}`}
              className="mt-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              E-Ticket
            </Link>
          )}

          {(reservasi.status === "Mendatang" || reservasi.status === "Menunggu Konfirmasi") && (
            <button
              id={`btn-cancel-${reservasi.id}`}
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-60"
            >
              {cancelling ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <X className="w-3 h-3" />
              )}
              Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
