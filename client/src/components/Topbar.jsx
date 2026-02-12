export default function Topbar({ title, onLogout }) {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Welcome back</p>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <button
        onClick={onLogout}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Logout
      </button>
    </header>
  );
}
