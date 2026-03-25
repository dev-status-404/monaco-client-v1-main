import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";

const gameRequestsApi = {
  /**
   * Get all game requests (paginated / filtered)
   */
  getAll: (params: any) => {
    return api.get(apiEndpoints.game_requests.getAll(params));
  },

  /**
   * Create game request
   */
  create: (payload: {
    game_id: string;
    user_id: string;
    note?: string;
    requested_by_admin_id?: string;
  }) => {
    return api.post(apiEndpoints.game_requests.create, payload);
  },

  /**
   * Update game request
   */
  update: (
    payload: {
      id: string | number;
      status?: string;
      note?: string;
      reviewed_by_admin_id?: string;
    },
  ) => {
    return api.put(apiEndpoints.game_requests.update(payload.id), payload);
  },

  /**
   * Delete game request
   */
  delete: (id: string | number) => {
    return api.delete(apiEndpoints.game_requests.delete(id));
  },
};

export default gameRequestsApi;