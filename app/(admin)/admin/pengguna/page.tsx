"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Shield, User, Users } from "lucide-react";
import type { UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["Pelanggan", "Staff", "Admin"];

const ROLE_CONFIG: Record<UserRole, { bg: string; text: string; icon: React.ReactNode }> = {
  Pelanggan: { bg: "#ede9fe", text: "#5b21b6", icon: <User className="w-3 h-3" /> },
  Staff: { bg: "#fef3c7", text: "#92400e", icon: <Users className="w-3 h-3" /> },
  Admin: { bg: "#fce7f3", text: "#9d174d", icon: <Shield className="w-3 h-3" /> },
};

export default function AdminPenggunaPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function changeRole(id: string, role: UserRole) {
    setUpdating(id);
    await supabase.from("users").update({ role }).eq("id", id);
    await fetchUsers();
    setUpdating(null);
  }

  const filtered = users.filter(u => {
    if (!search) return true;
    return String(u.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      String(u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      String(u.email || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Kelola Pengguna</h1>
          <p className="text-sm" style={{ color: "#9c8ab0" }}>Lihat dan ubah role semua pengguna sistem</p>
        </div>
        {!loading && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Pengguna</p>
              <p className="text-2xl font-extrabold text-purple-900">{users.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, username, email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400 shadow-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span className="col-span-4">Pengguna</span>
          <span className="col-span-4">Email</span>
          <span className="col-span-2">Role Saat Ini</span>
          <span className="col-span-2 text-right">Ubah Role</span>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Tidak ada pengguna ditemukan.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(u => {
              const roleCfg = ROLE_CONFIG[u.role as UserRole] || ROLE_CONFIG.Pelanggan;
              return (
                <div key={u.id as string} className="px-6 py-4 grid grid-cols-12 items-center gap-2">
                  <div className="col-span-4">
                    <p className="font-semibold text-sm" style={{ color: "#1e0d3a" }}>
                      {String(u.nama || u.username || "—")}
                    </p>
                    <p className="text-xs text-gray-400">@{String(u.username || "—")}</p>
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm text-gray-500 truncate">{String(u.email || "—")}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: roleCfg.bg, color: roleCfg.text }}>
                      {roleCfg.icon}{String(u.role)}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <select value={u.role as string}
                      onChange={e => changeRole(u.id as string, e.target.value as UserRole)}
                      disabled={updating === u.id}
                      className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 bg-white">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
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
