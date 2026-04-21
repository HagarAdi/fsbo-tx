import PhaseTag from "./PhaseTag";

export default function StepPanel({ step, completed, onClose, onToggleComplete }) {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {step && <PhaseTag phase={step.phase} />}
            <h2 className="text-xl font-bold text-gray-900 mt-2 leading-snug">
              {step?.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{step?.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center text-xl leading-none transition-colors mt-0.5"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
      </div>

      {step && (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Why It Matters */}
          {step.whyItMatters && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Why It Matters
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{step.whyItMatters}</p>
            </section>
          )}

          {/* Action Plan */}
          {step.actionPlan?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Action Plan
              </h3>
              <ol className="space-y-3">
                {step.actionPlan.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Pro Tips */}
          {step.proTips?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Pro Tips
              </h3>
              <div className="space-y-3">
                {step.proTips.map((pt, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3"
                  >
                    <p className="text-sm text-gray-800 leading-relaxed">{pt.tip}</p>
                    <p className="text-xs text-amber-700 mt-1.5 font-medium">— {pt.source}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tools & Resources */}
          {step.vendors?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Tools &amp; Resources
              </h3>
              <div className="space-y-2">
                {step.vendors.map((v, i) => (
                  <a
                    key={i}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 transition-colors group"
                  >
                    <span>{v.name}</span>
                    <span className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 text-base">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Mark complete */}
          <div className="pb-4">
            <button
              onClick={() => onToggleComplete(step.id)}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                completed
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {completed ? "✓ Complete — click to undo" : "Mark this step complete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
