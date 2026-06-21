"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Users, TableProperties, ClipboardList, CreditCard, UserCheck, LogOut, LayoutGrid, type LucideIcon } from "lucide-react";
import type { User } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard & Laporan", icon: LayoutDashboard, exact: true },
  { href: "/admin/pengguna", label: "Kelola Pengguna", icon: Users },
  { href: "/admin/meja", label: "Kelola Data Meja", icon: TableProperties },
  { href: "/admin/reservasi", label: "Semua Reservasi", icon: ClipboardList },
];

const staffNav: NavItem[] = [
  { href: "/staff", label: "Hari Ini", icon: LayoutDashboard, exact: true },
  { href: "/staff/sesi", label: "Ketersediaan Sesi", icon: LayoutGrid },
  { href: "/staff/reservasi", label: "Semua Reservasi", icon: ClipboardList },
  { href: "/staff/verifikasi", label: "Verifikasi Pembayaran", icon: CreditCard },
  { href: "/staff/checkin", label: "Check-in Pelanggan", icon: UserCheck },
  { href: "/staff/meja", label: "Kelola Status Meja", icon: TableProperties },
];

interface RoleSidebarProps {
  user: User | null;
  role: "admin" | "staff";
}

export default function RoleSidebar({
  user,
  role,
}: RoleSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const navItems = role === "admin" ? adminNav : staffNav;
  const roleLabel = role === "admin" ? "ADMIN" : "STAFF";
  const roleBadgeColor = role === "admin" ? "#7c3aed" : "#f59e0b";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className="w-60 min-h-screen flex flex-col py-7 px-5 shrink-0 relative"
      style={{
        background: "linear-gradient(180deg, #3d1a6e 0%, #2d1152 65%, #1e0d3a 100%)",
        borderRight: "1px solid rgba(245,158,11,0.15)",
      }}
    >
      {/* Orange accent bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #f59e0b, transparent)",
          opacity: 0.6,
        }}
      />

      {/* Logo */}
      <div className="mb-6">
        <div className="flex justify-center mb-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 56 56" fill="none">
              <ellipse cx="28" cy="22" rx="13" ry="9" fill="white" fillOpacity="0.85" />
              <rect x="19" y="27" width="18" height="5" rx="2" fill="white" fillOpacity="0.85" />
              <circle cx="28" cy="15" r="5.5" fill="white" fillOpacity="0.85" />
              <circle cx="21" cy="18" r="3.5" fill="white" fillOpacity="0.85" />
              <circle cx="35" cy="18" r="3.5" fill="white" fillOpacity="0.85" />
              <line x1="20" y1="36" x2="17" y2="48" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="17" y1="36" x2="17" y2="40" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="19" y1="36" x2="19" y2="40" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="21" y1="36" x2="21" y2="40" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="36" y1="36" x2="39" y2="48" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <ellipse cx="36" cy="33" rx="2.8" ry="3.5" fill="white" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-white font-extrabold text-base tracking-widest">
            PTIK YUMFOOD
          </h1>
          <div className="flex justify-center mt-1">
            <div className="relative">
              <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase font-medium pb-1">
                Restaurant & Dining
              </p>
              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)" }}
              />
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="flex justify-center mt-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
            style={{ background: roleBadgeColor, color: "#1e0d3a" }}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "text-purple-900"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                      fontWeight: 700,
                    }
                  : {}
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="mt-auto">
        <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
        {user && (
          <div className="px-2 mb-3">
            <p className="text-white text-sm font-semibold truncate">
              {user.nama || user.username}
            </p>
            <p className="text-purple-400 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:text-red-300 hover:bg-red-500/15 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
