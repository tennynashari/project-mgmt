import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

const navItem = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive ? "bg-slate-900 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Sidebar({ isOpen, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    apiFetch("/api/users/me/profile")
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  const isPMorAdmin = currentUser && (currentUser.role === "PM" || currentUser.role === "Admin");

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 h-screen w-64 flex-col border-r border-slate-100 bg-white p-6 transition-transform md:static md:flex ${
        isOpen ? 'flex translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-slate-900">PM App</h1>
        <p className="text-xs text-slate-500">Project Management</p>
        {currentUser && (
          <div className="mt-2 rounded-lg bg-slate-50 p-2">
            <p className="text-xs font-medium text-slate-700">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.role}</p>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-2">
        <NavLink to="/" className={navItem} onClick={onClose}>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={navItem} onClick={onClose}>
          Projects
        </NavLink>
        <NavLink to="/tasks" className={navItem} onClick={onClose}>
          Tasks
        </NavLink>
        <NavLink to="/activities" className={navItem} onClick={onClose}>
          Activity Log
        </NavLink>
        {isPMorAdmin && (
          <NavLink to="/users" className={navItem} onClick={onClose}>
            👥 User Management
          </NavLink>
        )}
      </nav>
    </aside>
    </>
  );
}
