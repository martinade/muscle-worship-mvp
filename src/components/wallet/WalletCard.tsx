import React from "react";

export function WalletCard() {
  return (
    <div className="mw-card p-6">
      <div className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        Worship Coin Wallet (WC)
      </div>

      <div className="mb-4 text-sm text-[var(--text-secondary)]">
        WC Balance: <span className="font-medium">—</span>
      </div>

      <button
        type="button"
        disabled aria-disabled
        className="mw-btn-primary inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium opacity-70 cursor-not-allowed"
      >
        Top Up
      </button>
    </div>
  );
}
