import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotifikasiClient from "@/components/NotifikasiClient";

export const metadata = {
  title: "Notifikasi — PTIK YUMFOOD",
  description: "Pemberitahuan terkait reservasi Anda",
};

export default async function NotifikasiPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all notifikasi for user's reservasi
  const { data: reservasi } = await supabase
    .from("reservasi")
    .select("id")
    .eq("user_id", user.id);

  const reservasiIds = reservasi?.map(r => r.id) || [];

  let notifikasi = [];
  if (reservasiIds.length > 0) {
    const { data } = await supabase
      .from("notifikasi")
      .select("*")
      .in("reservasi_id", reservasiIds)
      .order("created_at", { ascending: false });
    
    notifikasi = data || [];
  }

  return <NotifikasiClient initialData={notifikasi} />;
}
