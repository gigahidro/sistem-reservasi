export type UserRole = "Pelanggan" | "Staff" | "Admin";
export type ReservasiStatus = "Menunggu Konfirmasi" | "Mendatang" | "Selesai" | "Dibatalkan";

export interface User {
  id: string;
  nama: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Outlet {
  id: string;
  nama_outlet: string;
  lokasi: string;
  created_at: string;
}

export interface Meja {
  id: string;
  outlet_id: string;
  nomor: string;
  kapasitas: number;
  is_available: boolean;
  created_at: string;
}

export interface Reservasi {
  id: string;
  user_id: string;
  meja_id: string;
  tanggal: string;
  sesi: string;
  jumlah_orang: number;
  status: ReservasiStatus;
  created_at: string;
  // Joined fields
  meja?: Meja & { outlets?: Outlet };
  pembayaran?: Pembayaran | Pembayaran[];
}

export interface Pembayaran {
  id: string;
  reservasi_id: string;
  jumlah_dp: number;
  bukti_pembayaran: string | null;
  status: boolean;
  created_at: string;
}

export interface Notifikasi {
  id: string;
  reservasi_id: string;
  tipe: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

export const SESI_OPTIONS = [
  "Sesi 1 (12:00 - 14:30)",
  "Sesi 2 (14:30 - 17:00)",
  "Sesi 3 (17:00 - 19:30)",
  "Sesi 4 (19:30 - 22:00)",
  "Sesi 5 (22:00 - 00:00)",
];
