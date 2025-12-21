import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { verifyToken } from "@/lib/auth/tokenUtils";

// Step definitions
type StepKey = "legal" | "profile" | "tax" | "kyc" | "await";

interface Step {
  key: StepKey;
  label: string;
}

const STEPS: Step[] = [
  { key: "legal", label: "Legal Disclaimer" },
  { key: "profile", label: "Profile Setup" },
  { key: "tax", label: "Tax Form" },
  { key: "kyc", label: "KYC Verification" },
  { key: "await", label: "Await Approval" },
];

function getStepIndex(step: StepKey): number {
  return STEPS.findIndex((s) => s.key === step);
}

// Props from SSR
interface OnboardingProps {
  userName: string;
  currentStep: StepKey;
  legalDisclaimerText: string;
}

const CreatorOnboarding: NextPage<OnboardingProps> = ({
  userName,
  currentStep,
  legalDisclaimerText,
}) => {
  const router = useRouter();
  const step: StepKey = currentStep;
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeIdx = getStepIndex(step);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    router.push("/login");
  };

  const handleAcceptDisclaimer = async () => {
    if (!accepted) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/creator/legal/accept_disclaimer", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to accept disclaimer. Please try again.");
        return;
      }

      window.location.reload();
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Creator Onboarding - Muscle Worship Platform</title>
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
                Creator
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
            Creator Onboarding
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Complete these steps to activate your creator account and start earning.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            {/* Step Rail */}
            <aside className="mw-card p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Onboarding Progress
              </div>
              <ol className="space-y-2">
                {STEPS.map((s, idx) => {
                  const isActive = idx === activeIdx;
                  const isDone = idx < activeIdx;
                  const isLocked = idx > activeIdx;

                  return (
                    <li
                      key={s.key}
                      className={`
                        flex items-center justify-between rounded-lg px-3 py-2.5 text-sm border transition-colors
                        ${isActive
                          ? "border-[var(--border-accent)] bg-[var(--accent-primary-faint)] text-[var(--text-primary)]"
                          : isDone
                            ? "border-[var(--accent-primary)] border-opacity-40 text-[var(--text-secondary)]"
                            : "border-[var(--border-default)] text-[var(--text-muted)]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`
                            w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                            ${isDone
                              ? "bg-[var(--accent-primary)] text-[var(--text-primary)]"
                              : isActive
                                ? "border-2 border-[var(--accent-primary)] text-[var(--accent-primary)]"
                                : "border border-[var(--border-default)] text-[var(--text-muted)]"
                            }
                          `}
                        >
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <span>{s.label}</span>
                      </div>
                      <span className="text-xs opacity-70">
                        {isDone ? "Done" : isActive ? "Current" : isLocked ? "Locked" : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </aside>

            {/* Step Content */}
            <div className="mw-card p-6">
              {/* Step 1: Legal Disclaimer */}
              {step === "legal" && (
                <>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Legal Disclaimer
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Please read and accept the following terms to continue.
                  </p>

                  <div className="bg-[var(--bg-panel)] border border-[var(--border-default)] rounded-lg p-4 max-h-64 overflow-y-auto mb-5">
                    <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-sans leading-relaxed">
                      {legalDisclaimerText}
                    </pre>
                  </div>

                  {error && (
                    <div className="bg-[var(--accent-primary-faint)] border border-[var(--border-accent)] text-[var(--text-danger)] px-4 py-3 rounded-lg mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <label className="flex items-start gap-3 mb-5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-[var(--border-default)] bg-[var(--bg-panel)] accent-[var(--accent-primary)] cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      I have read, understood, and agree to the terms above. I confirm that I am
                      solely responsible for my own tax obligations.
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAcceptDisclaimer}
                    disabled={!accepted || loading}
                    className="mw-btn-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Accept & Continue"}
                  </button>
                </>
              )}

              {/* Step 2: Profile Setup (Placeholder) */}
              {step === "profile" && (
                <>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Profile Setup
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Set up your creator profile with bio, location, and services offered.
                  </p>
                  <div className="bg-[var(--bg-panel)] border border-[var(--border-default)] rounded-lg p-8 text-center">
                    <div className="text-3xl mb-3">📝</div>
                    <p className="text-[var(--text-muted)] text-sm">
                      This step will be implemented in a follow-up task.
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: Tax Form (Placeholder) */}
              {step === "tax" && (
                <>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Tax Form Submission
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Upload your W-9 (US) or W-8BEN (International) tax form.
                  </p>
                  <div className="bg-[var(--bg-panel)] border border-[var(--border-default)] rounded-lg p-8 text-center">
                    <div className="text-3xl mb-3">📄</div>
                    <p className="text-[var(--text-muted)] text-sm">
                      This step will be implemented in a follow-up task.
                    </p>
                  </div>
                </>
              )}

              {/* Step 4: KYC Verification (Placeholder) */}
              {step === "kyc" && (
                <>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    KYC Verification
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Upload your government-issued ID and a selfie for identity verification.
                  </p>
                  <div className="bg-[var(--bg-panel)] border border-[var(--border-default)] rounded-lg p-8 text-center">
                    <div className="text-3xl mb-3">🪪</div>
                    <p className="text-[var(--text-muted)] text-sm">
                      This step will be implemented in a follow-up task.
                    </p>
                  </div>
                </>
              )}

              {/* Step 5: Awaiting Approval */}
              {step === "await" && (
                <>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Awaiting Approval
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Your application has been submitted and is under review.
                  </p>
                  <div className="bg-[var(--bg-panel)] border border-[var(--border-default)] rounded-lg p-8 text-center">
                    <div className="text-4xl mb-3">⏳</div>
                    <p className="text-[var(--text-primary)] font-medium mb-2">
                      Application Under Review
                    </p>
                    <p className="text-[var(--text-muted)] text-sm mb-4">
                      Our team typically reviews applications within 1-2 business days.
                    </p>
                    <a
                      href="/creator/dashboard"
                      className="mw-btn-primary inline-flex px-5 py-2 rounded-lg font-semibold text-sm"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CreatorOnboarding;

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

  if (!decoded?.userId || decoded.role !== "creator") {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  // Defaults
  let userName = "Creator";
  let currentStep: StepKey = "legal";
  let legalDisclaimerText = "";

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Fetch user and profile data in parallel
    const [userResult, profileResult, disclaimerModule] = await Promise.all([
      supabase.from("users").select("username").eq("user_id", decoded.userId).single(),
      supabase
        .from("creatorprofiles")
        .select("legal_disclaimer_accepted, kyc_submitted_at, kyc_verified")
        .eq("user_id", decoded.userId)
        .single(),
      import("@/pages/api/creator/legal/accept_disclaimer"),
    ]);

    // Set username
    if (userResult.data?.username) {
      userName = userResult.data.username;
    }

    // Get disclaimer text from API module
    legalDisclaimerText = disclaimerModule.LEGAL_DISCLAIMER || "";

    // Determine current step based on profile progress
    const profile = profileResult.data;
    if (profile) {
      if (profile.kyc_verified) {
        // Fully approved - redirect to dashboard
        return { redirect: { destination: "/creator/dashboard", permanent: false } };
      } else if (profile.kyc_submitted_at) {
        currentStep = "await";
      } else if (profile.legal_disclaimer_accepted) {
        currentStep = "profile";
      }
      // else stays at "legal"
    }
  } catch (error) {
    // Keep defaults on error
    console.error("Onboarding SSR error:", error);
  }

  return {
    props: {
      userName,
      currentStep,
      legalDisclaimerText,
    },
  };
};
