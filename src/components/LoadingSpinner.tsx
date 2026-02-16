export default function LoadingSpinner() {
  return (
    <div className="dashboard-bg fixed inset-0 z-50 flex items-center justify-center">
      <div className="glass-panel rounded-4xl p-12">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Parking Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              <svg
                className="h-12 w-12 animate-bounce text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
          </div>

          {/* Spinner */}
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-600 border-r-emerald-400"></div>
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-xl font-semibold text-stone-900">
              กำลังโหลด...
            </p>
            <p className="mt-2 text-sm text-stone-500">
              ParkingLot Dashboard
            </p>
          </div>

          {/* Dots Animation */}
          <div className="flex gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
