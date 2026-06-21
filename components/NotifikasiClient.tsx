"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Bell, BellRing, CalendarDays } from "lucide-react";

interface NotifikasiProps {
  initialData: any[];
}

export default function NotifikasiClient({ initialData }: NotifikasiProps) {
  const supabase = createClient();
  const [notifikasi, setNotifikasi] = useState(initialData);

  useEffect(() => {
    async function markAsRead() {
      const unreadIds = notifikasi.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      await supabase.from("notifikasi").update({ is_read: true }).in("id", unreadIds);
      
      setNotifikasi(prev => prev.map(n => ({ ...n, is_read: true })));
    }
    markAsRead();
  }, [notifikasi, supabase]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bold text-3xl mb-1 flex items-center gap-3" style={{ color: "#1e0d3a" }}>
          <Bell className="w-8 h-8" style={{ color: "#f59e0b" }} /> Notifikasi Anda
        </h1>
        <p className="text-sm" style={{ color: "#9c8ab0" }}>Pemberitahuan seputar reservasi dan pembayaran Anda</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifikasi.length === 0 ? (
          <div className="p-16 text-center">
            <BellRing className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada notifikasi.</p>
            <p className="text-sm text-gray-400 mt-1">Pemberitahuan terkait pesanan Anda akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifikasi.map((n) => (
              <div key={n.id} className={`p-6 flex items-start gap-4 transition-colors ${!n.is_read ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                  {n.tipe === "Pembayaran" ? <Bell className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`text-base mb-1 ${!n.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                    Status {n.tipe}
                  </h3>
                  <p className={`text-sm ${!n.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                    {n.pesan}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-2 ml-auto" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
