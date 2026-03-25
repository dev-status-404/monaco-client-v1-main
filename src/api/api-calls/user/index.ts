// import { apiEndpoints } from "@/api/api-endpoints";
// import api from "@/api/axios";

// // 1. Fetch Users (Table ke liye)
// export const fetchUsers = async (params: any) => {
//   const { data } = await api.get(apiEndpoints.user.getAll, { params });
//   return data;
// };

// // 2. Update User (Form submit ke liye)
// export const updateUser = async (userData: any) => {
//   // Yahan userData.id use karke dynamic URL banega
//   const { data } = await api.put(`${apiEndpoints.user.update}/${userData.id}`, userData);
//   return data;
// };

// // 3. Delete Single User
// export const deleteUser = async (id: string) => {
//   // Aapne delete ko function banaya hai, to usey aise call karein:
//   const { data } = await api.delete(apiEndpoints.user.delete(id));
//   return data;
// };

// // 4. Bulk Delete
// export const bulkDeleteUsers = async (ids: string[]) => {
//   const { data } = await api.delete(apiEndpoints.user.bulkDelete, { data: { ids } });
//   return data;
// };

import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";

// Users list hasil karne ke liye
// export const fetchUsers = async (params: any) => {
//   const { data } = await api.get(apiEndpoints.user.getAll, { params });
//   return data;
// };
// Testing: Bagair kisi extra parameter ke call karein

export const fetchUsers = async (params: any) => {
  const queryParams: any = {
    // Backend validation aksar numbers maangti hai
    page: Number(params?.page) || 1,
    limit: Number(params?.limit) || 10,
    search: params?.search || "",
    role: params?.role || "",
    blocked: params?.blocked ?? "", // boolean ya string dono handle karne ke liye
  };

  const { data } = await api.get(apiEndpoints.user.getAll(queryParams));
  console.log();

  return data;
};

// Kisi ek user ko update karne ke liye
// export const updateUser = async (userData: any) => {
//   // Backend PUT /update expect kar raha hai
//   const { data } = await api.put(apiEndpoints.user.update, userData);
//   return data;
// };

export const updateUser = async (userData: any) => {
  // Backend route 'router.put("/update")' ko hit karega
  const { data } = await api.put(apiEndpoints.user.update, userData);
  return data;
};

// Single delete function calling your functional endpoint
export const deleteUser = async (id: string) => {
  const { data } = await api.delete(apiEndpoints.user.delete(id));
  return data;
};

export const bulkDeleteUsers = async (id: string) => {
  const { data } = await api.delete(apiEndpoints.user.delete(id));
  return data;
};
