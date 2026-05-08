export default function HelpTip({ id, activeTooltip, setActiveTooltip, placement = 'top', children }) {
  const isActive = activeTooltip === id
  const isBottom = placement === 'bottom'

  const popoverPos = isBottom
    ? 'top-full mt-2'
    : 'bottom-full mb-2'

  const arrowPos = isBottom
    ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800'
    : 'top-full left-1/2 -translate-x-1/2 border-t-gray-800'

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
          className={`absolute left-1/2 -translate-x-1/2 ${popoverPos} w-56 px-3 py-2 z-20 pointer-events-none bg-gray-800 text-white text-xs rounded-lg shadow-lg leading-snug font-normal normal-case tracking-normal`}
        >
          {children}
          <span className={`absolute ${arrowPos} border-4 border-transparent`} />
        </span>
      )}
    </span>
  )
}
