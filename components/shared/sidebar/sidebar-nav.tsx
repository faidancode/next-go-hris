"use client";

import { useAuthStore } from "@/app/stores/auth";
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
  HandCoins,
  Plane,
  ReceiptText,
  Users,
  ShieldUser,
  Settings,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";
import { can, clearRbacCache } from "@/lib/rbac/can";

type SidebarSection = "general" | "settings";

const SIDEBAR_ITEMS: Array<{
  title: string;
  url: string;
  icon: LucideIcon;
  resource?: string;
  action?: string;
  section: SidebarSection;
}> = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartArea,
    section: "general",
  },
  {
    title: "Departments",
    url: "/departments",
    icon: Building2,
    resource: "department",
    action: "read",
    section: "general",
  },
  {
    title: "Positions",
    url: "/positions",
    icon: BriefcaseBusiness,
    resource: "position",
    action: "read",
    section: "general",
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    resource: "employee",
    action: "read",
    section: "general",
  },
  {
    title: "Leaves",
    url: "/leaves",
    icon: Plane,
    resource: "leave",
    action: "read",
    section: "general",
  },
  {
    title: "Attendance",
    url: "/attendances",
    icon: CalendarCheck2,
    resource: "attendance",
    action: "read",
    section: "general",
  },
  {
    title: "Employee Salaries",
    url: "/employee-salaries",
    icon: HandCoins,
    resource: "salary",
    action: "read",
    section: "general",
  },
  {
    title: "Payrolls",
    url: "/payrolls",
    icon: ReceiptText,
    resource: "payroll",
    action: "read",
    section: "general",
  },
  {
    title: "Users",
    url: "/users",
    icon: ShieldUser,
    resource: "user",
    action: "read",
    section: "general",
  },
  {
    title: "Role Management",
    url: "/settings/user-role-permission",
    icon: Settings,
    resource: "role",
    action: "read",
    section: "settings",
  },
  {
    title: "Assign Role to User",
    url: "/settings/user-role-assignment",
    icon: UserRoundCog,
    resource: "user",
    action: "read",
    section: "settings",
  },
];

export function SidebarNav({ section }: { section: SidebarSection }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [visibleItems, setVisibleItems] = useState(
    SIDEBAR_ITEMS.filter((item) => !item.resource || !item.action),
  );

  useEffect(() => {
    if (!hasHydrated || !user?.id) return;

    let mounted = true;
    clearRbacCache();

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

    void resolveMenuAccess();

    return () => {
      mounted = false;
    };
  }, [hasHydrated, pathname, user?.id, user?.employee_id, user?.company_id]);

  const isActive = (url: string) =>
    pathname === url || (pathname.startsWith(url) && url !== "/");

  return (
    <SidebarMenu>
      {visibleItems
        .filter((item) => item.section === section)
        .map((item) => {
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
