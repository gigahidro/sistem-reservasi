import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StaffDenahClient from "@/components/StaffDenahClient";

export const metadata = {
  title: "Staff — Ketersediaan Sesi | PTIK YUMFOOD",
  description: "Pantau ketersediaan meja per sesi",
};

export default async function StaffSesiPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: outlets } = await supabase
    .from("outlets")
    .select("*")
    .order("nama_outlet");

  return <StaffDenahClient outlets={outlets || []} />;
}
