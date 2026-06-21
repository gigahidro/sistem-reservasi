import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoleSidebar from "@/components/RoleSidebar";
import { LayoutDashboard, Users, TableProperties, ClipboardList } from "lucide-react";
import type { User } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("*").eq("id", authUser.id).single();

  if (!profile || profile.role !== "Admin") {
    if (profile?.role === "Staff") redirect("/staff");
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f8f5f2" }}>
      <RoleSidebar
        user={profile as User}
        role="admin"
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
