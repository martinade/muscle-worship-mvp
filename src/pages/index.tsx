import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Muscle Worship Platform</title>
        <meta name="description" content="Muscle Worship Platform" />
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Muscle Worship Platform
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            API is ready. Use the API endpoints to interact with the platform.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Register
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
