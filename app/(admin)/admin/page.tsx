import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, CalendarDays, CheckCircle, X, TrendingUp } from "lucide-react";

export const metadata = { title: "Admin — Dashboard | PTIK YUMFOOD" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { count: totalUsers },
    { count: totalReservasi },
    { count: selesai },
    { count: dibatalkan },
    { count: menunggu },
    { data: recentRes },
    { data: dpData },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("reservasi").select("*", { count: "exact", head: true }),
    supabase.from("reservasi").select("*", { count: "exact", head: true }).eq("status", "Selesai"),
    supabase.from("reservasi").select("*", { count: "exact", head: true }).eq("status", "Dibatalkan"),
    supabase.from("reservasi").select("*", { count: "exact", head: true }).eq("status", "Menunggu Konfirmasi"),
    supabase.from("reservasi").select("*, meja(*, outlets(*)), users!reservasi_user_id_fkey(nama, username)")
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("pembayaran").select("jumlah_dp, status"),
  ]);

  const totalDP = dpData?.filter(p => p.status).reduce((sum, p) => sum + Number(p.jumlah_dp), 0) ?? 0;
  const mendatang = (totalReservasi ?? 0) - (selesai ?? 0) - (dibatalkan ?? 0) - (menunggu ?? 0);

  const stats = [
    { label: "Total Pengguna", value: totalUsers ?? 0, icon: Users, color: "#7c3aed", bg: "#ede9fe" },
    { label: "Total Reservasi", value: totalReservasi ?? 0, icon: CalendarDays, color: "#d97706", bg: "#fef3c7" },
    { label: "Reservasi Selesai", value: selesai ?? 0, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "Dibatalkan", value: dibatalkan ?? 0, icon: X, color: "#dc2626", bg: "#fee2e2" },
  ];

  const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
    "Menunggu Konfirmasi": { bg: "#fef3c7", text: "#92400e" },
    Mendatang: { bg: "#ede9fe", text: "#5b21b6" },
    Selesai: { bg: "#dcfce7", text: "#15803d" },
    Dibatalkan: { bg: "#fee2e2", text: "#b91c1c" },
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Dashboard & Laporan</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Ringkasan data sistem reservasi PTIK YUMFOOD</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-3xl font-extrabold" style={{ color }}>{value}</span>
            </div>
            <p className="text-gray-500 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef3c7" }}>
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total DP Masuk</p>
            <p className="font-extrabold text-xl" style={{ color: "#1e0d3a" }}>
              Rp {totalDP.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="font-bold text-sm text-gray-700 mb-4">Breakdown Status Reservasi</p>
          <div className="space-y-3">
            {[
              { label: "Menunggu Konfirmasi", count: menunggu ?? 0, color: "#d97706", total: totalReservasi ?? 1 },
              { label: "Mendatang", count: mendatang, color: "#7c3aed", total: totalReservasi ?? 1 },
              { label: "Selesai", count: selesai ?? 0, color: "#16a34a", total: totalReservasi ?? 1 },
              { label: "Dibatalkan", count: dibatalkan ?? 0, color: "#dc2626", total: totalReservasi ?? 1 },
            ].map(({ label, count, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold" style={{ color }}>{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-base" style={{ color: "#1e0d3a" }}>Reservasi Terbaru</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentRes || []).map(r => {
            const meja = r.meja as Record<string, unknown>;
            const outlet = (meja?.outlets as Record<string, unknown>);
            const userR = r.users as Record<string, unknown>;
            const badge = STATUS_BADGE[r.status as string] || STATUS_BADGE.Mendatang;
            return (
              <div key={r.id} className="px-6 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1e0d3a" }}>
                    {String(meja?.nomor || "—")} — {String(outlet?.nama_outlet || "—")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {String(userR?.nama || userR?.username || "—")} · {String(r.tanggal || "")} · {String(r.sesi || "")}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
                  style={{ background: badge.bg, color: badge.text }}>
                  {String(r.status)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
