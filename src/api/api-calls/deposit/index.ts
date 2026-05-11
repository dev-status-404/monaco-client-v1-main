import api from "../../axios";
import { apiEndpoints } from "@/api/api-endpoints";

// export const depositApi = {
//   // Sirf deposits fetch karne ke liye
//   getDeposits: async (params: any) => {
//     const response = await api.get("/deposits/get", { params });
//     return response.data;
//   },

//     createDeposit: async (data: any) => {
//         const response = await api.post("/deposits/create", data);
//         return response.data;
//     },

// };

export const depositApi = {
  getDeposits: async (params: any) => {
    const response = await api.get(apiEndpoints.deposits.getAll(params));
    return response.data;
  },
  createDeposit: async (data: any) => {
    const provider = String(data?.provider ?? "").toLowerCase();
    const response = await api.post(apiEndpoints.wallet.deposit, {
      userId: data?.userId ?? data?.user_id,
      amount: data?.amount,
      type: provider.includes("coin") ? "onchain" : "lightning",
      memo: data?.memo,
      referenceId: data?.referenceId,
      gameId: data?.gameId ?? data?.game_id,
      gameName: data?.gameName ?? data?.game_name,
    });
    return response.data;
  },
  updateDeposit: async (data: any) => {
    console.log(data, "HIT");
    
    const response = await api.put(apiEndpoints.deposits.update(data?.id), data);
    return response.data;
  },
  // New Delete Function
  deleteDeposit: async (id: string) => {
    const response = await api.delete(apiEndpoints.deposits.delete(id));
    return response.data;
  },
  // Returns distinct games the user has made confirmed deposits for
  getMyDepositedGames: async () => {
    const response = await api.get(apiEndpoints.deposits.myGames);
    return response.data;
  },
};
