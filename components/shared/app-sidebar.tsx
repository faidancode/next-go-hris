"use client";

import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar/sidebar-nav";
import { SidebarUser } from "./sidebar/sidebar-user";

/* ------------------------------------------------------------------ */

export function AppSidebar() {
  // Tampilkan sidebar
  return (
    <Sidebar>
      <SidebarHeader className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem className="p-2 flex items-center">
            <Image src="/logo.svg" alt="logo" height={28} width={28} />
            <p className="ml-2 font-bold text-2xl">GoHRIS</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
