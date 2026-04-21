"use client";

import React, { useMemo, useState } from "react";
import SectionTitle from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserInfo } from "@/helpers/use-user";
import { useNotifications, useNotificationsActions } from "@/hooks/notifications";
import { toast } from "sonner";
import { Bell, Trash2, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  createdAt: string;
  meta?: Record<string, any> | null;
};

const pickRows = (data: any): NotificationItem[] => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data)) return data;
  return [];
};

const NotificationPageLayout = () => {
  const { id } = useUserInfo();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const params = useMemo(
    () => ({
      user_id: id,
      page,
      limit,
    }),
    [id, page, limit],
  );

  const { data, isLoading } = useNotifications(params);
  const actions = useNotificationsActions();

  const rows = useMemo(() => pickRows(data), [data]);
  const pagination = data?.pagination || data?.data?.pagination || {};
  const totalPages = Number(pagination?.totalPages || 1);

  const onMarkAllRead = async () => {
    if (!id) return;
    try {
      await actions.markAllRead(String(id));
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error?.message || "Failed to mark notifications as read");
    }
  };

  const onDeleteAll = async () => {
    if (!id) return;
    try {
      await actions.deleteAll(String(id));
      toast.success("All notifications deleted");
      setPage(1);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete notifications");
    }
  };

  const onMarkOneRead = async (notificationId: string) => {
    if (!id) return;
    try {
      await actions.markOneRead({ id: notificationId, user_id: String(id) });
    } catch {
      // no-op
    }
  };

  const onDeleteOne = async (notificationId: string) => {
    if (!id) return;
    try {
      await actions.deleteOne({ id: notificationId, user_id: String(id) });
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SectionTitle title="Notifications" />

      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            Live updates for deposits, withdrawals, and game requests
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={onMarkAllRead}
              disabled={actions.isLoading || rows.length === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={onDeleteAll}
              disabled={actions.isLoading || rows.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete all
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-xl border border-white/10 p-4 text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-4 text-sm text-muted-foreground">
              No notifications found.
            </div>
          ) : (
            rows.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.is_read ? "border-white/10 bg-white/5" : "border-emerald-300/40 bg-emerald-200/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <Badge variant={item.is_read ? "secondary" : "default"}>
                        {item.is_read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                    <p className="text-xs text-muted-foreground/80">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.is_read ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-lg"
                        onClick={() => onMarkOneRead(item.id)}
                        disabled={actions.isLoading}
                      >
                        Read
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => onDeleteOne(item.id)}
                      disabled={actions.isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages || isLoading}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPageLayout;
