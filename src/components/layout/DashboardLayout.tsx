import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "fan" | "creator" | "admin";
  userName?: string;
  pageTitle?: string;
  headerRight?: React.ReactNode;
  headerCenter?: React.ReactNode;
}

type NavItem = { label: string; href: string };

const navByRole: Record<DashboardLayoutProps["role"], NavItem[]> = {
  fan: [
    { label: "Dashboard", href: "#" },
    { label: "Browse Creators", href: "#" },
    { label: "My Sessions", href: "#" },
    { label: "Wallet", href: "#" },
    { label: "Settings", href: "#" },
  ],
  creator: [
    { label: "Dashboard", href: "#" },
    { label: "My Profile", href: "#" },
    { label: "Sessions", href: "#" },
    { label: "Communities", href: "#" },
    { label: "Wallet", href: "#" },
    { label: "Settings", href: "#" },
  ],
  admin: [{ label: "Dashboard", href: "#" }],
};

export function DashboardLayout({
  children,
  role,
  userName,
  pageTitle,
  headerRight,
  headerCenter,
}: DashboardLayoutProps) {
  const router = useRouter();
  const nav = navByRole[role];

  const handleLogout = async () => {
    try {
      // Try POST first (common), fallback to GET
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok) await fetch("/api/auth/logout");
    } catch (_) {
      // ignore
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="mw-bg min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] bg-[var(--bg-panel)]">
      <header className="bg-[var(--bg-panel)]">
        <div className="mx-auto max-w-[1440px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold text-[var(--text-primary)] leading-none">
              <span
                className="mw-gradient-text inline-block text-4xl"
                style={{ animationDuration: "38s" }}
              >
                Muscle Worship
              </span>
            </Link>
            <span className="mw-chip mw-chip-lg text-sm font-semibold text-[var(--text-primary)]">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">{userName || "User"}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="mw-chip mw-chip-lg text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-accent)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="h-px bg-[var(--accent-primary)] opacity-70" />
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6">
        {pageTitle ? (
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-5">
            {pageTitle}
          </h1>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_240px] gap-6 items-start">
          {/* Dashboard menu (left) */}
          <aside className="hidden md:block">
            <nav className="mw-card p-3 space-y-1">
              {nav.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] ${isActive ? "mw-nav-active" : ""}`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Center data box (row 1, middle) */}
          <div className="md:col-start-2">{headerCenter}</div>

          {/* Wallet (row 1, right) */}
          <div className="md:col-start-3 md:justify-self-end">{headerRight}</div>

          {/* Mobile nav */}
          <div className="md:hidden">
            <div className="mw-card p-2 overflow-x-auto whitespace-nowrap">
              {nav.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`inline-block rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] ${isActive ? "mw-nav-active" : ""}`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Main content spans between menu and wallet */}
          <main className="md:col-start-2 md:col-span-2">{children}</main>
        </div>
      </div>
    </div>
  );
}
