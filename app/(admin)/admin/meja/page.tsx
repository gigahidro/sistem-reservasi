"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

export default function AdminMejaPage() {
  const supabase = createClient();
  const [meja, setMeja] = useState<Record<string, unknown>[]>([]);
  const [outlets, setOutlets] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ nomor: "", kapasitas: "4", outlet_id: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: m }, { data: o }] = await Promise.all([
      supabase.from("meja").select("*, outlets(*)").order("nomor"),
      supabase.from("outlets").select("*"),
    ]);
    setMeja(m || []);
    setOutlets(o || []);
    if (o?.length && !form.outlet_id) setForm(f => ({ ...f, outlet_id: String(o[0].id || "") }));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave() {
    if (!form.nomor || !form.outlet_id) return;
    setSaving(true);
    if (editing) {
      await supabase.from("meja").update({ nomor: form.nomor, kapasitas: Number(form.kapasitas), outlet_id: form.outlet_id }).eq("id", editing.id);
    } else {
      await supabase.from("meja").insert({ nomor: form.nomor, kapasitas: Number(form.kapasitas), outlet_id: form.outlet_id });
    }
    await fetchData();
    setShowForm(false);
    setEditing(null);
    setForm({ nomor: "", kapasitas: "4", outlet_id: String(outlets[0]?.id || "") });
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus meja ini? Semua reservasi terkait akan terpengaruh.")) return;
    setDeleting(id);
    await supabase.from("meja").delete().eq("id", id);
    await fetchData();
    setDeleting(null);
  }

  function startEdit(m: Record<string, unknown>) {
    setEditing(m);
    setForm({ nomor: String(m.nomor || ""), kapasitas: String(m.kapasitas || "4"), outlet_id: String(m.outlet_id || "") });
    setShowForm(true);
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Kelola Data Meja</h1>
          <p className="text-sm" style={{ color: "#9c8ab0" }}>Tambah, edit, dan hapus data meja restoran</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ nomor: "", kapasitas: "4", outlet_id: String(outlets[0]?.id || "") }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
          <Plus className="w-4 h-4" /> Tambah Meja
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-5 mb-5">
          <h3 className="font-bold text-base mb-4" style={{ color: "#1e0d3a" }}>
            {editing ? "Edit Meja" : "Tambah Meja Baru"}
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nomor Meja</label>
              <input value={form.nomor} onChange={e => setForm(f => ({ ...f, nomor: e.target.value }))}
                placeholder="Meja 7" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kapasitas (Pax)</label>
              <input type="number" min="1" max="20" value={form.kapasitas} onChange={e => setForm(f => ({ ...f, kapasitas: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Outlet</label>
              <select value={form.outlet_id} onChange={e => setForm(f => ({ ...f, outlet_id: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400">
                {outlets.map(o => <option key={o.id as string} value={o.id as string}>{String(o.nama_outlet)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
              <X className="w-4 h-4 inline mr-1" /> Batal
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {editing ? "Simpan" : "Tambah"}
            </button>
          </div>
        </div>
      )}

      {/* Meja table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span className="col-span-3">Nomor</span>
          <span className="col-span-2">Kapasitas</span>
          <span className="col-span-4">Outlet</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1 text-right">Aksi</span>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {meja.map(m => {
              const outlet = m.outlets as Record<string, unknown>;
              return (
                <div key={m.id as string} className="px-6 py-3.5 grid grid-cols-12 items-center">
                  <span className="col-span-3 font-semibold text-sm" style={{ color: "#1e0d3a" }}>{String(m.nomor)}</span>
                  <span className="col-span-2 text-sm text-gray-500">{String(m.kapasitas)} Pax</span>
                  <span className="col-span-4 text-sm text-gray-500 truncate">{String(outlet?.nama_outlet || "—")}</span>
                  <span className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {m.is_available ? "Tersedia" : "Tutup"}
                    </span>
                  </span>
                  <div className="col-span-1 flex gap-1 justify-end">
                    <button onClick={() => startEdit(m)} className="w-7 h-7 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-700 transition-colors">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(m.id as string)} disabled={deleting === m.id}
                      className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
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
