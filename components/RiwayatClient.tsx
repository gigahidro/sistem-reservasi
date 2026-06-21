"use client";

import { useState, useMemo } from "react";
import RiwayatCard from "@/components/RiwayatCard";
import type { Reservasi, ReservasiStatus } from "@/lib/types";
import { Search } from "lucide-react";

type FilterTab = "Semua" | ReservasiStatus;

const TABS: FilterTab[] = ["Semua", "Menunggu Konfirmasi", "Mendatang", "Selesai", "Dibatalkan"];

interface RiwayatClientProps {
  initialReservasi: Reservasi[];
  onRefresh: () => Promise<Reservasi[]>;
}

export default function RiwayatClient({
  initialReservasi,
  onRefresh,
}: RiwayatClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("Semua");
  const [reservasi, setReservasi] = useState<Reservasi[]>(initialReservasi);
  const [search, setSearch] = useState("");

  async function handleUpdate() {
    const fresh = await onRefresh();
    setReservasi(fresh);
  }

  const filtered = useMemo(() => {
    let list =
      activeTab === "Semua"
        ? reservasi
        : reservasi.filter((r) => r.status === activeTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.meja?.nomor?.toLowerCase().includes(q) ||
          r.meja?.outlets?.nama_outlet?.toLowerCase().includes(q) ||
          r.sesi?.toLowerCase().includes(q) ||
          r.tanggal?.includes(q)
      );
    }

    return list;
  }, [reservasi, activeTab, search]);

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "#f8f5f2" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-bold text-3xl mb-1"
          style={{ color: "#1e0d3a" }}
        >
          Riwayat Reservasi
        </h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>
          Lihat semua reservasi yang pernah kamu buat
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "#b8a9cc" }}
        />
        <input
          id="riwayat-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari Reservasi..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 placeholder:text-gray-400 shadow-sm"
        />
      </div>

      {/* Tab filter */}
      <div className="flex items-center gap-1 mb-6">
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                active
                  ? {
                      background: "#2d1152",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(45,17,82,0.25)",
                    }
                  : {
                      color: "#6b7280",
                      background: "transparent",
                    }
              }
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#ede9fe" }}
          >
            <Search className="w-6 h-6" style={{ color: "#7c3aed" }} />
          </div>
          <p className="font-semibold text-gray-700">
            {search ? "Tidak ada hasil pencarian" : "Tidak ada reservasi"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {search
              ? `Tidak ditemukan reservasi untuk "${search}"`
              : activeTab === "Semua"
              ? "Anda belum memiliki riwayat reservasi."
              : `Tidak ada reservasi dengan status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RiwayatCard key={r.id} reservasi={r} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
