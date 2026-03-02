import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function Topbar({ title, onLogout }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{t("common.welcome")}</p>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          title={language === "en" ? "Switch to Indonesian" : "Ganti ke Bahasa Inggris"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="uppercase">{language}</span>
        </button>
        
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {t("common.logout")}
        </button>
      </div>
    </header>
  );
}
