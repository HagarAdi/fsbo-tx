import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ACCENT = '#16a34a'

export default function MilestoneCelebration({
  isOpen,
  onClose,
  onContinue,
  phaseTitle,
  subtitle,
  summaryItems = [],
  continueLabel = 'Continue →',
}) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={phaseTitle}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>

            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: '#dcfce7', color: ACCENT }}
              aria-hidden
            >
              🎉
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">{phaseTitle}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{subtitle}</p>
            )}

            {summaryItems.length > 0 && (
              <ul className="space-y-2 mb-6">
                {summaryItems.map(({ icon, label, value }, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="text-lg flex-shrink-0" aria-hidden>{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={onContinue}
              className="w-full px-5 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              {continueLabel}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
