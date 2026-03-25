import React, { useState } from "react";
import { useUsers, useDeleteUser, useUpdateUser } from "../../../hooks/user";

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(""); // Search State
  const [selectedUser, setSelectedUser] = useState<any>(null); // View/Update State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. GET Files & Search -> Hook automatically handles search query
  const { data, isLoading, error } = useUsers({ page, limit: 10 });

  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser(); // 2. Update Hook

  if (isLoading)
    return <div className="p-10 text-center">Loading users...</div>;
  if (error)
    return (
      <div className="p-10 text-red-500 text-center">Error fetching users</div>
    );

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure?")) {
      deleteMutation.mutate(id ?? "");
    }
  };

  // 3. View/Update Action -> Modal kholne ke liye
  const openEditModal = (user: any) => {
    setSelectedUser({ ...user }); // User ka data local state mein copy karein
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(selectedUser);
    setIsModalOpen(false); // Close modal after update
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* SEARCH BAR -> GET Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full md:w-1/3 border p-2 rounded-md shadow-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="min-w-full border bg-black rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-black-100 border-b">
            <th className="border p-3 text-left">Name</th>
            <th className="border p-3 text-left">Email</th>
            <th className="border p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.users.map((user: any) => (
            <tr key={user.id} className="hover:bg-gray-50 border-b">
              <td className="p-3">{`${user.firstName} ${user.lastName}`}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 flex justify-center gap-2">
                {/* VIEW/UPDATE BUTTON */}
                <button
                  onClick={() => openEditModal(user)}
                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                >
                  View / Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* VIEW & UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Update User Profile</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                  value={selectedUser?.firstName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                  value={selectedUser?.email || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="mt-6 flex justify-between items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-black-500 text-white rounded-md disabled:bg-black-300 transition-colors"
        >
          Previous
        </button>
        <span className="font-medium">
          Page {page} of {data?.data?.totalPages || 1}
        </span>
        <button
          disabled={page >= (data?.data?.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-black-500 text-white rounded-md disabled:bg-blacl-300 transition-colors"
        >
          Next
        </button>{" "}
      </div>
    </div>
  );
};

export default UserManagement;
