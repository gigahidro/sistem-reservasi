import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import type { User } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // Redirect Staff and Admin to their own dashboards
  if (profile?.role === "Staff") redirect("/staff");
  if (profile?.role === "Admin") redirect("/admin");

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f5f2" }}>
      <Sidebar user={profile as User | null} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
