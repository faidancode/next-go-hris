"use client";

import { AppSidebar } from "@/components/shared/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/app/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Logo } from "@/components/shared/logo";
import { LogoLoading } from "@/components/shared/logo-loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasHydrated, isValidating, isSessionExpired } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated || isValidating) return;

    if (!user || isSessionExpired) {
      router.replace("/login");
    }
  }, [hasHydrated, isValidating, isSessionExpired, router, user]);

  if (!hasHydrated || isValidating) {
    return <LogoLoading />;
  }

  if (!user) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Redirecting to login...
      </div>
    );
  }

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
