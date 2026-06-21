import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoleSidebar from "@/components/RoleSidebar";
import { LayoutDashboard, ClipboardList, CreditCard, UserCheck, TableProperties } from "lucide-react";
import type { User } from "@/lib/types";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("*").eq("id", authUser.id).single();

  if (!profile || !["Staff", "Admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f5f2" }}>
      <RoleSidebar
        user={profile as User}
        role="staff"
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
