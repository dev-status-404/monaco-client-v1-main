import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/api-calls/notifications";

export const useNotifications = (params: any) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.getAll(params),
    enabled: Boolean(params?.user_id),
  });
};

export const useNotificationsSummary = (userId?: string) => {
  return useQuery({
    queryKey: ["notifications-summary", userId],
    queryFn: () => notificationsApi.getSummary(String(userId)),
    enabled: Boolean(userId),
    refetchInterval: 30000,
  });
};

export const useNotificationsActions = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-summary"] });
  };

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: invalidate,
  });

  const markOneReadMutation = useMutation({
    mutationFn: notificationsApi.markOneRead,
    onSuccess: invalidate,
  });

  const deleteAllMutation = useMutation({
    mutationFn: notificationsApi.deleteAll,
    onSuccess: invalidate,
  });

  const deleteOneMutation = useMutation({
    mutationFn: notificationsApi.deleteOne,
    onSuccess: invalidate,
  });

  return {
    markAllRead: markAllReadMutation.mutateAsync,
    markOneRead: markOneReadMutation.mutateAsync,
    deleteAll: deleteAllMutation.mutateAsync,
    deleteOne: deleteOneMutation.mutateAsync,
    isLoading:
      markAllReadMutation.isPending ||
      markOneReadMutation.isPending ||
      deleteAllMutation.isPending ||
      deleteOneMutation.isPending,
  };
};
