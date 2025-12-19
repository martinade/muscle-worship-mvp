import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { verifyToken } from "@/lib/auth/tokenUtils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WalletCard } from "@/components/wallet/WalletCard";

interface CreatorDashboardProps {
  userName: string;
}

const CreatorDashboard: NextPage<CreatorDashboardProps> = ({ userName }) => {
  return (
    <>
      <Head>
        <title>Creator Dashboard - Muscle Worship Platform</title>
      </Head>
      <DashboardLayout
        role="creator"
        userName={userName}
        pageTitle="Creator Dashboard"
        headerCenter={
          <div className="mw-card w-full px-6 py-4 text-sm text-[var(--text-secondary)]">
            Creator data will appear here.
          </div>
        }
        headerRight={
          <div className="w-full md:w-[240px]">
            <WalletCard />
          </div>
        }
      >
        <div className="mw-card p-6 text-[var(--text-secondary)]">Main content area.</div>
      </DashboardLayout>
    </>
  );
};

export default CreatorDashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const accessToken = context.req.cookies.accessToken;

  if (!accessToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  let decoded: { userId: string; role?: string } | null = null;
  try {
    decoded = verifyToken(accessToken, "access");
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (!decoded || !decoded.userId) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (decoded.role !== "creator") {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  // Fetch username from database
  let userName = "Creator";
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
    const { data: user } = await supabase
      .from("users")
      .select("username")
      .eq("user_id", decoded.userId)
      .single();
    if (user?.username) {
      userName = user.username;
    }
  } catch (error) {
    // Use default if fetch fails
  }

  return {
    props: {
      userName,
    },
  };
};
