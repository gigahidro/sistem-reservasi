"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Shield, User, Users, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "Semua">("Semua");

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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, username, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400 shadow-sm" />
        </div>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm overflow-x-auto shrink-0">
          {(["Semua", ...ROLES] as (UserRole | "Semua")[]).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                roleFilter === r ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-50"
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:grid px-6 py-3 border-b border-gray-100 grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
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
          <div className="flex flex-col">
            {(roleFilter === "Semua" ? ROLES : [roleFilter as UserRole]).map(role => {
              const usersInRole = filtered.filter(u => u.role === role);
              if (usersInRole.length === 0) return null;
              
              return (
                <div key={role} className="flex flex-col">
                  {/* Kategori Role */}
                  <div className="bg-gray-50/80 px-4 md:px-6 py-2.5 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {ROLE_CONFIG[role].icon}
                    {role} ({usersInRole.length})
                  </div>
                  
                  {/* Daftar Pengguna */}
                  <div className="divide-y divide-gray-200">
                    {usersInRole.map(u => {
                      const roleCfg = ROLE_CONFIG[u.role as UserRole] || ROLE_CONFIG.Pelanggan;
                      return (
                        <div key={u.id as string} className="px-4 md:px-6 py-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:gap-2">
                          <div className="md:col-span-4 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm" style={{ color: "#1e0d3a" }}>
                                {String(u.nama || u.username || "—")}
                              </p>
                              <p className="text-xs text-gray-400">@{String(u.username || "—")}</p>
                            </div>
                            <button 
                              onClick={() => setExpandedRow(expandedRow === u.id ? null : u.id as string)}
                              className="p-2 md:hidden text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              {expandedRow === u.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          <div className={`${expandedRow === u.id ? 'flex' : 'hidden'} md:contents flex-col gap-4`}>
                            <div className="md:col-span-4">
                              <p className="text-sm text-gray-500 truncate">{String(u.email || "—")}</p>
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                              <span className="text-xs font-bold text-gray-400 uppercase md:hidden">Role Saat Ini</span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{ background: roleCfg.bg, color: roleCfg.text }}>
                                {roleCfg.icon}{String(u.role)}
                              </span>
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between md:justify-end pt-3 md:pt-0 border-t border-gray-50 md:border-none">
                              <span className="text-xs font-bold text-gray-400 uppercase md:hidden">Ubah Role</span>
                              <select value={u.role as string}
                                onChange={e => changeRole(u.id as string, e.target.value as UserRole)}
                                disabled={updating === u.id}
                                className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 bg-white">
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
