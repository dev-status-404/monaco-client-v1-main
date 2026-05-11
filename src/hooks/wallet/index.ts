import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/api/api-calls/wallet";

export const useWalletBalance = (userId?: string) => {
  return useQuery({
    queryKey: ["wallet-balance", userId],
    queryFn: () => walletApi.getBalance(userId as string),
    enabled: Boolean(userId),
  });
};

export const useWalletTransactionsByUser = (
  userId?: string,
  params: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
) => {
  return useQuery({
    queryKey: ["wallet-transactions-user", userId, params],
    queryFn: () => walletApi.getTransactions(userId as string, params),
    enabled: Boolean(userId),
    refetchInterval: (query) => {
      const rows = (query.state.data as any)?.data?.items ?? [];
      const hasPending = Array.isArray(rows)
        ? rows.some((row: any) =>
            ["pending", "initiated", "processing", "created"].includes(
              String(row?.status ?? row?.api_status ?? "").toLowerCase(),
            ),
          )
        : false;

      return hasPending ? 5000 : false;
    },
  });
};

export const useAllWalletTransactions = (
  params: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
  enabled = true,
) => {
  return useQuery({
    queryKey: ["wallet-transactions-all", params],
    queryFn: () => walletApi.getAllTransactions(params),
    enabled,
  });
};

export const useWalletActions = () => {
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: walletApi.createDeposit,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions-user", variables.userId] });
    },
  });

  return {
    createDeposit: depositMutation.mutateAsync,
    isPending: depositMutation.isPending,
  };
};
