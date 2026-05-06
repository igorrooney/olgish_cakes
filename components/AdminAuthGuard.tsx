"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorBoundary } from "./ErrorBoundary";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/earnings", label: "Earnings" },
  { href: "/admin/email-test", label: "Email test" }
];

const externalItems = [
  { href: "/studio", label: "Content Studio" },
  { href: "/", label: "View Website" }
];

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname() || "/admin";
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController()

    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/admin/auth", {
          method: "GET",
          credentials: "include",
          signal: controller.signal
        });

        await response.json();
        setIsAuthenticated(response.ok);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setIsAuthenticated(false);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void checkAuthStatus();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      router.push("/admin/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    const controller = new AbortController();

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
        signal: controller.signal
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/admin/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-base-200 px-6">
        <div className="flex flex-col items-center gap-3 text-sm text-base-content/70">
          <span data-testid="circular-progress" className="loading loading-spinner loading-md text-primary" aria-hidden="true" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-base-200 px-6">
        <div className="flex flex-col items-center gap-3 text-sm text-base-content/70">
          <span data-testid="circular-progress" className="loading loading-spinner loading-md text-primary" aria-hidden="true" />
          <span>Not authenticated. Redirecting to login...</span>
        </div>
      </div>
    );
  }

  const isActiveNavItem = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClass = (href: string) => {
    const isActive = isActiveNavItem(href);
    return [
      "flex min-h-11 items-center rounded-md border border-l-4 px-3 text-sm font-semibold transition-colors",
      isActive
        ? "border-primary-400 bg-primary-50 text-primary-800 shadow-sm"
        : "border-transparent text-base-content/70 hover:border-primary-50 hover:bg-base-200 hover:text-base-content"
    ].join(" ");
  };

  const navigation = (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={navLinkClass(item.href)}
          aria-current={isActiveNavItem(item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
      <div className="divider my-3" />
      {externalItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content"
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <ErrorBoundary>
      <div className="drawer min-h-screen bg-base-200 lg:drawer-open">
        <input id="admin-shell-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <label
                  htmlFor="admin-shell-drawer"
                  className="btn btn-ghost btn-sm lg:hidden"
                  aria-label="Open admin navigation"
                >
                  Menu
                </label>
                <div className="min-w-0">
                  <Link href="/admin" className="block truncate text-base font-semibold text-base-content">
                    Olgish Cakes Admin
                  </Link>
                  <p className="hidden text-xs text-base-content/60 sm:block">
                    Orders, enquiries, earnings and email operations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>

        <aside className="drawer-side z-40">
          <label htmlFor="admin-shell-drawer" aria-label="Close admin navigation" className="drawer-overlay" />
          <div className="min-h-full w-72 border-r border-base-300 bg-base-100 p-4">
            <div className="mb-6 rounded-md border border-base-300 bg-base-200 p-4">
              <p className="text-sm font-semibold text-base-content">Olgish Cakes</p>
              <p className="mt-1 text-xs text-base-content/60">Admin workspace</p>
            </div>
            {navigation}
          </div>
        </aside>
      </div>
    </ErrorBoundary>
  );
}
