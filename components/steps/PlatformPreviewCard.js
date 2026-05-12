const ACCENT = '#16a34a'

export default function PlatformPreviewCard({
  platforms,
  activePlatform,
  onPlatformChange,
  drafts,
  dirty,
  onDraftChange,
  onReset,
  onCopy,
  copied,
  onToggleListNow,
  listNowMenuOpen,
  listNowMenuRef,
}) {
  const activeText = drafts[activePlatform] || ''
  const isDirty = !!dirty[activePlatform]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Platform toggle */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {platforms.map(p => {
          const active = p.key === activePlatform
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onPlatformChange(p.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              style={active
                ? { backgroundColor: ACCENT, color: '#ffffff' }
                : { backgroundColor: '#f3f4f6', color: '#374151' }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Sync-state cue */}
      <div className="flex items-center justify-between mb-2">
        {isDirty ? (
          <p className="text-xs font-medium" style={{ color: '#92400e' }}>
            ✎ Edited — won&apos;t auto-update when you change inputs.
          </p>
        ) : (
          <p className="text-xs text-gray-500">↻ Auto-synced from your inputs.</p>
        )}
        {isDirty && (
          <button
            type="button"
            onClick={() => onReset(activePlatform)}
            className="text-xs font-semibold underline underline-offset-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            Reset to template
          </button>
        )}
      </div>

      {/* Editable preview */}
      <textarea
        value={activeText}
        onChange={e => onDraftChange(activePlatform, e.target.value)}
        rows={14}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:border-transparent transition resize-none font-mono"
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button
          type="button"
          onClick={onCopy}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: copied ? '#6b7280' : ACCENT }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Description'}
        </button>

        <div className="relative" ref={listNowMenuRef}>
          <button
            type="button"
            onClick={onToggleListNow}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-800 bg-white hover:bg-gray-50 transition-colors"
          >
            📤 List Now {listNowMenuOpen ? '▴' : '▾'}
          </button>
          {listNowMenuOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg z-20 overflow-hidden"
            >
              {platforms.map(p => {
                if (!p.listUrl) {
                  return (
                    <div key={p.key} className="px-4 py-2.5 text-xs text-gray-600 border-b border-gray-100 last:border-b-0">
                      <span className="font-semibold text-gray-800">{p.label}:</span> copy this draft and paste into a new post on your phone.
                    </div>
                  )
                }
                return (
                  <a
                    key={p.key}
                    href={p.listUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="text-xs text-gray-400">Open →</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
