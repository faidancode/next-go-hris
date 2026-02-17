"use client";

import { useAuthStore } from "@/app/stores/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api/client";
import { clearSession } from "@/lib/auth/session";
import { ChevronRight } from "lucide-react";
import React from "react";

export const SidebarUser = React.memo(() => {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  async function handleLogout() {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Ignore and still clear local session.
    } finally {
      clearSession();
      useAuthStore.getState().logout();
      window.location.replace("/login");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuSubButton className="p-2">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-semibold text-secondary">
                {(user.name?.[0] || "A").toUpperCase()}
              </div>
              <p className="font-semibold">{user.name}</p>
              <ChevronRight className="ml-auto" />
            </SidebarMenuSubButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right">
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
