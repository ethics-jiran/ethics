"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ClipboardList, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

const navItems = [
  {
    title: "제보 관리",
    url: "/admin/inquiries",
    icon: ClipboardList,
  },
  {
    title: "FAQ 관리",
    url: "/admin/faqs",
    icon: HelpCircle,
  },
];

interface AdminSidebarProps {
  variant?: "sidebar" | "floating" | "inset";
  userEmail?: string;
}

export function AdminSidebar({
  variant = "inset",
  userEmail,
  ...props
}: AdminSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" variant={variant} {...props}>
      <SidebarHeader className="mb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-3">
              <Link href="/admin/inquiries" className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="!size-10"
                />
                <div>
                  <p className="font-semibold">지란지교패밀리</p>
                  <p className="text-xs text-muted-foreground">
                    윤리경영 상담관리센터
                  </p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem className="p-1" key={item.url}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {userEmail && (
        <SidebarFooter>
          <NavUser user={{ email: userEmail }} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
