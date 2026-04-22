import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletTransactionApi } from "../../api/api-calls/wallet-transaction";
import { withdrawlsApi } from "@/api/api-calls/withdrawls";

export const useWithdrawls = (params: any) => {
  return useQuery({
    queryKey: ["withdrawls", params],
    queryFn: () => withdrawlsApi.getWithdrawls(params),
  });
};

export const useWithdrawlActions = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: withdrawlsApi.updateWithdrawls,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawls"] }),
  });

  const createMutation = useMutation({
    mutationFn: withdrawlsApi.createWithdrawls,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawls"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: withdrawlsApi.deleteWithdrawls,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawls"] }),
  });

    const bulkDeleteMutation = useMutation({
    mutationFn: withdrawlsApi.bulkDeleteWithdrawls,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawls"] }),
  });
  return {
    createWithdrawl: createMutation.mutateAsync,
    deleteWithdrawl: deleteMutation.mutateAsync,
    updateWithdrawl: updateMutation.mutateAsync,
    bulkDeleteWithdrawl: bulkDeleteMutation.mutateAsync,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      bulkDeleteMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      bulkDeleteMutation.isPending,
  };
};