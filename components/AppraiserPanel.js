import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TX_APPRAISERS, TX_METROS, detectMetroFromAddress } from '../utils/appraisers'

const ACCENT = '#16a34a'
const TALCB_URL = 'https://www.talcb.texas.gov/license-lookup'

export default function AppraiserPanel({ open, onClose, homeAddress }) {
  const [metro, setMetro] = useState('All')

  useEffect(() => {
    if (open) {
      const d = detectMetroFromAddress(homeAddress)
      setMetro(d || 'All')
    }
  }, [open, homeAddress])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const detected = detectMetroFromAddress(homeAddress)
  const filtered = metro === 'All'
    ? TX_APPRAISERS
    : TX_APPRAISERS.filter((a) => a.metros.includes(metro))

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="appraiser-backdrop"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="appraiser-panel"
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="appraiser-panel-title"
          >
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
              <div>
                <h2 id="appraiser-panel-title" className="text-lg font-bold text-gray-900">
                  Pre-listing appraisers
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Texas TALCB-licensed appraisers serving FSBO sellers
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close appraiser panel"
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none -mt-1 px-2"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
              <p className="text-xs text-amber-800 leading-relaxed">
                🚧 We&apos;re building a vetted directory. The entries below are placeholders for layout. For now, verify any TX appraiser on{' '}
                <a href={TALCB_URL} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                  TALCB License Lookup ↗
                </a>{' '}
                before hiring.
              </p>
            </div>

            <div className="px-6 py-4 border-b border-gray-100">
              <label htmlFor="appraiser-metro" className="block text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1">
                Metro area
              </label>
              <select
                id="appraiser-metro"
                value={metro}
                onChange={(e) => setMetro(e.target.value)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="All">All Texas</option>
                {TX_METROS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {detected && metro === detected && (
                <p className="mt-1 text-xs text-gray-500">
                  Auto-selected from your home address
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No appraisers listed for this metro yet. Try TALCB&apos;s lookup above.
                </p>
              ) : filtered.map((a) => (
                <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.metros.join(', ')}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-semibold">Typical fee:</span> {a.feeRange}
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {a.phone ? (
                      <a
                        href={`tel:${a.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-sm font-medium underline underline-offset-2"
                        style={{ color: ACCENT }}
                      >
                        📞 {a.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">📞 Phone listing coming soon</span>
                    )}
                    {a.website && (
                      <a
                        href={a.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline underline-offset-2"
                        style={{ color: ACCENT }}
                      >
                        {a.placeholder ? 'Find via TALCB ↗' : 'Visit website ↗'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 leading-relaxed">
                Don&apos;t see your area? Search{' '}
                <a
                  href={TALCB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                  style={{ color: ACCENT }}
                >
                  TALCB&apos;s appraiser directory ↗
                </a>{' '}
                for licensed appraisers anywhere in Texas.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
