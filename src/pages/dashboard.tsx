import type { GetServerSideProps } from "next";
import { verifyToken } from "@/lib/auth/tokenUtils";

// This page only redirects - it never renders
export default function DashboardPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const accessToken = context.req.cookies.accessToken;

  // No token = redirect to login
  if (!accessToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Verify token with try/catch for safety
  let decoded: { userId: string; role?: string } | null = null;
  try {
    decoded = verifyToken(accessToken, "access");
  } catch (error) {
    // Token verification failed - redirect to login
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Invalid or expired token
  if (!decoded || !decoded.userId) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Redirect based on role - no default assumption
  const role = decoded.role;

  if (role === "creator") {
    return {
      redirect: {
        destination: "/creator/dashboard",
        permanent: false,
      },
    };
  }

  if (role === "admin") {
    return {
      redirect: {
        destination: "/admin/dashboard",
        permanent: false,
      },
    };
  }

  if (role === "fan") {
    return {
      redirect: {
        destination: "/fan/dashboard",
        permanent: false,
      },
    };
  }

  // Unknown or missing role - redirect to login
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
