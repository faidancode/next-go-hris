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
    if (!hasHydrated || isValidating || isSessionExpired || hasBootstrapped.current) {
      return;
    }

    if (user) {
      return;
    }

    const session = getSession();

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
        if (error instanceof UnauthorizedError) {
          clearSession();
          markSessionExpired();
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

  return <>{children}</>;
}
