import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";

export const notificationsApi = {
  getAll: async (params: any) => {
    const response = await api.get(apiEndpoints.notifications.getAll(params));
    return response.data;
  },

  getSummary: async (user_id: string) => {
    const response = await api.get(apiEndpoints.notifications.summary(user_id));
    return response.data;
  },

  markAllRead: async (user_id: string) => {
    const response = await api.patch(apiEndpoints.notifications.readAll, { user_id });
    return response.data;
  },

  markOneRead: async ({ id, user_id }: { id: string; user_id: string }) => {
    const response = await api.patch(apiEndpoints.notifications.readOne(id), { user_id });
    return response.data;
  },

  deleteAll: async (user_id: string) => {
    const response = await api.delete(apiEndpoints.notifications.deleteAll, {
      data: { user_id },
    });
    return response.data;
  },

  deleteOne: async ({ id, user_id }: { id: string; user_id: string }) => {
    const response = await api.delete(apiEndpoints.notifications.deleteOne(id), {
      data: { user_id },
    });
    return response.data;
  },
};
