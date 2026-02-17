import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  company_id?: string;
  employee_id?: string;
  name: string;
  email: string;
  role?: string;
};

export type AuthState = {
  user: AuthUser | null;
  hasHydrated: boolean;
  isValidating: boolean;
  isLoggingOut: boolean;
  isSessionExpired: boolean;
  isAuthenticated: () => boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  markSessionExpired: () => void;
  setHydrated: () => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
  setValidating: (val: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasHydrated: false,
      isValidating: false,
      isLoggingOut: false,
      isSessionExpired: false,

      isAuthenticated: () => Boolean(get().user),

      login: (user) =>
        set({
          user,
          isSessionExpired: false,
        }),

      logout: () =>
        set({
          user: null,
          isLoggingOut: false,
          isSessionExpired: false,
        }),

      markSessionExpired: () =>
        set({
          isSessionExpired: true,
          user: null,
        }),

      setLoggingOut: (isLoggingOut) => set({ isLoggingOut }),
      setHydrated: () => set({ hasHydrated: true }),
      setValidating: (val) => set({ isValidating: val }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
