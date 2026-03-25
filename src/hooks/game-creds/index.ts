import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import gamesCredentialsApi from "@/api/api-calls/games-credentials"; // adjust path if needed

export const useGameCreds = (params: any) => {
  return useQuery({
    queryKey: ["game_creds", params],
    queryFn: () => gamesCredentialsApi.getCredentials(params),
  });
};

export const useGameCredsActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: gamesCredentialsApi.createCredential,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_creds"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (args: { credentialId: string; payload: any }) =>
      gamesCredentialsApi.updateCredential(args.credentialId, args.payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_creds"] }),
  });

  const assignMutation = useMutation({
    mutationFn: gamesCredentialsApi.assignCredential,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_creds"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: gamesCredentialsApi.deleteCredential,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["game_creds"] }),
  });

  return {
    createCredential: createMutation.mutateAsync,
    updateCredential: updateMutation.mutateAsync,
    assignCredential: assignMutation.mutateAsync,
    deleteCredential: deleteMutation.mutateAsync,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      assignMutation.isPending ||
      deleteMutation.isPending,
  };
};