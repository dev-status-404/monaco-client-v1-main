import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUser, deleteUser, bulkDeleteUsers } from "../../api/api-calls/user";

export const useUsers = (filters: any) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => await fetchUsers(filters),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

