"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CalendarCheck2,
  BriefcaseBusiness,
  Building2,
  ChartArea,
  Plane,
  ReceiptText,
  Users,
} from "lucide-react";
import { can } from "@/lib/rbac/can";

const SIDEBAR_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: ChartArea },
  {
    title: "Departments",
    url: "/departments",
    icon: Building2,
    resource: "department",
    action: "read",
  },
  {
    title: "Positions",
    url: "/positions",
    icon: BriefcaseBusiness,
    resource: "position",
    action: "read",
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    resource: "employee",
    action: "read",
  },
  {
    title: "Leaves",
    url: "/leaves",
    icon: Plane,
    resource: "leave",
    action: "read",
  },
  {
    title: "Attendance",
    url: "/attendances",
    icon: CalendarCheck2,
    resource: "attendance",
    action: "read",
  },
  {
    title: "Payrolls",
    url: "/payrolls",
    icon: ReceiptText,
    resource: "payroll",
    action: "read",
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [visibleItems, setVisibleItems] = useState(
    SIDEBAR_ITEMS.filter((item) => !item.resource || !item.action),
  );

  useEffect(() => {
    let mounted = true;

    async function resolveMenuAccess() {
      const checks = await Promise.all(
        SIDEBAR_ITEMS.map(async (item) => {
          if (!item.resource || !item.action) return { item, allowed: true };

          try {
            const allowed = await can(item.resource, item.action);
            return { item, allowed };
          } catch {
            return { item, allowed: false };
          }
        }),
      );

      if (!mounted) return;
      setVisibleItems(
        checks.filter((entry) => entry.allowed).map((entry) => entry.item),
      );
    }

    resolveMenuAccess();

    return () => {
      mounted = false;
    };
  }, []);

  const isActive = (url: string) =>
    pathname === url || (pathname.startsWith(url) && url !== "/");

  return (
    <SidebarMenu>
      {visibleItems.map((item) => {
        const active = isActive(item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={`my-1 rounded-none border-l-4 p-5 transition-all ${
                active
                  ? "border-secondary bg-primary/10"
                  : "border-white text-gray-600 hover:bg-secondary-100"
              }`}
            >
              <a href={item.url} className="flex items-center gap-3">
                <item.icon
                  size={28}
                  className={active ? "text-secondary" : "text-gray-400"}
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
