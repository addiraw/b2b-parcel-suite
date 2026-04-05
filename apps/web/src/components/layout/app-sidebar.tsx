"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  QrCode,
  Shield,
  LineChart,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["owner", "admin"] as const },
  {
    href: "/parcels",
    label: "Parcels",
    icon: Package,
    roles: ["owner", "admin", "business", "agent"] as const,
  },
  { href: "/manage", label: "Parcel ops", icon: QrCode, roles: ["owner", "admin"] as const },
  { href: "/admin", label: "Tenants & users", icon: Shield, roles: ["owner", "admin"] as const },
  { href: "/analytics", label: "Analytics", icon: LineChart, roles: ["owner", "admin"] as const },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = nav.filter((n) => user && n.roles.includes(user.role as (typeof n.roles)[number]));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold tracking-tight">ParcelFlow</span>
          <span className="text-xs text-muted-foreground">B2B control center</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="mb-2 truncate px-2 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{user?.name}</div>
          <div>{user?.email}</div>
          <div className="capitalize">{user?.role}</div>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
