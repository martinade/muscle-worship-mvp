import React, { useEffect, useState } from "react";

interface Transaction {
  transaction_id: string;
  transaction_type: string;
  amount_wc: number;
  description: string | null;
  created_at: string | null;
}

export function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch balance
        const balanceRes = await fetch("/api/wallet/balance");
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData.balance_wc ?? 0);
        }

        // Fetch recent transactions
        const historyRes = await fetch("/api/wallet/history");
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setTransactions((historyData.transactions || []).slice(0, 3));
        }
      } catch (err) {
        setError("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const formatAmount = (amount: number, type: string) => {
    const isCredit = type === "credit" || type === "refund";
    return `${isCredit ? "+" : "-"}${Math.abs(amount).toLocaleString()} WC`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="mw-card p-5">
      <div className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
        Worship Coin Wallet (WC)
      </div>

      {/* Balance */}
      <div className="mb-4">
        <span className="text-xs text-[var(--text-muted)]">WC Balance</span>
        <div className="text-2xl font-bold text-[var(--text-primary)]">
          {loading ? "—" : error ? "Error" : (balance ?? 0).toLocaleString()}
        </div>
      </div>

      {/* Recent Transactions */}
      {!loading && !error && transactions.length > 0 && (
        <div className="mb-4 border-t border-[var(--border-default)] pt-3">
          <div className="text-xs text-[var(--text-muted)] mb-2">Recent</div>
          <div className="space-y-1.5">
            {transactions.map((tx) => (
              <div
                key={tx.transaction_id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-[var(--text-secondary)] truncate max-w-[120px]">
                  {tx.description || tx.transaction_type}
                </span>
                <span
                  className={
                    tx.transaction_type === "credit" || tx.transaction_type === "refund"
                      ? "text-green-400"
                      : "text-[var(--text-muted)]"
                  }
                >
                  {formatAmount(tx.amount_wc, tx.transaction_type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && transactions.length === 0 && (
        <div className="mb-4 text-xs text-[var(--text-muted)]">
          No transactions yet
        </div>
      )}

      {/* Top Up Button */}
      <button
        type="button"
        disabled
        className="mw-btn-primary w-full py-2 rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
      >
        Top Up
      </button>
    </div>
  );
}
