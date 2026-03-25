"use client";

import * as React from "react";
import { NavMain } from "@/components/layout/app-layout/nav-main";
import { NavUser } from "@/components/layout/app-layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserInfo } from "@/helpers/use-user";
import Image from "next/image";
import dark_logo from "../../../../public/assets/SVGs/luke/hat.svg";
import { useTheme } from "next-themes";

// AppSidebar.tsx
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserInfo();
  if (!user) return null;
  const currentRole: any = user?.role;
  const { theme } = useTheme();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center">
                <Image src={dark_logo} alt="Logo" width={50} height={50} />
                <div className="grid flex-1 w-full text-left leading-tight font-[family-name:var(--font-poppins)]">
                  <span className="text-sm white">Luky Luxe</span>
                  <span className="font-semibold text-md bg-gradient-to-r from-green-500 to-emrald-400 bg-clip-text text-transparent">
                    Platform
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={[]}
        />
      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
