"use client";

import { useAuthStore } from "@/app/stores/auth";
import DashboardAttendance from "@/components/dashboard/attendance";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Welcome{user?.name ? `, ${user.name}` : ""}.
      </p>
      <DashboardAttendance />
    </section>
  );
}
