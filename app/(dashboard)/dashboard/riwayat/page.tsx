import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RiwayatClient from "@/components/RiwayatClient";
import type { Reservasi } from "@/lib/types";

export const metadata = {
  title: "Riwayat Reservasi — PTIK YUMFOOD",
  description: "Lihat riwayat dan status reservasi meja Anda",
};

async function getReservasi(userId: string): Promise<Reservasi[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reservasi")
    .select(
      `
      *,
      meja (
        *,
        outlets (*)
      ),
      pembayaran (
        status,
        bukti_pembayaran
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as Reservasi[]) || [];
}

export default async function RiwayatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const reservasi = await getReservasi(user.id);

  async function refreshReservasi(): Promise<Reservasi[]> {
    "use server";
    return getReservasi(user!.id);
  }

  return (
    <RiwayatClient
      initialReservasi={reservasi}
      onRefresh={refreshReservasi}
    />
  );
}
