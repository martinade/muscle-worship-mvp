import React from "react";

export function WalletCard() {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-gray-900">Wallet</div>

      <div className="mb-4 text-sm text-gray-700">
        Balance: <span className="font-medium">—</span>
      </div>

      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-center rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-600 opacity-70 cursor-not-allowed"
      >
        Top Up
      </button>
    </div>
  );
}
