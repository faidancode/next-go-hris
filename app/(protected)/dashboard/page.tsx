"use client";

import { useAuthStore } from "@/app/stores/auth";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  console.log("dashboard");
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Welcome{user?.name ? `, ${user.name}` : ""}.
      </p>
    </section>
  );
}
