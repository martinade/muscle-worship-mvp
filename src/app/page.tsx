export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Muscle Worship Platform</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Wallet system is ready. Use the API endpoints to interact with the platform.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Available API Endpoints</h2>
          <ul className="space-y-2 text-sm">
            <li><code className="bg-muted px-2 py-1 rounded">POST /api/auth/register-fan</code> - Register as a fan</li>
            <li><code className="bg-muted px-2 py-1 rounded">POST /api/auth/register-creator</code> - Register as a creator</li>
            <li><code className="bg-muted px-2 py-1 rounded">POST /api/auth/login</code> - Login</li>
            <li><code className="bg-muted px-2 py-1 rounded">GET /api/wallet/balance</code> - Check wallet balance</li>
            <li><code className="bg-muted px-2 py-1 rounded">POST /api/wallet/credit</code> - Credit wallet</li>
            <li><code className="bg-muted px-2 py-1 rounded">POST /api/wallet/debit</code> - Debit wallet</li>
            <li><code className="bg-muted px-2 py-1 rounded">GET /api/wallet/history</code> - Transaction history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
