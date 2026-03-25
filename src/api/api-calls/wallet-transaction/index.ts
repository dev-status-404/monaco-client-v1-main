import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";// Aapka custom axios instance

const ENDPOINT = "/wallet-transactions";

export const walletTransactionApi = {
  // Backend service ke pagination logic ke mutabiq
  getTransactions: async (params: any) => {
    const response = await api.get(apiEndpoints.walletTransaction.getAll(params));
    return response.data;
  },

  createTransaction: async (data: any) => {
    const response = await api.post(ENDPOINT, data);
    return response.data;
  },

  updateTransaction: async (data: any) => {
    const response = await api.put(ENDPOINT, data);
    return response.data;
  },

  deleteTransaction: async (id: string | number) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  bulkDeleteTransactions: async (ids: (string | number)[]) => {
    // Backend expect kar raha hai ids delete logic mein
    const response = await api.delete(ENDPOINT, { data: { ids } });
    return response.data;
  },
};