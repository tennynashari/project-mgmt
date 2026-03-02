import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";
import * as XLSX from 'xlsx';
import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function Projects() {
  const { t } = useLanguage();
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

  const handleExportExcel = async () => {
    try {
      // Fetch all projects without pagination
      const allData = await apiFetch(`/api/projects?limit=10000`);
      const allProjects = allData.data || allData;

      // Prepare data for Excel
      const excelData = allProjects.map((project, index) => ({
        'No': index + 1,
        'Project Name': project.name,
        'Description': project.description || '-',
        'Status': project.status,
        'Start Date': project.startDate ? new Date(project.startDate).toLocaleDateString('id-ID') : '-',
        'End Date': project.endDate ? new Date(project.endDate).toLocaleDateString('id-ID') : '-',
        'Owner': project.owner?.name || '-',
        'Created': new Date(project.createdAt).toLocaleDateString('id-ID')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 30 }, // Project Name
        { wch: 40 }, // Description
        { wch: 12 }, // Status
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 20 }, // Owner
        { wch: 15 }  // Created
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Projects');

      // Generate filename with current date
      const fileName = `Projects_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      alert(t("projects.exportFailed") + ': ' + err.message);
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
    <Layout title={t("projects.title")}>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 md:hidden">{t("projects.title")}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("common.export")}
            </button>
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
              + {t("projects.newProject")}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {editingId ? t("projects.editProject") : t("projects.createProject")}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder={t("projects.projectName")}
                className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <textarea
                placeholder={t("projects.description")}
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
                <option value="Planning">{t("projects.statuses.planning")}</option>
                <option value="Ongoing">{t("projects.statuses.ongoing")}</option>
                <option value="Completed">{t("projects.statuses.completed")}</option>
                <option value="Archived">{t("projects.statuses.archived")}</option>
              </select>
              <div className="flex gap-4">
                <input
                  type="date"
                  placeholder={t("projects.startDate")}
                  className="flex-1 rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <input
                  type="date"
                  placeholder={t("projects.endDate")}
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
                  {editingId ? t("common.save") : t("common.create")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {t("common.cancel")}
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
                    <span>{t("projects.progress")}</span>
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
                      <span className="text-slate-600">{t("dashboard.status.todo")}:</span>
                      <span className="font-medium text-slate-700">{p.stats.todoTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{t("dashboard.status.inProgress")}:</span>
                      <span className="font-medium text-blue-700">{p.stats.inProgressTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{t("dashboard.status.review")}:</span>
                      <span className="font-medium text-yellow-700">{p.stats.reviewTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{t("dashboard.status.done")}:</span>
                      <span className="font-medium text-green-700">{p.stats.completedTasks}</span>
                    </div>
                  </div>
                  <div className="mt-2 border-t border-slate-200 pt-2 text-xs font-medium text-slate-700">
                    {t("projects.totalTasks")}: {p.stats.totalTasks}
                  </div>
                </div>
              )}
              
              <div className="mb-4 text-xs text-slate-500">
                {p.startDate && <div>{t("projects.start")}: {new Date(p.startDate).toLocaleDateString()}</div>}
                {p.endDate && <div>{t("projects.end")}: {new Date(p.endDate).toLocaleDateString()}</div>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleArchive(p.id)}
                  className="flex-1 rounded-lg bg-yellow-100 py-2 text-xs font-medium text-yellow-700 transition hover:bg-yellow-200"
                >
                  {t("projects.archive")}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 rounded-lg bg-red-100 py-2 text-xs font-medium text-red-700 transition hover:bg-red-200"
                >
                  {t("common.delete")}
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
              {t("common.previous")}
            </button>
            <span className="px-4 py-2 text-sm text-slate-600">
              {t("common.page")} {pagination.page} {t("common.of")} {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.next")}
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
