"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-layout/app-sider";

import ReactQueryClientProvider from "@/providers/react-query";
import SocketBridge from "@/lib/sockets/socket-bridge";
import AppHeader from "./app-header";
import { useUserInfo } from "@/helpers/use-user";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isAuthPath = path.startsWith("/auth");
  const isMarketingPath = path.endsWith("/");
  const { user } = useUserInfo();

  if (isAuthPath || isMarketingPath) {
    return (
      <SocketBridge userId={user?.id || ""}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
        >
          <ReactQueryClientProvider>
            <main className="w-full h-full">{children}</main>
          </ReactQueryClientProvider>
        </GoogleOAuthProvider>
      </SocketBridge>
    );
  }

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
    >
      <SocketBridge userId={user?.id || ""}>
        <ReactQueryClientProvider>
          <SidebarProvider>
            {/* <AppSidebar collapsible="offcanvas" variant="sidebar" /> */}
            <SidebarInset>
              <AppHeader />
              <main className="flex flex-1 flex-col gap-4 p-4 bg-card ">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </ReactQueryClientProvider>
      </SocketBridge>
    </GoogleOAuthProvider>
  );
}
