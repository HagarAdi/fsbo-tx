export default function HelpTip({ id, activeTooltip, setActiveTooltip, children }) {
  const isActive = activeTooltip === id

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip((cur) => (cur === id ? null : cur))}
        onFocus={() => setActiveTooltip(id)}
        onBlur={() => setActiveTooltip((cur) => (cur === id ? null : cur))}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') {
            e.preventDefault()
            setActiveTooltip((cur) => (cur === id ? null : id))
          }
        }}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold text-gray-400 border border-gray-300 hover:text-gray-600 hover:border-gray-400 transition-colors ml-1.5 flex-shrink-0 leading-none"
        aria-label="Show tip"
        aria-expanded={isActive}
      >
        ?
      </button>
      {isActive && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 z-20 pointer-events-none bg-gray-800 text-white text-xs rounded-lg shadow-lg leading-snug"
        >
          {children}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  )
}
