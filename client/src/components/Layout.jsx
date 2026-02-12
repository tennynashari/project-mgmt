import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto">
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
        {children}
      </main>
    </div>
  );
}
