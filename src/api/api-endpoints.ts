// function withPagination(base: string, offset: number, limit: number) {
//   return `${base}&offset=${offset}&limit=${limit}`;
// }

import { withPagination } from "@/helpers/query-helper";

// export const apiEndpoints = {
//   auth: {
//     signin: "/auth/signin",
//     google: "/auth/google-login",
//     logout: "/auth/logout",
//     signup: "/auth/signup",
//     verifyOtp: "/auth/verify-otp",
//     resendOtp: "/auth/resend-otp",
//     reset_password: "/auth/reset-password",
//     change_password: "/auth/change-password",
//     forgot_password: "/auth/forgot-password",
//     verifyJWT: "/auth/verification",
//   },
//   user: {
//     getAll: "/users", // getUsers function ke liye
//     upsert: "/users/upsert", // upsertUser function ke liye
//     delete: "/users", // deleteUser (iskay aagay /:id lagay ga)
//     bulkDelete: "/users/bulk", // bulkDeleteUsers ke liye
//   },
// };
// C:\work\build-u-app\luke-client-v1\src\api\api-endpoints.ts

export const apiEndpoints = {
  auth: {
    signin: "/auth/signin",
    google: "/auth/google-login",
    logout: "/auth/logout",
    signup: "/auth/signup",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    reset_password: "/auth/reset-password",
    change_password: "/auth/change-password",
    forgot_password: "/auth/forgot-password",
    verifyJWT: "/auth/verification",
  },
  user: {
    getAll: (params: any) => withPagination("/users/get", params), // Taki full path /public/api/v1/users/get bane
    update: "/users/update", // Update request ke liye
    upsert: "/users/create", // Backend router.post("/create")
    delete: (id: string) => `/users/delete/${id}`,
    bulkDelete: "/users/bulk-delete",
  },

  walletTransaction: {
    getAll: (params: any) => withPagination("/transactions/get", params),
    create: "/transactions/create",
    update: "/transactions/update",
    delete: (id: string | number) => `/transactions/delete/${id}`,
    bulkDelete: "/transactions/bulk-delete", // Backend router.post("/bulk-delete") ke liye
  },

  deposits: {
    getAll: (params: any) => withPagination("/deposits/get", params),
    create: "/deposits/create",
    update: (id: string | number) => `/deposits/update/${id}`,
    delete: (id: string | number) => `/deposits/delete/${id}`,
    myGames: "/deposits/my-games",
  },

  games: {
    getAll: (params: any) => withPagination("/games/get", params),
    create: "/games/create",
    update: (id: string | number) => `/games/update/${id}`,
    delete: (id: string | number) => `/games/delete/${id}`,
  },

  dashboard: {
    getAll: (params: any) => withPagination("/dashboard/get", params),
  },

  wallet: {
    deposit: "/wallet/deposit",
    withdraw: "/wallet/withdraw",
    approveWithdraw: "/wallet/withdraw/approve",
    balance: (userId: string) => `/wallet/balance/${userId}`,
    transactions: (userId: string, params: any) =>
      withPagination(`/wallet/transactions/${userId}`, params),
    allTransactions: (params: any) =>
      withPagination(`/wallet/transactions`, params),
    transaction: (userId: string, txId: string) =>
      `/wallet/transaction/${userId}/${txId}`,
  },

  withdrawal: {
    getAll: (params: any) => withPagination("/withdrawal-requests/get", params),
    create: "/withdrawal-requests/create",
    approve: "/withdrawal-requests/approve",
    update: `/withdrawal-requests/update`,
    delete: (id: string | number) => `/withdrawal-requests/delete/${id}`,
    bulkDelete: `/withdrawal-requests/bulk-delete`,
  },

  game_requests: {
    getAll: (params: any) => withPagination("/game-requests/get", params),
    create: "/game-requests/create",
    update: (id: string | number) => `/game-requests/update/${id}`,
    delete: (id: string | number) => `/game-requests/delete/${id}`,
  },

  game_creds: {
    getAll: (params: any) => withPagination("/game-creds/get", params),
    create: "/game-creds/create",
    update: (id: string | number) => `/game-creds/update/${id}`,
    delete: (id: string | number) => `/game-creds/delete/${id}`,
    assign: "/game-creds/assign",
  },

  notifications: {
    getAll: (params: any) => withPagination("/notifications/get", params),
    summary: (user_id: string) => `/notifications/summary?user_id=${user_id}`,
    readAll: "/notifications/read-all",
    readOne: (id: string | number) => `/notifications/read/${id}`,
    deleteAll: "/notifications/delete-all",
    deleteOne: (id: string | number) => `/notifications/delete/${id}`,
  },
};
