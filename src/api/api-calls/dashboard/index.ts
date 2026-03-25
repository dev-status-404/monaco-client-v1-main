import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";

export const dashboardApi = {
  getDashboard: async (params: any) => {
    const response = await api.get(apiEndpoints.dashboard.getAll(params));
    return response.data;
  },
};
