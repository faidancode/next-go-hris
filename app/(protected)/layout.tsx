// app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Toaster } from "sonner";
import { LogoLoading } from "@/components/shared/logo-loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasHydrated, isValidating, isSessionExpired } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // 1. Tunggu sampai store terisi (hydrated) dan API /auth/me selesai
    if (!hasHydrated || isValidating) return;

    // 2. Jika tidak ada user (Guest) atau session mati, BARU redirect ke login
    if (!user || isSessionExpired) {
      router.replace("/login");
    }
  }, [hasHydrated, isValidating, isSessionExpired, router, user]);

  // Tampilkan loading saat proses bootstrap berlangsung
  if (!hasHydrated || isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LogoLoading />
      </div>
    );
  }

  // Jika tidak ada user, jangan render apa-apa (akan diredirect oleh useEffect)
  if (!user) {
    return null;
  }
  console.log("ProtectedLayout mounted");

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full bg-gray-100 p-4">
        {children}
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
