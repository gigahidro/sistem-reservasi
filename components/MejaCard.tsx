"use client";

import type { Meja, Outlet, Reservasi } from "@/lib/types";
import { Users } from "lucide-react";

interface MejaCardProps {
  meja: Meja & { outlets: Outlet };
  reservasi: Reservasi[];
  onClick: () => void;
}

// Chair positions around the table
const CHAIR_POSITIONS = [
  { top: "-14px", left: "50%", transform: "translateX(-50%)" },
  { bottom: "-14px", left: "50%", transform: "translateX(-50%)" },
  { left: "-14px", top: "50%", transform: "translateY(-50%)" },
  { right: "-14px", top: "50%", transform: "translateY(-50%)" },
];

export default function MejaCard({ meja, reservasi, onClick }: MejaCardProps) {
  const isTaken = reservasi.some((r) => r.meja_id === meja.id);
  const isClosed = !meja.is_available;
  const isUnavailable = isTaken || isClosed;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Table with chairs */}
      <div
        id={`meja-${meja.nomor.toLowerCase().replace(/\s+/g, "-")}`}
        className={`relative ${!isUnavailable ? "cursor-pointer group" : ""}`}
        style={{ width: "130px", height: "110px" }}
        onClick={!isUnavailable ? onClick : undefined}
        title={isClosed ? `${meja.nomor} — Meja Ditutup` : isTaken ? `${meja.nomor} — Sudah Direservasi` : `${meja.nomor} — Tersedia, klik untuk reservasi`}
      >
        {/* Chairs */}
        {CHAIR_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              ...pos,
              width: "22px",
              height: "18px",
              borderRadius: "4px",
              background: isClosed ? "#4b5563" : isTaken ? "#7f1d1d" : "#4a2060",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        ))}

        {/* Table surface */}
        <div
          className={`
            absolute inset-x-4 inset-y-3 rounded-2xl flex flex-col items-center justify-center
            transition-all duration-300 select-none
            ${isClosed
              ? "bg-gray-500 ring-2 ring-gray-600 shadow-inner"
              : isTaken
              ? "meja-taken"
              : "meja-available group-hover:scale-105 group-hover:shadow-gold-400/30 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-gold-400"
            }
          `}
        >
          <span className="text-white font-bold text-sm leading-tight text-center px-2">
            {meja.nomor}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-white/70" />
            <span className="text-white/80 text-xs font-medium">
              {meja.kapasitas} Pax
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
