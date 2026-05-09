import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ACCENT = '#16a34a'

const CONFETTI_COLORS = ['#7c3aed', '#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#f97316']

const CONFETTI_PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 1.7) % 100}%`,
  delay: `${((i * 0.13) % 2.5).toFixed(2)}s`,
  duration: `${(2.6 + (i % 5) * 0.4).toFixed(1)}s`,
  size: 7 + (i % 4) * 3,
  isCircle: i % 3 === 0,
}))

const cardVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

export default function MilestoneCelebration({
  isOpen,
  onClose,
  onContinue,
  phaseTitle,
  subtitle,
  summaryItems = [],
  continueLabel = 'Continue →',
  badge,
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
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <style>{`
            @keyframes milestoneConfettiFall {
              0%   { transform: translateY(-30px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(640px) rotate(720deg); opacity: 0; }
            }
            @keyframes milestoneTrophyPop {
              0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
              60%  { transform: scale(1.15) rotate(8deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            .milestone-confetti {
              position: absolute;
              top: -20px;
              animation: milestoneConfettiFall linear infinite;
              pointer-events: none;
              will-change: transform, opacity;
            }
            .milestone-trophy {
              animation: milestoneTrophyPop 0.6s cubic-bezier(.34,1.56,.64,1) both;
            }
          `}</style>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={phaseTitle}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {CONFETTI_PIECES.map(({ id, color, left, delay, duration, size, isCircle }) => (
                <span
                  key={id}
                  className="milestone-confetti"
                  style={{
                    left,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    animationDelay: delay,
                    animationDuration: duration,
                    borderRadius: isCircle ? '50%' : '2px',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>

            <motion.div
              className="relative px-7 pt-9 pb-7 text-center"
              variants={cardVariants}
              initial="hidden"
              animate="show"
            >
              <div className="milestone-trophy mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md"
                style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}
                aria-hidden
              >
                🏆
              </div>

              {badge && (
                <motion.p
                  variants={itemVariants}
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ backgroundColor: '#dcfce7', color: ACCENT }}
                >
                  {badge}
                </motion.p>
              )}

              <motion.h2 variants={itemVariants} className="text-2xl font-extrabold text-gray-900 mb-1">
                {phaseTitle}
              </motion.h2>

              {subtitle && (
                <motion.p variants={itemVariants} className="text-sm text-gray-600 mb-5 leading-relaxed px-2">
                  {subtitle}
                </motion.p>
              )}

              {summaryItems.length > 0 && (
                <motion.ul variants={itemVariants} className="space-y-2 mb-6 text-left">
                  {summaryItems.map(({ icon, label, value }, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm"
                    >
                      <span className="text-xl flex-shrink-0" aria-hidden>{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                      </div>
                      <span className="text-green-500 text-lg flex-shrink-0" aria-hidden>✓</span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              <motion.button
                variants={itemVariants}
                type="button"
                onClick={onContinue}
                className="w-full px-5 py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #15803d 100%)` }}
              >
                {continueLabel}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
