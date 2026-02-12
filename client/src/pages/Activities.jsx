import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [pagination.page]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/activities?page=${pagination.page}&limit=${pagination.limit}`);
      setActivities(data.data || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "comment":
        return "💬";
      case "task_update":
        return "📝";
      default:
        return "📌";
    }
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Activity Log</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">Loading activities...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-xl bg-white p-4 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.message}</p>
                    <p className="mt-1 text-sm text-slate-600">{activity.detail}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>👤 {activity.user}</span>
                      <span>📁 {activity.project}</span>
                      <span>🕒 {getRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && !loading && (
              <div className="rounded-xl bg-white p-12 text-center shadow-soft">
                <p className="text-slate-500">No activities yet</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
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
    </Layout>
  );
}
