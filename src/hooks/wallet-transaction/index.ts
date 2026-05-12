import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletTransactionApi } from "../../api/api-calls/wallet-transaction";

export const useWalletTransactions = (params: any) => {
  return useQuery({
    queryKey: ["wallet-transactions", params],
    queryFn: () => walletTransactionApi.getTransactions(params),
    enabled: params !== null && params !== undefined,
  });
};

export const useWalletActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: walletTransactionApi.createTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: walletTransactionApi.deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] }),
  });

    const bulkDeleteMutation = useMutation({
    mutationFn: walletTransactionApi.bulkDeleteTransactions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] }),
  });
  return {
    createTransaction: createMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    bulkDeleteTransactions: bulkDeleteMutation.mutateAsync,
    isLoading: createMutation.isPending || deleteMutation.isPending,
  };
};