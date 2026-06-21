"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    const { error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nama: form.username,
          username: form.username,
        },
      },
    });

    if (signUpErr) {
      if (signUpErr.message.includes("already registered")) {
        setError("Email sudah terdaftar. Silakan login.");
      } else {
        setError(signUpErr.message);
      }
    } else {
      setSuccess("Akun berhasil dibuat! Silakan login.");
      setTimeout(() => router.push("/login"), 2500);
    }

    setLoading(false);
  }

  return (
    /* Full screen split layout */
    <div className="w-full min-h-screen flex">
      {/* Left — Food Flat-lay Photo */}
      <div className="relative hidden lg:block" style={{ width: "55%" }}>
        <Image
          src="/register-hero.png"
          alt="PTIK YUMFOOD Food Spread"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right — Form Panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-12 py-10 lg:px-24 xl:px-32 relative lg:rounded-l-[48px] lg:-ml-8 shadow-[-20px_0_40px_rgba(0,0,0,0.2)] z-10"
        style={{ background: "#5b2d8a" }}
      >
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Logo icon */}
          <div className="flex flex-col items-center mb-1">
          <svg
            width="52"
            height="52"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Chef hat */}
            <ellipse cx="28" cy="24" rx="14" ry="10" fill="white" fillOpacity="0.9" />
            <rect x="18" y="28" width="20" height="6" rx="2" fill="white" fillOpacity="0.9" />
            <circle cx="28" cy="16" r="6" fill="white" fillOpacity="0.9" />
            <circle cx="20" cy="19" r="4" fill="white" fillOpacity="0.9" />
            <circle cx="36" cy="19" r="4" fill="white" fillOpacity="0.9" />
            {/* Fork left */}
            <line x1="20" y1="38" x2="16" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="16" y1="38" x2="16" y2="43" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="38" x2="18" y2="43" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="38" x2="20" y2="43" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Spoon right */}
            <line x1="36" y1="38" x2="40" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="36" cy="35" rx="3" ry="4" fill="white" />
          </svg>

          {/* Divider line below icon */}
          <div
            className="mt-3 mb-4"
            style={{
              width: "120px",
              height: "1px",
              background: "rgba(255,255,255,0.35)",
            }}
          />
        </div>

        {/* REGISTER heading */}
        <h2 className="text-white font-bold text-2xl tracking-widest mb-4">
          REGISTER
        </h2>

        {/* Error / Success */}
        {error && (
          <div className="w-full mb-3 px-3 py-2.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="w-full mb-3 px-3 py-2.5 rounded-lg bg-green-500/20 border border-green-400/40 text-green-200 text-sm">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="w-full space-y-3">
          {/* Username */}
          <div>
            <label className="flex items-center gap-1.5 text-white text-base font-medium mb-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <input
              id="reg-username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full px-5 py-3 rounded-xl bg-white text-gray-800 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-white text-base font-medium mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-5 py-3 rounded-xl bg-white text-gray-800 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-1.5 text-white text-base font-medium mb-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-5 py-3 rounded-xl bg-white text-gray-800 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Confirm Password — no separate label, follows directly */}
          <div>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full px-5 py-3 rounded-xl bg-white text-gray-800 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Register button */}
          <button
            id="btn-register"
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white text-base tracking-wide transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            style={{
              background: loading
                ? "#d97706"
                : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-white/70 text-sm mt-4">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: "#f59e0b" }}
          >
            Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
