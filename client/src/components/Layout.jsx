import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function Layout({ children, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Mobile Header with Hamburger */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4 md:hidden">
          <h1 className="text-lg font-semibold text-slate-900">PM App</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Desktop Topbar */}
        <div className="hidden p-4 md:block md:p-8">
          <Topbar title={title} onLogout={handleLogout} />
        </div>

        {/* Mobile Logout Button */}
        <div className="p-4 md:hidden">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
