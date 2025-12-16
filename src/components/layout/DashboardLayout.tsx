import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "fan" | "creator" | "admin";
  userName?: string;
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

function roleBadgeClass(role: DashboardLayoutProps["role"]) {
  if (role === "fan") return "bg-blue-100 text-blue-800";
  if (role === "creator") return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
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
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold text-gray-900">
              Muscle Worship
            </Link>
            <span className={`text-xs px-2 py-1 rounded-full ${roleBadgeClass(role)}`}>
              {role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{userName || "User"}</span>
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <nav className="border rounded-xl p-3 space-y-1">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden">
          <div className="border rounded-xl p-2 overflow-x-auto whitespace-nowrap">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="inline-block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
