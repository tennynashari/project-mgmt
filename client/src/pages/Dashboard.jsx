import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    activeProjects: 0, 
    todayTasks: 0, 
    overdueTasks: 0,
    statusDistribution: { todo: 0, inProgress: 0, review: 0, done: 0 },
    projectProgress: []
  });

  useEffect(() => {
    apiFetch("/api/dashboard")
      .then(setStats)
      .catch(console.error);
  }, []);

  const { statusDistribution, projectProgress } = stats;
  const totalTasks = statusDistribution.todo + statusDistribution.inProgress + 
                     statusDistribution.review + statusDistribution.done;

  return (
    <Layout title="Dashboard">
      <div className="p-4 md:p-8">
        {/* Mobile Title */}
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 md:hidden">Dashboard</h2>
        
        {/* Main Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Active Projects</p>
            <p className="text-3xl font-bold text-slate-900">{stats.activeProjects}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Tasks Today</p>
            <p className="text-3xl font-bold text-slate-900">{stats.todayTasks}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Overdue Tasks</p>
            <p className="text-3xl font-bold text-red-600">{stats.overdueTasks}</p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Task Status Distribution</h3>
          
          {/* Visual Bar */}
          {totalTasks > 0 && (
            <div className="mb-6 flex h-8 w-full overflow-hidden rounded-lg">
              {statusDistribution.todo > 0 && (
                <div
                  className="flex items-center justify-center bg-slate-400 text-xs font-medium text-white transition-all"
                  style={{ width: `${(statusDistribution.todo / totalTasks) * 100}%` }}
                >
                  {statusDistribution.todo > 0 && Math.round((statusDistribution.todo / totalTasks) * 100) > 8 && `${statusDistribution.todo}`}
                </div>
              )}
              {statusDistribution.inProgress > 0 && (
                <div
                  className="flex items-center justify-center bg-blue-500 text-xs font-medium text-white transition-all"
                  style={{ width: `${(statusDistribution.inProgress / totalTasks) * 100}%` }}
                >
                  {statusDistribution.inProgress > 0 && Math.round((statusDistribution.inProgress / totalTasks) * 100) > 8 && `${statusDistribution.inProgress}`}
                </div>
              )}
              {statusDistribution.review > 0 && (
                <div
                  className="flex items-center justify-center bg-yellow-500 text-xs font-medium text-white transition-all"
                  style={{ width: `${(statusDistribution.review / totalTasks) * 100}%` }}
                >
                  {statusDistribution.review > 0 && Math.round((statusDistribution.review / totalTasks) * 100) > 8 && `${statusDistribution.review}`}
                </div>
              )}
              {statusDistribution.done > 0 && (
                <div
                  className="flex items-center justify-center bg-green-500 text-xs font-medium text-white transition-all"
                  style={{ width: `${(statusDistribution.done / totalTasks) * 100}%` }}
                >
                  {statusDistribution.done > 0 && Math.round((statusDistribution.done / totalTasks) * 100) > 8 && `${statusDistribution.done}`}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-slate-400"></div>
              <div>
                <p className="text-xs text-slate-500">To Do</p>
                <p className="text-lg font-bold text-slate-900">{statusDistribution.todo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-blue-500"></div>
              <div>
                <p className="text-xs text-slate-500">In Progress</p>
                <p className="text-lg font-bold text-slate-900">{statusDistribution.inProgress}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-yellow-500"></div>
              <div>
                <p className="text-xs text-slate-500">Review</p>
                <p className="text-lg font-bold text-slate-900">{statusDistribution.review}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-green-500"></div>
              <div>
                <p className="text-xs text-slate-500">Done</p>
                <p className="text-lg font-bold text-slate-900">{statusDistribution.done}</p>
              </div>
            </div>
          </div>

          {totalTasks > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              Total Tasks: <span className="font-semibold text-slate-900">{totalTasks}</span>
            </div>
          )}
        </div>

        {/* Project Progress Chart */}
        {projectProgress && projectProgress.length > 0 && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Project Progress</h3>
            <div className="space-y-4">
              {projectProgress.map((project) => (
                <div key={project.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500">{project.taskCount} tasks</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{project.progress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
