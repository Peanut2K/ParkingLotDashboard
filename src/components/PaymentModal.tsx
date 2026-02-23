"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type PaymentModalProps = {
  fee: number;
  transactionId: string;
  onPaymentSuccess?: () => void;
};

type PaymentStatus = 'idle' | 'loading' | 'success' | 'error';

export default function PaymentModal({ fee, transactionId, onPaymentSuccess }: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulatePayment = async () => {
    setPaymentStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/transactions/${transactionId}/payment`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Error ${res.status}`);
      }
      setPaymentStatus('success');
      onPaymentSuccess?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('error');
    }
  };

  if (fee === 0) {
    return null; // Don't show button if free
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
      >
        💳 Pay ฿{fee}
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-stone-900">
                    Payment
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Scan QR Code to pay
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="rounded-2xl bg-white p-6">
                <div className="mx-auto aspect-square w-full max-w-[280px] rounded-xl border-4 border-stone-200 bg-gradient-to-br from-emerald-50 to-stone-50 p-4">
                  {/* QR Code Placeholder - will be replaced with real QR */}
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                    <svg
                      className="h-32 w-32 text-stone-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="text-center text-sm font-semibold text-stone-400">
                      QR Code for Payment
                    </p>
                    <p className="text-xs text-stone-400">{transactionId}</p>
                  </div>
                </div>
              </div>

              {/* Simulate Payment Button */}
              {paymentStatus !== 'success' ? (
                <button
                  onClick={handleSimulatePayment}
                  disabled={paymentStatus === 'loading'}
                  className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentStatus === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      Processing…
                    </span>
                  ) : (
                    'Test Payment'
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payment successful!
                </div>
              )}
              {paymentStatus === 'error' && (
                <p className="-mt-2 text-center text-xs text-red-500">{errorMsg}</p>
              )}

              <div className="space-y-4 rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">
                    Receipt No.
                  </span>
                  <span className="font-mono text-sm font-semibold text-stone-900">
                    {transactionId}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                  <span className="text-base font-semibold text-stone-700">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-emerald-700">
                    ฿{fee}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-blue-900">
                      Supports PromptPay · TrueMoney · LINE Pay · ShopeePay
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl border-2 border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
