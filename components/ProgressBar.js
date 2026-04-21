export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Your progress
        </span>
        <span className="text-sm font-semibold text-green-700">
          {completed} / {total} steps complete
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-green-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {completed === total && total > 0 && (
        <p className="mt-2 text-sm text-green-700 font-medium">
          All steps complete — you're ready to sell!
        </p>
      )}
    </div>
  );
}
