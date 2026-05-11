import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gameApi } from "@/api/api-calls/games";

export const useGames = (params: any) => {
  return useQuery({
    queryKey: ["games", params],
    queryFn: () => gameApi.getGames(params),
    enabled: params !== null && params !== undefined,
  });
};

export const useGameActions = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: gameApi.deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });

  return {
    deleteGame: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};