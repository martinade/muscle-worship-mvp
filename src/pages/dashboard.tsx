import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

const DashboardPage: NextPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear cookies by making a request or just redirect
    document.cookie = "accessToken=; Max-Age=0; path=/";
    document.cookie = "refreshToken=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Dashboard - Muscle Worship Platform</title>
        <meta name="description" content="Your Dashboard" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Muscle Worship Platform
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/profile"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profile
              </h3>
              <p className="text-gray-600">View and edit your profile</p>
            </Link>

            <Link
              href="/settings"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Settings
              </h3>
              <p className="text-gray-600">Manage your account settings</p>
            </Link>

            <Link
              href="/content"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Content
              </h3>
              <p className="text-gray-600">Browse available content</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
