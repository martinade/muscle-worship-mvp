import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { verifyToken } from "@/lib/auth/tokenUtils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WalletCard } from "@/components/wallet/WalletCard";
import { createClient } from "@supabase/supabase-js";

interface FanDashboardProps {
  userName: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

const FanDashboard: NextPage<FanDashboardProps> = ({ userName }) => {
  return (
    <>
      <Head>
        <title>Fan Dashboard - Muscle Worship Platform</title>
      </Head>
      <DashboardLayout role="fan" userName={userName}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Fan Dashboard</h1>
        <div className="max-w-sm">
          <WalletCard />
        </div>
      </DashboardLayout>
    </>
  );
};

export default FanDashboard;

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

  if (decoded.role !== "fan") {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  // Fetch username from database
  let userName = "Fan";
  try {
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
