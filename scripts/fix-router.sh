#!/bin/bash

echo "🔧 Auto-fixing Router Configuration..."
echo ""

# Create app directory if missing
if [ ! -d "src/app" ]; then
    echo "📁 Creating src/app directory..."
    mkdir -p src/app
fi

# Create layout.tsx if missing
if [ ! -f "src/app/layout.tsx" ]; then
    echo "📝 Creating src/app/layout.tsx..."
    cat > src/app/layout.tsx << 'EOF'
import "@/styles/globals.css";

export const metadata = {
  title: "Muscle Worship Platform",
  description: "Muscle Worship Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF
    echo "✅ Created layout.tsx"
fi

# Create page.tsx if missing
if [ ! -f "src/app/page.tsx" ]; then
    echo "📝 Creating src/app/page.tsx..."
    cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
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
  );
}
EOF
    echo "✅ Created page.tsx"
fi

echo ""
echo "✅ Router configuration fixed!"
echo ""
echo "Next steps:"
echo "  1. Restart dev server: npm run dev"
echo "  2. Verify: npm run diagnose"
echo ""
