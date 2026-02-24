import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api.js";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister ? { name, email, password } : { email, password };
      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header - App Title */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Project Management App</h1>
          <p className="text-sm text-slate-600">Manage your projects efficiently</p>
        </div>

        {/* Login/Register Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </p>
        </div>

        {/* Demo Credentials - Only show on Login */}
        {!isRegister && (
          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-6">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-900">Demo Login Credentials</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Project Manager</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Email:</span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-blue-600">john@example.com</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Password:</span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-blue-600">password123</code>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Team Member</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Email:</span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-blue-600">jane@example.com</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Password:</span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-blue-600">password123</code>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Team Member</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Email:</span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-blue-600">bob@example.com</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">Password:</span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-blue-600">password123</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          © 2026 Project Management App. All rights reserved.
        </p>
      </div>
    </div>
  );
}
