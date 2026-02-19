import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const data = await apiFetch("/api/users/me/profile");
      setCurrentUser(data);
      
      // Redirect if not PM or Admin
      if (data.role !== "PM" && data.role !== "Admin") {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      window.location.href = "/";
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiFetch("/api/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (editingId) {
        // Update user
        const payload = { ...formData };
        // Don't send password if empty
        if (!payload.password || payload.password.trim() === "") {
          delete payload.password;
        }
        
        await apiFetch(`/api/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        // Create user
        if (!formData.password || formData.password.trim() === "") {
          setError("Password is required for new users");
          return;
        }
        
        await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify(formData)
        });
      }
      
      loadUsers();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    });
    setEditingId(user.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? All their tasks and comments will be affected.")) return;
    
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Member"
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700";
      case "PM":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Show loading while checking permissions
  if (!currentUser) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 md:hidden">User Management</h2>
            <p className="text-sm text-slate-500 md:hidden">Manage team members and roles</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            + Add User
          </button>
        </div>

        {/* User Form */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {editingId ? "Edit User" : "Create User"}
            </h3>
            
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder={editingId ? "Password (leave blank to keep current)" : "Password"}
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingId}
              />
              <select
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Member">Member</option>
                <option value="PM">Project Manager</option>
                <option value="Admin">Admin</option>
              </select>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  {editingId ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        {user.id === currentUser.id && (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-12 text-center shadow-soft">
            <p className="text-slate-500">No users found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
