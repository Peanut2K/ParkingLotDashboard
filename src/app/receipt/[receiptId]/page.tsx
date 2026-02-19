"use client";
import { notFound, useRouter } from "next/navigation";
import PaymentModal from "@/components/PaymentModal";
import { useEffect, useState, use } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

type PageProps = {
  params: Promise<{ receiptId: string }>;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Receipt = {
  id: string;
  slotId: string;
  floorName: string;
  buildingName: string;
  entryTime: string; // ISO 8601
  plateNumber?: string;
};

type ApiTransaction = {
  id: number;
  license_plate: string;
  building: string;
  building_id: number | null;
  image_path: string | null;
  entry_time: string;
  exit_time: string | null;
  qr_token: string;
  status: string;
  fee: number | null;
};

type ApiResponse = {
  status: string;
  count: number;
  transactions: ApiTransaction[];
};

const calculateParkingFee = (entryTime: Date, exitTime: Date) => {
  const durationMs = exitTime.getTime() - entryTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  if (durationHours <= 1) {
    return { hours: durationHours, fee: 0, freeHour: true };
  }
  
  const billableHours = Math.ceil(durationHours - 1);
  const fee = billableHours * 20;
  
  return { hours: durationHours, fee, freeHour: false, billableHours };
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) {
    return `${m} min`;
  }
  if (m === 0) {
    return `${h} hr`;
  }
  return `${h} hr ${m} min`;
};

const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatShortTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReceiptPage({ params }: PageProps) {
  const rawReceiptId = use(params).receiptId;
  let receiptId = rawReceiptId;
  try {
    while (receiptId.includes('%')) {
      receiptId = decodeURIComponent(receiptId);
    }
  } catch (e) {
    receiptId = rawReceiptId;
  }
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Call Next.js API Route proxy to avoid CORS
        const response = await fetch(`/api/transactions?license_plate=${encodeURIComponent(receiptId)}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (isMounted && data && data.transactions && data.transactions.length > 0) {
          const transaction = data.transactions[0];
          setReceipt({
            id: transaction.id.toString(),
            slotId: "-",
            floorName: "-",
            buildingName: transaction.building,
            entryTime: transaction.entry_time,
            plateNumber: transaction.license_plate,
          });
        } else if (isMounted) {
          setReceipt(null);
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        if (isMounted) {
          setReceipt(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [receiptId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!receipt) {
    notFound();
  }
  
  // receiptId is the license_plate from the path e.g. /receipt/ABC1234

  const entryTime = new Date(receipt.entryTime);
  const currentTime = new Date(); // in the future this could come from API
  const pricing = calculateParkingFee(entryTime, currentTime);

  return (
    <div className="dashboard-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="fade-up">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            กลับหน้าหลัก
          </Link> */}
        </header>

        <section className="glass-panel rounded-[32px] p-8 fade-up-delay sm:p-10">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </div>
                <h1 className="mt-4 text-3xl text-stone-900 sm:text-4xl">
                  Parking Receipt
                </h1>
                <p className="mt-2 text-sm text-stone-500">
                  Receipt No: {receipt.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Parking Receipt
                </p>
                <svg
                  className="mt-2 h-12 w-12 text-stone-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Parking Details */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Parking Details
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-500">
                    Parking Spot
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">
                    {receipt.slotId}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {receipt.floorName}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-500">Location</p>
                  <p className="mt-2 text-lg font-semibold text-stone-900">
                    {receipt.buildingName}
                  </p>
                </div>
              </div>

              {receipt.plateNumber && (
                <div className="rounded-2xl border-2 border-stone-900 bg-white p-4">
                  <p className="text-xs font-semibold text-stone-500">
                    License Plate
                  </p>
                  <p className="mt-1 text-center text-3xl font-bold tracking-wider text-stone-900">
                    {receipt.plateNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Time Details */}
            <div className="space-y-4 border-y border-stone-200 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-500">
                    Entry Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">
                    {formatShortTime(entryTime)}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {formatTime(entryTime)}
                  </p>
                </div>
                <div className="rounded-full bg-stone-200 p-3">
                  <svg
                    className="h-5 w-5 text-stone-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-500">
                    Current Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">
                    {formatShortTime(currentTime)}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {formatTime(currentTime)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-700">
                    Duration
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {formatDuration(pricing.hours)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Pricing Details
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">First 1 hour</span>
                  <span className="font-semibold text-emerald-700">Free</span>
                </div>
                {pricing.billableHours && pricing.billableHours > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">
                      Additional time ({pricing.billableHours} hr × ฿20)
                    </span>
                    <span className="font-semibold text-stone-900">
                      ฿{pricing.billableHours * 20}
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-stone-900 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-400">
                      Total Amount
                    </p>
                    {pricing.freeHour && (
                      <p className="mt-1 text-xs text-stone-500">
                        🎉 Free! Within 1 hour
                      </p>
                    )}
                  </div>
                  <p className="text-4xl font-bold text-white">
                    {pricing.fee === 0 ? (
                      <span className="text-emerald-400">฿0</span>
                    ) : (
                      <span>฿{pricing.fee}</span>
                    )}
                  </p>
                </div>
              </div>

              <PaymentModal fee={pricing.fee} receiptId={receipt.id} />
            </div>

            {/* Footer Info */}
            <div className="space-y-4 border-t border-stone-200 pt-6">
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
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
                    <p className="text-sm font-semibold text-amber-900">
                      Important Information
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      Please keep this receipt to present when leaving the parking lot. Fees are calculated by rounding up to the nearest hour.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-stone-400">
                <p>Contact: 02-XXX-XXXX</p>
                <p className="mt-1">ParkingLot Dashboard © 2026</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
