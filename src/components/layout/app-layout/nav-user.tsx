"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
// import { useLogout } from "@/hooks/user-logout";
import { logoutUser } from "@/redux/slices/user";
import { queryClient } from "@/providers/react-query";
// import { resetDialogs } from "@/redux/slices/dialog/dialog-slice";
// import { clearAll } from "@/redux/slices/notification/slice";
// import { resetSheets } from "@/redux/slices/sheet/slice";
import { persistor } from "@/redux/store";

export function NavUser({
  user,
}: {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar_url: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const dispatch = useDispatch();
  //   const logout = useLogout();

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      // Call logout API first
      //   await logout.mutateAsync();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with cleanup even if API fails
    } finally {
      // Clear all Redux slices first
      //   dispatch(logoutAccount());

      //   dispatch(resetDialogs());
      //   dispatch(clearAll());
      //   dispatch(resetSheets());

      // Flush persistor to ensure state is saved before purging
      await persistor.flush();
      // Purge persisted Redux state from localStorage
      await persistor.purge();
      // Clear React Query cache
      await queryClient.clear();

      // Remove all React Query data from localStorage if any
      if (typeof window !== "undefined") {
        try {
          // Clear accessToken cookie if it's not HttpOnly
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          document.cookie =
            "accessToken=; path=/; domain=" +
            window.location.hostname +
            "; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

          // Clear XSRF-TOKEN cookie
          document.cookie =
            "XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          document.cookie =
            "XSRF-TOKEN=; path=/; domain=" +
            window.location.hostname +
            "; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        } catch (e) {
          console.error("Error clearing cookies:", e);
        }
      }

      // Force a small delay to ensure all cleanup is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force a hard reload to ensure all state is completely cleared
      // Using window.location.href instead of router.push ensures:
      // 1. Complete page reload
      // 2. All React state is reset
      // 3. All cached data is cleared
      // 4. Fresh start for next user
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      } else {
        router.push("/auth/signin");
      }
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar_url} alt={user?.firstName} />
                <AvatarFallback className="rounded-lg">
                  {user?.firstName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.firstName + " " + user?.lastName}
                </span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar_url} alt={user?.firstName} />
                  <AvatarFallback className="rounded-lg">
                    {user?.firstName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.firstName + " " + user?.lastName}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`/profile/${user.id}`)}
              >
                <BadgeCheck />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/billing`)}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/notifications`)}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
