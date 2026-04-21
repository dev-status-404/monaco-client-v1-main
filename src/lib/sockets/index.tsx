// client/src/lib/socket/index.ts
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

let socketInstance: Socket | null = null;
let boundUserId = "";

export function getSocket(userId?: string) {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_WS_URL!; // http://localhost:8080
  const path = process.env.NEXT_PUBLIC_WS_PATH || "/socket.io";

  if (!socketInstance) {
    socketInstance = io(url, {
      path,
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false,
      query: userId ? { userId } : undefined,
      timeout: 10000,
    });

    socketInstance.on("connect_error", (e) => {
      console.error("connect_error:", e?.message ?? e);
    });
  }

  const nextUserId = String(userId || "");
  if (nextUserId && nextUserId !== boundUserId) {
    boundUserId = nextUserId;
    socketInstance.io.opts.query = { userId: boundUserId };
  }

  return socketInstance;
}