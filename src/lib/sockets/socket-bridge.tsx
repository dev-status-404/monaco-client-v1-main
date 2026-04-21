// components/SocketBridge.tsx
"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/sockets";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SocketBridge({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket(userId);

    if (!socket) return;

    const onConnect = () => {
      // Room assignment is handled server-side from handshake userId.
    };

    const invalidateNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-summary", userId] });
    };

    const onDepositUpdated = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", userId] });
      invalidateNotifications();
      toast.info(`Deposit ${payload?.action || "updated"}`);
    };

    const onWithdrawalUpdated = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["withdrawls"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", userId] });
      invalidateNotifications();
      toast.info(`Withdrawal ${payload?.action || "updated"}`);
    };

    const onGameRequestUpdated = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["game_requests"] });
      queryClient.invalidateQueries({ queryKey: ["game_creds"] });
      invalidateNotifications();
      toast.info(
        payload?.action === "approved"
          ? "Game request approved"
          : "Game request updated",
      );
    };

    const onGameCredentialAssigned = () => {
      queryClient.invalidateQueries({ queryKey: ["game_creds"] });
      queryClient.invalidateQueries({ queryKey: ["game_requests"] });
      invalidateNotifications();
      toast.success("Game credentials assigned");
    };

    const onNotificationMutated = () => {
      invalidateNotifications();
    };

    socket.on("connect", onConnect);
    socket.on("deposit:updated", onDepositUpdated);
    socket.on("deposit:created", onDepositUpdated);
    socket.on("withdrawal:updated", onWithdrawalUpdated);
    socket.on("withdrawal:created", onWithdrawalUpdated);
    socket.on("withdrawal:approved", onWithdrawalUpdated);
    socket.on("game_request:updated", onGameRequestUpdated);
    socket.on("game_request:created", onGameRequestUpdated);
    socket.on("game_request:approved", onGameRequestUpdated);
    socket.on("game_credential:assigned", onGameCredentialAssigned);
    socket.on("notification:new", onNotificationMutated);
    socket.on("notification:read", onNotificationMutated);
    socket.on("notification:read-all", onNotificationMutated);
    socket.on("notification:deleted", onNotificationMutated);
    socket.on("notification:deleted-all", onNotificationMutated);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("deposit:updated", onDepositUpdated);
      socket.off("deposit:created", onDepositUpdated);
      socket.off("withdrawal:updated", onWithdrawalUpdated);
      socket.off("withdrawal:created", onWithdrawalUpdated);
      socket.off("withdrawal:approved", onWithdrawalUpdated);
      socket.off("game_request:updated", onGameRequestUpdated);
      socket.off("game_request:created", onGameRequestUpdated);
      socket.off("game_request:approved", onGameRequestUpdated);
      socket.off("game_credential:assigned", onGameCredentialAssigned);
      socket.off("notification:new", onNotificationMutated);
      socket.off("notification:read", onNotificationMutated);
      socket.off("notification:read-all", onNotificationMutated);
      socket.off("notification:deleted", onNotificationMutated);
      socket.off("notification:deleted-all", onNotificationMutated);
      // Keep alive across pages; no disconnect.
    };
  }, [queryClient, userId]);

  return <>{children}</>;
}