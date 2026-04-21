import { useState } from "react";
import PhaseTag from "./PhaseTag";

export default function StepCard({ step, completed, onToggleComplete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-xl transition-all duration-200 ${
        completed
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Header row */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Step number circle */}
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
            completed
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {completed ? "✓" : step.id}
        </span>

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

        {/* Chevron */}
        <span
          className={`flex-shrink-0 text-gray-400 text-lg mt-1 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* Expanded tips */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <ul className="mt-4 space-y-3">
            {step.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onToggleComplete(step.id)}
            className={`mt-5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              completed
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {completed ? "Mark incomplete" : "Mark complete"}
          </button>
        </div>
      )}
    </div>
  );
}
