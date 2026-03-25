import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import gameRequestsApi from "@/api/api-calls/game-requests"; // adjust path if needed

export const useGameRequests = (params: any) => {
  return useQuery({
    queryKey: ["game_requests", params],
    queryFn: () => gameRequestsApi.getAll(params),
  });
};

export const useGameRequestsActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: gameRequestsApi.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_requests"] }),
  });

  const updateMutation = useMutation({
    mutationFn: gameRequestsApi.update,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_requests"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: gameRequestsApi.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_requests"] }),
  });

  return {
    createRequest: createMutation.mutateAsync,
    updateRequest: updateMutation.mutateAsync,
    deleteRequest: deleteMutation.mutateAsync,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};