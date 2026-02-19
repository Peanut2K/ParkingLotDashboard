export default function LoadingSpinner() {
  return (
    <div className="dashboard-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-stone-900 border-r-transparent"></div>
        <p className="mt-4 text-stone-600">Loading</p>
      </div>
    </div>
  );
}
