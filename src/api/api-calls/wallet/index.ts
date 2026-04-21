import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";

export const walletApi = {
  createDeposit: async (data: {
    userId: string;
    amount: number | string;
    type: "lightning" | "onchain" | "on-chain";
    memo?: string;
    referenceId?: string;
    gameId?: string;
    gameName?: string;
  }) => {
    const response = await api.post(apiEndpoints.wallet.deposit, data);
    return response.data;
  },

  getBalance: async (userId: string) => {
    const response = await api.get(apiEndpoints.wallet.balance(userId));
    return response.data;
  },

  getTransactions: async (
    userId: string,
    params: {
      type?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const response = await api.get(apiEndpoints.wallet.transactions(userId, params));
    return response.data;
  },

  getTransactionDetail: async (userId: string, txId: string) => {
    const response = await api.get(apiEndpoints.wallet.transaction(userId, txId));
    return response.data;
  },
};
