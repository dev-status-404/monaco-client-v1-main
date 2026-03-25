// hooks/dashboard.ts
"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/api/axios"; // your axios instance
import { dashboardApi } from "@/api/api-calls/dashboard";

export const useDashboard = (params: {
  page?: number;
  limit?: number;
  user_id?: string;
  game_id?: string;
}) => {
  return useQuery({ 
    queryKey: ["dashboard", params],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard(params);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
};
