"use client";

import type { Reservasi } from "@/lib/types";
import { CalendarDays, Clock, Users, MapPin, Printer, ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";

export default function TiketClient({ reservasi }: { reservasi: any }) {
  if (reservasi.status === "Dibatalkan" || reservasi.status === "Menunggu Konfirmasi") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center" style={{ background: "#f8f5f2" }}>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tiket Belum Tersedia</h1>
          <p className="text-gray-500 text-sm">Tiket ini belum bisa dicetak karena status reservasi belum disetujui atau sudah dibatalkan.</p>
          <Link href="/dashboard/riwayat" className="px-6 py-2.5 bg-purple-600 text-white font-bold text-sm rounded-xl mt-6 inline-block hover:bg-purple-700 transition-colors">
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(reservasi.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center" style={{ background: "#f8f5f2" }}>
      
      {/* Top Actions (Hidden in Print) */}
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center print:hidden">
        <Link href="/dashboard/riwayat" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Cetak Tiket
        </button>
      </div>

      {/* Ticket Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row relative">
        
        {/* Left/Top Accent */}
        <div className="bg-purple-600 p-8 flex flex-col justify-between items-center text-white md:w-1/3 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 rounded-full opacity-50 blur-2xl"></div>
          
          <div className="text-center relative z-10">
            <h2 className="text-2xl font-black tracking-widest mb-1">YUMFOOD</h2>
            <p className="text-purple-200 text-[10px] uppercase tracking-widest font-semibold">E-Ticket Reservasi</p>
          </div>
          
          <div className="my-8 opacity-90 relative z-10 p-2 bg-white rounded-2xl">
            <QrCode className="w-28 h-28 text-purple-900" />
          </div>
          
          <div className="text-center relative z-10">
            <p className="text-[10px] text-purple-200 uppercase tracking-wider mb-1">Kode Booking</p>
            <p className="font-mono text-xl font-bold tracking-widest">
              {reservasi.id.split("-")[0].toUpperCase()}
            </p>
          </div>

          {/* Cutout circles for ticket effect */}
          <div className="absolute -bottom-4 md:-right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-8 h-8 bg-[#f8f5f2] rounded-full shadow-inner hidden md:block"></div>
        </div>

        {/* Right/Bottom Details */}
        <div className="p-8 md:w-2/3">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Atas Nama</p>
              <h3 className="text-2xl font-black text-gray-800">{reservasi.users?.nama || "Pelanggan"}</h3>
              <p className="text-sm text-gray-500">{reservasi.users?.email}</p>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider shadow-sm">
              Disetujui
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Tanggal
              </p>
              <p className="font-semibold text-gray-800 text-sm">{formattedDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Sesi
              </p>
              <p className="font-semibold text-gray-800 text-sm">{reservasi.sesi}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Jumlah Tamu
              </p>
              <p className="font-semibold text-gray-800 text-sm">{reservasi.jumlah_orang} Orang</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Meja
              </p>
              <p className="font-semibold text-gray-800 text-sm">
                {reservasi.meja?.nomor || "Ditentukan di tempat"}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 border-dashed">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lokasi Outlet</p>
            <p className="font-bold text-gray-800 text-sm mb-0.5">{reservasi.meja?.outlets?.nama_outlet}</p>
            <p className="text-xs text-gray-500">{reservasi.meja?.outlets?.alamat}</p>
          </div>
        </div>

      </div>

      <div className="mt-8 text-center max-w-md text-sm text-gray-400 print:hidden px-4">
        Tunjukkan tiket digital ini (atau hasil cetakannya) kepada resepsionis atau staff YUMFOOD saat Anda tiba di restoran.
      </div>

      {/* Print-only footer instructions */}
      <div className="hidden print:block mt-8 text-center text-xs text-gray-500">
        Tiket valid dan diterbitkan resmi oleh PTIK YUMFOOD pada {new Date().toLocaleString('id-ID')}
      </div>
    </div>
  );
}
