import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import TiketClient from "./TiketClient";

export const metadata = {
  title: "E-Ticket Reservasi — PTIK YUMFOOD",
  description: "Bukti reservasi meja Anda",
};

export default async function TiketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("reservasi")
    .select(`
      *,
      meja (
        *,
        outlets (*)
      )
    `)
    .eq("id", id)
    .single();

  if (!data || data.user_id !== user.id) {
    return notFound();
  }

  // Attach the current user's data to avoid risky joins
  const reservasi = {
    ...data,
    users: {
      nama: user.user_metadata?.nama || user.email?.split("@")[0] || "Pelanggan",
      email: user.email,
    }
  };

  return <TiketClient reservasi={reservasi} />;
}
