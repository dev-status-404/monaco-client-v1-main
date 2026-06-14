import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { depositApi } from "../../api/api-calls/deposit";

export const useDeposits = (params: any) => {
  return useQuery({
    queryKey: ["deposits", params],
    queryFn: () => depositApi.getDeposits(params),
  });
};

export const usePaymentProfile = () => {
  return useQuery({
    queryKey: ["payment-profile"],
    queryFn: () => depositApi.getPaymentProfile(),
  });
};

export const usePaymentOrders = (params: any = {}, adminMode = false) => {
  return useQuery({
    queryKey: ["payment-orders", adminMode, params],
    queryFn: () => depositApi.getPaymentOrders(params, adminMode),
    refetchInterval: (query) => {
      const rows = (query.state.data as any)?.data?.items ?? [];
      const hasPending = Array.isArray(rows)
        ? rows.some((row: any) =>
            ["pending payment", "pending"].includes(
              String(row?.status ?? "").toLowerCase(),
            ),
          )
        : false;

      return hasPending ? 5000 : false;
    },
  });
};

/** Returns only games where the current user has ≥1 confirmed deposit. */
export const useMyDepositedGames = () => {
  return useQuery({
    queryKey: ["my-deposited-games"],
    queryFn: () => depositApi.getMyDepositedGames(),
    staleTime: 60_000, // cache for 1 min — list changes rarely
  });
};

export const useDepositActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: depositApi.createDeposit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deposits"] }),
  });

  const pixPayMutation = useMutation({
    mutationFn: depositApi.createPixPayOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });

  const tierlockMutation = useMutation({
    mutationFn: depositApi.createTierlockOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
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
    createPixPayOrder: pixPayMutation.mutateAsync,
    createTierlockOrder: tierlockMutation.mutateAsync,
    updateDeposit: updateMutation.mutateAsync,
    deleteDeposit: deleteMutation.mutateAsync,
    isPending:
      createMutation.isPending ||
      pixPayMutation.isPending ||
      tierlockMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
