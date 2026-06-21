"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Users } from "lucide-react";

export default function StaffMejaPage() {
  const supabase = createClient();
  const [meja, setMeja] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchMeja = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("meja").select("*, outlets(*)").order("nomor");
    setMeja(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchMeja(); }, [fetchMeja]);

  async function toggleStatus(id: string, current: boolean) {
    setUpdating(id);
    await supabase.from("meja").update({ is_available: !current }).eq("id", id);
    await fetchMeja();
    setUpdating(null);
  }

  const available = meja.filter(m => m.is_available).length;
  const unavailable = meja.length - available;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Kelola Status Meja</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Atur ketersediaan meja secara manual</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-extrabold text-purple-700">{meja.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Meja</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-extrabold text-green-600">{available}</p>
          <p className="text-xs text-gray-500 mt-1">Tersedia</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-extrabold text-red-500">{unavailable}</p>
          <p className="text-xs text-gray-500 mt-1">Tidak Tersedia</p>
        </div>
      </div>

      {/* Meja grid */}
      {loading ? (
        <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {meja.map(m => {
            const isAvailable = m.is_available as boolean;
            const outlet = m.outlets as Record<string, unknown>;
            return (
              <div key={m.id as string}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
                {/* Visual table */}
                <div className="w-20 h-16 rounded-xl flex flex-col items-center justify-center"
                  style={{ background: isAvailable ? "#ede9fe" : "#fee2e2" }}>
                  <span className="font-bold text-sm" style={{ color: isAvailable ? "#5b21b6" : "#b91c1c" }}>
                    {String(m.nomor || "")}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" style={{ color: isAvailable ? "#7c3aed" : "#dc2626" }} />
                    <span className="text-xs" style={{ color: isAvailable ? "#7c3aed" : "#dc2626" }}>
                      {String(m.kapasitas || "")} Pax
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-700">{String(outlet?.nama_outlet || "")}</p>
                  <span className={`text-xs font-semibold ${isAvailable ? "text-green-600" : "text-red-500"}`}>
                    {isAvailable ? "● Tersedia" : "● Tidak Tersedia"}
                  </span>
                </div>

                <button
                  id={`toggle-meja-${m.id}`}
                  onClick={() => toggleStatus(m.id as string, isAvailable)}
                  disabled={updating === m.id}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                    isAvailable
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}>
                  {updating === m.id
                    ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : isAvailable
                      ? <><XCircle className="w-3.5 h-3.5" /> Tutup Meja</>
                      : <><CheckCircle className="w-3.5 h-3.5" /> Buka Meja</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
