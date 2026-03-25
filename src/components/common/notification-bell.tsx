// // src/components/NotificationsBellShadcn.tsx
// "use client";

// import * as React from "react";
// import { Bell } from "lucide-react";
// import { useAppDispatch } from "@/redux/hook";
// import { markAllRead, clearAll } from "@/redux/slices/notification/slice";
// import {
//   useBulkDeleteNotifications,
//   useClearAllNotifications,
//   useMarkAllRead,
//   useNotifications,
// } from "@/features/notifications/hooks/use-notification";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { useUserInfo } from "@/helpers/use-user";
// import { Spinner } from "../ui/spinner"

// function formatTs(ts?: number) {
//   if (!ts) return "";
//   try {
//     return new Date(ts).toLocaleString();
//   } catch {
//     return String(ts);
//   }
// }

// export default function NotificationsBell() {
//   const dispatch = useAppDispatch();
//   const { id } = useUserInfo();
//   const [open, setOpen] = React.useState(false);
//   const {
//     items,
//     unread,
//     isLoading: isLoadingNotifications,
//   } = useNotifications(id, open);
//   const markAllReadNotifications = useMarkAllRead();
//   const clearAllNotifications = useClearAllNotifications();
//   const isLoading =
//     markAllReadNotifications.isPending || clearAllNotifications.isPending;

//   const grouped = React.useMemo(() => {
//     const g: Record<string, typeof items> = {
//       info: [],
//       success: [],
//       warning: [],
//       error: [],
//     };
//     for (const n of items) {
//       (g[n.level ?? "info"] ??= []).push(n);
//     }
//     return g;
//   }, [items]);

//   const handleDeleteAll = async () =>
//     await clearAllNotifications.mutateAsync(
//       { userId: id },
//       {
//         onSuccess: () => dispatch(clearAll()),
//       }
//     );

//   const handleMarkAllRead = async () =>
//     await markAllReadNotifications.mutateAsync(id, {
//       onSuccess: () => dispatch(markAllRead()),
//     });

//   return (
//     <DropdownMenu open={open} onOpenChange={() => setOpen((p) => !p)}>
//       <DropdownMenuTrigger onClick={() => setOpen((p) => !p)} asChild>
//         <Button variant="outline" className="relative rounded-lg">
//           <Bell className="h-4 w-4" />
//           {unread > 0 && (
//             <Span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-md bg-foreground text-background">
//               {unread}
//             </Span>
//           )}
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent align="end" className="w-96 p-0">
//         <Div className="flex items-center justify-between px-3 py-2 sticky top-0 bg-card z-50">
//           <DropdownMenuLabel className="p-0">
//             <FormattedMessage
//               id="notifications.title"
//               defaultMessage={"Notifications"}
//             />
//           </DropdownMenuLabel>
//           <Div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               variant="ghost"
//               className="h-7 px-2 text-xs"
//               disabled={items.length === 0 || isLoading}
//               onClick={() => handleMarkAllRead()}
//             >
//               <FormattedMessage
//                 id="notifications.component.mark_all_read"
//                 defaultMessage="Mark all as read"
//               />
//             </Button>
//             <Button
//               size="sm"
//               variant="ghost"
//               className="h-7 px-2 text-xs"
//               disabled={items.length === 0 || isLoading}
//               onClick={() => handleDeleteAll()}
//             >
//               <FormattedMessage
//                 id="notifications.component.clear_all"
//                 defaultMessage="Clear all"
//               />
//             </Button>
//           </Div>
//         </Div>
//         <DropdownMenuSeparator />

//         {items.length === 0 ? (
//           <Div className="px-3 py-6 text-sm text-muted-foreground">
//             {isLoadingNotifications ? (
//               <Div className="flex justify-center">
//                 <Spinner />
//               </Div>
//             ) : (
//               "You have no notifications."
//             )}
//           </Div>
//         ) : (
//           <ScrollArea className="max-h-96">
//             <Div className="py-2">
//               {(["error", "warning", "success", "info"] as const).map(
//                 (level) => {
//                   const arr = grouped[level] ?? [];
//                   if (arr.length === 0) return null;
//                   return (
//                     <Div key={level} className="px-2">
//                       <div className="px-1 pb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
//                         <Badge
//                           variant={
//                             level === "error"
//                               ? "destructive"
//                               : level === "warning"
//                               ? "secondary"
//                               : level === "success"
//                               ? "default"
//                               : "outline"
//                           }
//                         >
//                           {level}
//                         </Badge>
//                         <span>{arr.length}</span>
//                       </div>
//                       <div className="space-y-2">
//                         {arr.map((n) => (
//                           <DropdownMenuItem
//                             key={n.id}
//                             className="p-0 focus:bg-transparent"
//                           >
//                             <div
//                               className={`w-full rounded-xl border p-3 ${
//                                 n.is_read ? "opacity-70" : ""
//                               }`}
//                             >
//                               <div className="flex items-start justify-between gap-2">
//                                 <div className="font-medium text-sm leading-tight">
//                                   {n.title}
//                                 </div>
//                                 {!n.is_read && (
//                                   <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-primary text-primary-foreground">
//                                     NEW
//                                   </span>
//                                 )}
//                               </div>
//                               {n.message && (
//                                 <div className="text-sm text-muted-foreground mt-1">
//                                   {n.message}
//                                 </div>
//                               )}
//                               {n.ts && (
//                                 <div className="text-[11px] text-muted-foreground mt-1">
//                                   {formatTs(n.ts)}
//                                 </div>
//                               )}
//                             </div>
//                           </DropdownMenuItem>
//                         ))}
//                       </div>
//                       <Separator className="my-2" />
//                     </Div>
//                   );
//                 }
//               )}
//             </Div>
//           </ScrollArea>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }