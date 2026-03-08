import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function Layout({ children, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Mobile Header with Hamburger */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:hidden">
          <h1 className="text-base font-semibold text-slate-900 xs:text-lg">PM App</h1>
          <div className="flex items-center gap-2">
            {/* Mobile Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              title={language === "en" ? "Switch to Indonesian" : "Ganti ke Bahasa Inggris"}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="uppercase">{language}</span>
            </button>
            
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Desktop Topbar */}
        <div className="hidden p-4 md:block md:p-8">
          <Topbar title={title} onLogout={handleLogout} />
        </div>

        {/* Mobile Logout Button */}
        <div className="px-4 pb-3 pt-2 md:hidden">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t("common.logout")}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
