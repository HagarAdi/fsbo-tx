import PhaseTag from "./PhaseTag";

export default function StepCard({ step, completed, selected, onToggleComplete, onSelect }) {
  return (
    <div
      className={`border rounded-xl transition-all duration-200 cursor-pointer ${
        selected
          ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200"
          : completed
          ? "border-green-300 bg-green-50 hover:border-green-400"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={() => onSelect(step)}
    >
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Completion toggle — stops propagation so it doesn't also open the panel */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(step.id);
          }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 transition-colors ${
            completed
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          {completed ? "✓" : step.id}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span
              className={`font-semibold text-base ${
                completed ? "text-green-800 line-through" : "text-gray-900"
              }`}
            >
              {step.title}
            </span>
            <PhaseTag phase={step.phase} />
          </div>
          <p className="text-sm text-gray-500">{step.subtitle}</p>
        </div>

        <span
          className={`flex-shrink-0 mt-1 text-xl transition-colors ${
            selected ? "text-blue-400" : "text-gray-300"
          }`}
        >
          ›
        </span>
      </div>
    </div>
  );
}
