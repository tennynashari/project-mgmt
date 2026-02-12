import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    startDate: "",
    endDate: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, [pagination.page]);

  useEffect(() => {
    apiFetch("/api/users/me/profile")
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  const loadProjects = async () => {
    try {
      const data = await apiFetch(`/api/projects?page=${pagination.page}&limit=${pagination.limit}`);
      setProjects(data.data || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/api/projects/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch("/api/projects", {
          method: "POST",
          body: JSON.stringify(formData)
        });
      }
      loadProjects();
      setShowForm(false);
      setFormData({ name: "", description: "", status: "Planning", startDate: "", endDate: "" });
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : ""
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleArchive = async (id) => {
    if (!confirm("Archive this project?")) return;
    try {
      await apiFetch(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Archived" })
      });
      loadProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project permanently?")) return;
    try {
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      loadProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Projects</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                name: "",
                description: "",
                status: "Planning",
                startDate: "",
                endDate: ""
              });
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {editingId ? "Edit Project" : "Create Project"}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Project Name"
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <select
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Planning</option>
                <option>Ongoing</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>
              <div className="flex gap-4">
                <input
                  type="date"
                  className="flex-1 rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <input
                  type="date"
                  className="flex-1 rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="rounded-xl bg-white p-6 shadow-soft">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  {p.status}
                </span>
              </div>
              {p.description && <p className="mb-4 text-sm text-slate-600">{p.description}</p>}
              
              {/* Progress Summary */}
              {p.stats && p.stats.totalTasks > 0 && (
                <div className="mb-4 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>Progress</span>
                    <span>{p.stats.avgProgress}%</span>
                  </div>
                  <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${p.stats.avgProgress}%` }}
                    />
                  </div>
                  
                  {/* Status Distribution */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">To Do:</span>
                      <span className="font-medium text-slate-700">{p.stats.todoTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">In Progress:</span>
                      <span className="font-medium text-blue-700">{p.stats.inProgressTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Review:</span>
                      <span className="font-medium text-yellow-700">{p.stats.reviewTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Done:</span>
                      <span className="font-medium text-green-700">{p.stats.completedTasks}</span>
                    </div>
                  </div>
                  <div className="mt-2 border-t border-slate-200 pt-2 text-xs font-medium text-slate-700">
                    Total Tasks: {p.stats.totalTasks}
                  </div>
                </div>
              )}
              
              <div className="mb-4 text-xs text-slate-500">
                {p.startDate && <div>Start: {new Date(p.startDate).toLocaleDateString()}</div>}
                {p.endDate && <div>End: {new Date(p.endDate).toLocaleDateString()}</div>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(p.id)}
                  className="flex-1 rounded-lg bg-yellow-100 py-2 text-xs font-medium text-yellow-700 transition hover:bg-yellow-200"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 rounded-lg bg-red-100 py-2 text-xs font-medium text-red-700 transition hover:bg-red-200"
                >
                  Delete
                </button>
              </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
