"use client";

import { useRouter } from "next/navigation";

export default function DashboardDateFilter({ currentDate }: { currentDate: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
      <input
        type="date"
        value={currentDate}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/admin?date=${e.target.value}`);
          } else {
            router.push(`/admin`);
          }
        }}
        className="text-sm focus:outline-none focus:text-purple-600 bg-transparent"
      />
    </div>
  );
}
