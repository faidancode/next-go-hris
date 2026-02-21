"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/app/stores/auth";
import { apiClient, UnauthorizedError } from "@/lib/api/client";
import {
  clearSession,
  extractTokens,
  getSession,
  normalizeSessionUser,
  setSession,
} from "@/lib/auth/session";

type Props = {
  children: React.ReactNode;
};

export default function AuthBootstrapProvider({ children }: Props) {
  const {
    user,
    hasHydrated,
    isValidating,
    isSessionExpired,
    login,
    logout,
    markSessionExpired,
    setValidating,
  } = useAuthStore();

  const hasBootstrapped = useRef(false);

  useEffect(() => {
    // 1. Cek kondisi dasar: Jangan jalan kalau belum rehidrasi, sedang validasi,
    // atau sudah pernah bootstrap sekali.
    if (!hasHydrated || isValidating || hasBootstrapped.current) {
      return;
    }

    // 2. Ambil session dari storage
    const session = getSession();

    // 3. JIKA GUEST (Tidak ada token): Tandai bootstrap selesai tanpa error.
    // Ini kunci agar landing page tidak menganggap user "expired".
    if (!session?.accessToken) {
      hasBootstrapped.current = true;
      return;
    }

    // 4. Jika user sudah ada di state (Zustand), tandai sudah bootstrap.
    if (user) {
      hasBootstrapped.current = true;
      return;
    }

    // 5. Jika ada token tapi belum ada data user di state, baru panggil API
    hasBootstrapped.current = true;
    setValidating(true);

    apiClient
      .get<Record<string, unknown>>("/auth/me")
      .then((me) => {
        const meUser = normalizeSessionUser(me);
        if (!meUser) {
          throw new Error("Invalid user payload");
        }

        const tokens = extractTokens(me);
        setSession({
          accessToken: tokens.accessToken ?? session?.accessToken,
          refreshToken: tokens.refreshToken ?? session?.refreshToken,
          user: meUser,
        });

        login({
          id: meUser.id,
          name: meUser.name,
          email: meUser.email,
          role: meUser.role,
          company_id: meUser.company_id,
          employee_id: meUser.employee_id,
        });
      })
      .catch((error) => {
        // Jika error 401, artinya token lama/tidak valid
        if (error instanceof UnauthorizedError) {
          clearSession();
          // Hanya panggil markSessionExpired jika memang perlu memunculkan alert/modal login.
          // Untuk bootstrap awal, logout() biasanya sudah cukup aman.
          logout();
          return;
        }

        clearSession();
        logout();
      })
      .finally(() => {
        setValidating(false);
      });
  }, [
    hasHydrated,
    isValidating,
    isSessionExpired,
    user,
    login,
    logout,
    markSessionExpired,
    setValidating,
  ]);

  console.log("Bootstrap:", { user, isSessionExpired });

  return <>{children}</>;
}
