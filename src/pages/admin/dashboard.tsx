import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { verifyToken } from "@/lib/auth/tokenUtils";
import { createClient } from "@supabase/supabase-js";

interface PendingCreator {
  user_id: string;
  username: string;
  email: string;
  submitted_at: string;
}

interface AdminDashboardProps {
  userName: string;
}

const AdminDashboard: NextPage<AdminDashboardProps> = ({ userName }) => {
  const router = useRouter();
  const [pending, setPending] = useState<PendingCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch("/api/admin/kyc/pending");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load pending creators");
        return;
      }

      setPending(data.pending || []);
    } catch (err) {
      setError("Network error. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    router.push("/login");
  };

  const handleApprove = async (userId: string) => {
    setApproving(userId);

    try {
      const res = await fetch("/api/admin/kyc/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_id: userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to approve creator");
        return;
      }

      // Remove from list
      setPending((prev) => prev.filter((p) => p.user_id !== userId));
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - Muscle Worship Platform</title>
      </Head>

      <div className="mw-bg min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
        {/* Header */}
        <header className="bg-[var(--bg-panel)]">
          <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-semibold text-[var(--text-primary)] leading-none">
                <span className="mw-gradient-text inline-block text-2xl" style={{ animationDuration: "38s" }}>
                  Muscle Worship
                </span>
              </Link>
              <span className="mw-chip mw-chip-lg text-xs font-semibold text-[var(--text-primary)]">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">{userName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="mw-chip mw-chip-lg text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="h-px bg-[var(--accent-primary)] opacity-70" />
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-[1200px] px-4 py-6">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Manage creator approvals and platform operations.
          </p>

          {/* KYC Queue Card */}
          <div className="mw-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Pending KYC Approvals
                {!loading && (
                  <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                    ({pending.length})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchPending(); }}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-8 text-center text-[var(--text-muted)]">
                Loading pending creators...
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-[var(--accent-primary-faint)] border border-[var(--border-accent)] text-[var(--text-danger)] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && pending.length === 0 && (
              <div className="py-8 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-[var(--text-muted)] text-sm">
                  No pending approvals. All caught up!
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && pending.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-default)]">
                      <th className="text-left py-3 px-2 text-[var(--text-muted)] font-medium">
                        Username
                      </th>
                      <th className="text-left py-3 px-2 text-[var(--text-muted)] font-medium">
                        Email
                      </th>
                      <th className="text-left py-3 px-2 text-[var(--text-muted)] font-medium">
                        Submitted
                      </th>
                      <th className="text-right py-3 px-2 text-[var(--text-muted)] font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((creator) => (
                      <tr
                        key={creator.user_id}
                        className="border-b border-[var(--border-default)] last:border-b-0"
                      >
                        <td className="py-3 px-2 text-[var(--text-primary)]">
                          {creator.username}
                        </td>
                        <td className="py-3 px-2 text-[var(--text-secondary)]">
                          {creator.email}
                        </td>
                        <td className="py-3 px-2 text-[var(--text-muted)]">
                          {formatDate(creator.submitted_at)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleApprove(creator.user_id)}
                            disabled={approving === creator.user_id}
                            className="mw-btn-primary px-4 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
                          >
                            {approving === creator.user_id ? "..." : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const accessToken = context.req.cookies.accessToken;

  if (!accessToken) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  let decoded: { userId: string; role?: string } | null = null;
  try {
    decoded = verifyToken(accessToken, "access");
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }

  if (!decoded?.userId || decoded.role !== "admin") {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  // Fetch admin username
  let userName = "Admin";
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: user } = await supabase
      .from("users")
      .select("username")
      .eq("user_id", decoded.userId)
      .single();

    if (user?.username) {
      userName = user.username;
    }
  } catch {
    // Keep default
  }

  return { props: { userName } };
};
