import api from "@/api/axios";

const ENDPOINT = "/games";

export const gameApi = {
  getGames: async (params: any) => {
    // Note: Changed to .get to match standard REST practices
    const response = await api.get(`${ENDPOINT}/get`, { params });
    return response.data;
  },
  
  createGame: async (data: any) => {
    const response = await api.post(`${ENDPOINT}/create`, data);
    return response.data;
  },

  deleteGame: async (id: string) => {
    const response = await api.delete(`${ENDPOINT}/delete/${id}`);
    return response.data;
  }
};