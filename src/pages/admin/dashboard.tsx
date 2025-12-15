import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { verifyToken } from "@/lib/auth/tokenUtils";

const AdminDashboard: NextPage = () => {
  return (
    <>
      <Head>
        <title>Admin Dashboard - Muscle Worship Platform</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </main>
    </>
  );
};

export default AdminDashboard;

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

  if (decoded.role !== "admin") {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
