"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock as LockIcon } from "@/lib/daisy-ui";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const controller = new AbortController();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Cookie is automatically set by the server
        // Redirect to admin dashboard
        router.push("/admin");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LockIcon className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-semibold text-base-content">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Enter your admin credentials to access the order management system
          </p>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <form className="card-body gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            <label className="form-control w-full" htmlFor="username">
              <span className="label">
                <span className="label-text">Username</span>
              </span>
              <input
                required
                className="input input-bordered w-full"
                id="username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-control w-full" htmlFor="password">
              <span className="label">
                <span className="label-text">Password</span>
              </span>
              <input
                required
                className="input input-bordered w-full"
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary mt-2 w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-base-content/60">
            Olgish Cakes Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
