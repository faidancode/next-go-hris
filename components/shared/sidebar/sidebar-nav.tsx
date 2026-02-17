"use client";

import { usePathname } from "next/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Building2, ChartArea, Plane, ReceiptText } from "lucide-react";

const SIDEBAR_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: ChartArea },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Leaves", url: "/leaves", icon: Plane },
  { title: "Payrolls", url: "/payrolls", icon: ReceiptText },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (url: string) =>
    pathname === url || (pathname.startsWith(url) && url !== "/");

  return (
    <SidebarMenu>
      {SIDEBAR_ITEMS.map((item) => {
        const active = isActive(item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={`my-1 rounded-none border-l-4 p-5 transition-all ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-white text-gray-600 hover:bg-primary-50"
              }`}
            >
              <a href={item.url} className="flex items-center gap-3">
                <item.icon
                  size={22}
                  className={active ? "text-primary" : "text-gray-400"}
                />
                <span
                  className={`text-base font-semibold ${
                    active ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {item.title}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
