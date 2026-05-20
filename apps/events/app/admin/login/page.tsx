import { LockKeyhole } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { getAdminSession } from '@/lib/admin-auth'

interface LoginPageProps {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession()

  if (session) {
    redirect('/admin')
  }

  const params = await searchParams

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-base-300 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/images/olgish-cakes-logo-bakery-brand.png"
            alt="Olgish Cakes"
            width={56}
            height={56}
            className="h-14 w-14 rounded-md object-contain"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Events admin
            </p>
            <h1 className="text-2xl font-bold">Sign in</h1>
          </div>
        </div>

        {params.error ? (
          <div className="alert alert-error mb-5 text-sm">
            Admin username or password is incorrect.
          </div>
        ) : null}

        <form className="grid gap-4" action="/api/admin/login" method="post">
          <label className="form-control">
            <span className="label pb-1">
              <span className="label-text font-semibold">Username</span>
            </span>
            <input
              className="input input-bordered bg-white"
              name="username"
              autoComplete="username"
              required
            />
          </label>
          <label className="form-control">
            <span className="label pb-1">
              <span className="label-text font-semibold">Password</span>
            </span>
            <input
              className="input input-bordered bg-white"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="btn btn-primary gap-2" type="submit">
            <LockKeyhole aria-hidden="true" size={18} />
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}
