import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Clock3, CheckCircle, Users, CreditCard } from "lucide-react";

export const metadata = { title: "Staff — Hari Ini | PTIK YUMFOOD" };

export default async function StaffOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const [{ data: todayRes }, { data: pendingPayment }, { data: allToday }] = await Promise.all([
    supabase.from("reservasi").select("*, meja(*, outlets(*))")
      .eq("tanggal", today).neq("status", "Dibatalkan").order("sesi"),
    supabase.from("pembayaran").select("*, reservasi!inner(tanggal)")
      .eq("status", false).eq("reservasi.tanggal", today),
    supabase.from("reservasi").select("id, status").eq("tanggal", today),
  ]);

  const stats = [
    { label: "Reservasi Hari Ini", value: allToday?.length ?? 0, icon: CalendarDays, color: "#7c3aed", bg: "#ede9fe" },
    { label: "Menunggu Check-in", value: todayRes?.filter(r => !r.checked_in_at && r.status === "Mendatang").length ?? 0, icon: Clock3, color: "#d97706", bg: "#fef3c7" },
    { label: "Sudah Check-in", value: todayRes?.filter(r => r.checked_in_at).length ?? 0, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "Pembayaran Belum Verifikasi", value: pendingPayment?.length ?? 0, icon: CreditCard, color: "#dc2626", bg: "#fee2e2" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl mb-1" style={{ color: "#1e0d3a" }}>Hari Ini</h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-3xl font-extrabold" style={{ color }}>{value}</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's reservasi list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg" style={{ color: "#1e0d3a" }}>Daftar Reservasi Hari Ini</h2>
        </div>
        {!todayRes?.length ? (
          <div className="p-10 text-center text-gray-400">Tidak ada reservasi hari ini.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayRes.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: r.checked_in_at ? "#dcfce7" : "#fef3c7" }}>
                  {r.checked_in_at
                    ? <CheckCircle className="w-5 h-5" style={{ color: "#16a34a" }} />
                    : <Clock3 className="w-5 h-5" style={{ color: "#d97706" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "#1e0d3a" }}>
                    {(r.meja as { nomor?: string })?.nomor} — {(r.meja as { outlets?: { nama_outlet?: string } })?.outlets?.nama_outlet}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{r.sesi}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.jumlah_orang} Orang</span>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.checked_in_at ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.checked_in_at ? "Check-in ✓" : "Menunggu"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
