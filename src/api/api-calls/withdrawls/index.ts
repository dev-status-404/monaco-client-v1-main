import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios"; // Aapka custom axios instance

export const withdrawlsApi = {
  // Backend service ke pagination logic ke mutabiq
  getWithdrawls: async (params: any) => {
    const response = await api.get(
      apiEndpoints.withdrawal.getAll(params),
    );
    return response.data;
  },

  createWithdrawls: async (data: any) => {
    const response = await api.post(apiEndpoints.withdrawal.create, data);
    return response.data;
  },

  updateWithdrawls: async (data: any) => {
    const response = await api.put(apiEndpoints.withdrawal.update, data);
    return response.data;
  },

  deleteWithdrawls: async (id: string | number) => {
    const response = await api.delete(apiEndpoints.withdrawal.delete(id));
    return response.data;
  },

  bulkDeleteWithdrawls: async (ids: (string | number)[]) => {
    // Backend expect kar raha hai ids delete logic mein
    const response = await api.post(apiEndpoints.withdrawal.bulkDelete, {
      data: { ids },
    });
    return response.data;
  },
};
