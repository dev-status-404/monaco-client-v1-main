import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { depositApi } from "../../api/api-calls/deposit";

export const useDeposits = (params: any) => {
  return useQuery({
    queryKey: ["deposits", params],
    queryFn: () => depositApi.getDeposits(params),
  });
};

export const useDepositActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: depositApi.createDeposit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deposits"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => depositApi.updateDeposit( data ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deposits"] }),
  });

  // New Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: depositApi.deleteDeposit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deposits"] }),
  });

  return {
    createDeposit: createMutation.mutateAsync,
    updateDeposit: updateMutation.mutateAsync,
    deleteDeposit: deleteMutation.mutateAsync,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
