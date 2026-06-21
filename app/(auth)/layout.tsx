import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PTIK YUMFOOD — Login & Register",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #f5f0ea 0%, #ede8e0 50%, #e8e0d5 100%)",
      }}
    >
      {children}
    </div>
  );
}
