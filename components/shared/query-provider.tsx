// components/shared/query-provider.tsx
"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { clearSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/fetcher";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    logout,
    isSessionExpired,
    markSessionExpired,
    isLoggingOut,
    setLoggingOut,
  } = useAuthStore();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (count, error) => {
              if (
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false;
              }
              return count < 3;
            },
            staleTime: 60_000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  const handleSessionExpired = async () => {
    if (isLoggingOut) return;

    setLoggingOut(true);
    markSessionExpired(); // Ini akan set user: null & isSessionExpired: true

    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      clearSession();
      logout();
      // HAPUS BARIS INI: router.replace("/login");
      // Biarkan ProtectedLayout yang melakukan redirect jika user mengakses halaman dashboard
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;

      const error = event.query.state.error;

      // Fungsi helper untuk cek status 401
      const isSessionExpiredError = (err: any) => {
        return err instanceof ApiError && err.status === 401;
      };

      if (error && isSessionExpiredError(error) && !isSessionExpired) {
        handleSessionExpired();
      }
    });
  }, [queryClient, isSessionExpired]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
