import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DenahClient from "@/components/DenahClient";
import type { Outlet } from "@/lib/types";

export const metadata = {
  title: "Denah Restoran — PTIK YUMFOOD",
  description: "Pilih meja dan sesi reservasi di PTIK YUMFOOD",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: outlets } = await supabase
    .from("outlets")
    .select("*")
    .order("nama_outlet");

  return (
    <DenahClient
      userId={user.id}
      outlets={(outlets as Outlet[]) || []}
    />
  );
}
