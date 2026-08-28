"use client";

import { useState } from "react";
import { useMutation } from '@tanstack/react-query'
import { useRouter } from "next/navigation";
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import { Lock as LockIcon } from "@/lib/daisy-ui";

interface AdminLoginInput {
  username: string
  password: string
  signal: AbortSignal
}

interface AdminLoginResponse {
  success?: boolean
  error?: string
}

async function authenticateAdmin({ username, password, signal }: AdminLoginInput) {
  let response: Response

  try {
    response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      signal
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new Error('Login failed. Please try again.')
  }

  const data = await response.json().catch((): AdminLoginResponse => ({}))

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Invalid credentials')
  }
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const request = useAbortableRequest()
  const loginMutation = useMutation({
    mutationFn: authenticateAdmin,
    onMutate: () => {
      setError('')
    },
    onSuccess: () => {
      router.push('/admin')
    },
    onError: (mutationError) => {
      if (mutationError instanceof DOMException && mutationError.name === 'AbortError') {
        return
      }

      setError(mutationError instanceof Error
        ? mutationError.message
        : 'Login failed. Please try again.')
    }
  })
  const loading = loginMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate({
      username,
      password,
      signal: request.start()
    })
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LockIcon className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-3xl font-semibold text-base-content">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            Enter your admin credentials to access the order management system
          </p>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <form
            action='/api/admin/auth'
            method='post'
            className="card-body gap-4"
            onSubmit={handleSubmit}
          >
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
