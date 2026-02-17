"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/fetcher";
import { useAuthStore } from "@/app/stores/auth";
import { clearSession } from "@/lib/auth/session";

function isSessionExpiredError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    typeof error.body === "object" &&
    error.body !== null &&
    (error.body as any).shouldLogout === true
  );
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

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
    markSessionExpired();

    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      clearSession();
      logout();
      router.replace("/login");
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;

      const error = event.query.state.error;

      if (error && isSessionExpiredError(error) && !isSessionExpired) {
        handleSessionExpired();
      }
    });
  }, [queryClient, isSessionExpired]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
