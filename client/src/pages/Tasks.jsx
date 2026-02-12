import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    assigneeId: "",
    startDate: "",
    dueDate: "",
    progress: 0
  });

  useEffect(() => {
    loadTasks();
  }, [pagination.page]);

  useEffect(() => {
    loadProjects();
    loadUsers();
    apiFetch("/api/users/me/profile")
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  const loadTasks = async () => {
    try {
      const data = await apiFetch(`/api/tasks?page=${pagination.page}&limit=${pagination.limit}`);
      setTasks(data.data || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await apiFetch("/api/projects?limit=1000");
      const projects = data.data || data;
      setProjects(Array.isArray(projects) ? projects.filter(p => p.status !== "Archived") : []);
    } catch (err) {
      console.error(err);
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
    try {
      const payload = {
        ...formData,
        projectId: parseInt(formData.projectId),
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
        progress: parseInt(formData.progress)
      };

      if (editingId) {
        await apiFetch(`/api/tasks/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch("/api/tasks", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      loadTasks();
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      projectId: task.projectId.toString(),
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ? task.assigneeId.toString() : "",
      startDate: task.startDate ? task.startDate.split("T")[0] : "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      progress: task.progress
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      assigneeId: "",
      startDate: "",
      dueDate: "",
      progress: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterProject !== "all" && task.projectId !== parseInt(filterProject)) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do": return "bg-slate-100 text-slate-700";
      case "In Progress": return "bg-blue-100 text-blue-700";
      case "Review": return "bg-yellow-100 text-yellow-700";
      case "Done": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low": return "bg-slate-100 text-slate-600";
      case "Medium": return "bg-orange-100 text-orange-700";
      case "High": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Tasks</h2>
          {(!currentUser || currentUser.role === "PM" || currentUser.role === "Admin") && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              + New Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {editingId ? "Edit Task" : "Create Task"}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <select
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Task Title"
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Done</option>
                </select>
                <select
                  className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <select
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Start Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Due Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-600">Progress: {formData.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
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
                  onClick={resetForm}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="rounded-xl bg-white p-6 shadow-soft">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 
                      className="cursor-pointer text-lg font-semibold text-slate-900 hover:text-blue-600 transition"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.title}
                    </h3>
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="mb-3 text-sm text-slate-600">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div>📁 {task.project.name}</div>
                    {task.assignee && <div>👤 {task.assignee.name}</div>}
                    {task.startDate && (
                      <div>🗓️ Start: {new Date(task.startDate).toLocaleDateString()}</div>
                    )}
                    {task.dueDate && (
                      <div>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {(!currentUser || currentUser.role === "PM" || currentUser.role === "Admin") && (
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleEdit(task)}
                    className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="flex-1 rounded-lg bg-red-100 py-2 text-xs font-medium text-red-700 transition hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-soft">

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
            <p className="text-slate-500">No tasks found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
