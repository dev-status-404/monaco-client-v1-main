import api from "../../axios";

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
    const response = await api.get("/deposits/get", { params });
    return response.data;
  },
  createDeposit: async (data: any) => {
    const response = await api.post("/deposits/create", data);
    return response.data;
  },
  updateDeposit: async (data: any) => {
    console.log(data, "HIT");
    
    const response = await api.put(`/deposits/update/${data?.id}`, data);
    return response.data;
  },
  // New Delete Function
  deleteDeposit: async (id: string) => {
    const response = await api.delete(`/deposits/delete/${id}`);
    return response.data;
  },
};
