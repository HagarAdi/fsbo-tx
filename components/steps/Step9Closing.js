import { useState, useEffect, useRef } from 'react'

const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const WALKTHROUGH_BUYER = [
  'Agreed repairs are completed',
  'Home is in same condition as when offer was made',
  'All included appliances and fixtures are still there',
  'No new damage since inspection',
]

const WALKTHROUGH_SELLER = [
  { id: 'complete-repairs',  label: 'Complete ALL agreed repairs',                           badge: 'Must do',                isMust: true },
  { id: 'remove-belongings', label: 'Remove every personal belonging',                       badge: 'Must do',                isMust: true },
  { id: 'broom-clean',       label: 'Leave home broom clean',                                badge: 'Must do',                isMust: true },
  { id: 'leave-keys',        label: 'Leave all keys, garage openers, mailbox keys in home',  badge: 'Must do',                isMust: true },
  { id: 'leave-manuals',     label: 'Leave all appliance manuals and warranties',            badge: 'Recommended',            isMust: false },
  { id: 'lights-thermostat', label: 'Turn off all lights, set thermostat to reasonable temp', badge: 'Recommended',          isMust: false },
  { id: 'utility-note',      label: 'Leave a note with utility account numbers',             badge: 'Recommended (nice touch)', isMust: false },
]

const CLOSING_TIMELINE = [
  {
    emoji: '🪪',
    title: 'Arrive',
    detail: 'Bring your government ID. Closing takes 1–2 hours. Title company staff will guide you through everything.',
  },
  {
    emoji: '✍️',
    title: 'Signing',
    detail: "You'll sign 50–100 pages. Don't panic — most are standard forms. Title company explains each one.",
  },
  {
    emoji: '🔑',
    title: 'Keys',
    detail: 'Hand over all keys, garage openers, mailbox keys, gate codes, HOA fobs.',
  },
  {
    emoji: '💸',
    title: 'Funds',
    detail: 'Your net proceeds wire to your bank account — same day or next morning depending on time of closing.',
  },
  {
    emoji: '🎉',
    title: 'Done',
    detail: 'You are no longer the homeowner. Congratulations!',
  },
]

const AFTER_CLOSING = [
  { id: 'cancel-insurance',  label: "Cancel or transfer homeowner's insurance",   timeframe: 'Today' },
  { id: 'usps-forward',      label: 'Submit USPS mail forwarding (usps.com/move)', timeframe: 'Today' },
  { id: 'bank-address',      label: 'Notify your bank of address change',          timeframe: 'This week' },
  { id: 'employer-address',  label: 'Notify your employer of address change',      timeframe: 'This week' },
  { id: 'irs-8822',          label: 'Notify IRS (file Form 8822)',                 timeframe: 'This month' },
  { id: 'cancel-utilities',  label: 'Cancel utilities at old address',             timeframe: 'Closing day or day after' },
  { id: 'keep-docs',         label: 'Keep all closing documents in a safe place',  timeframe: 'Forever' },
]

const KEEP_FOREVER = [
  { doc: 'Closing Disclosure',        why: 'Shows exact sale price, costs, and net proceeds. Needed for tax filing.' },
  { doc: 'Deed',                      why: "Proof of transfer. Keep even though it's recorded publicly." },
  { doc: 'Title Insurance Policy',    why: 'Protects you if ownership disputes arise later.' },
  { doc: 'All repair receipts',       why: 'Adds to your cost basis, reduces capital gains.' },
  { doc: 'Inspection report',         why: 'Keep for your records.' },
  { doc: 'All contracts and addendums', why: 'Complete transaction record.' },
]

const TAX_CARDS = [
  'If you lived in this home for 2 of the last 5 years, up to $250,000 of profit is tax-free ($500,000 if married filing jointly)',
  'Your profit = sale price minus your original purchase price minus capital improvements',
  'Keep all receipts for improvements — they reduce your taxable gain',
  'Consult a CPA for your specific situation — this is general information only',
]

const CONFETTI_COLORS = ['#7c3aed', '#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#f97316']

const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 2.5) % 100}%`,
  delay: `${((i * 0.17) % 3).toFixed(2)}s`,
  duration: `${(2.5 + (i % 5) * 0.4).toFixed(1)}s`,
  size: 8 + (i % 4) * 4,
  isCircle: i % 3 === 0,
}))

function loadStep9() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step9 || {}
  } catch { return {} }
}

function saveStep9(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step9: data }))
  } catch {}
}

function fmtMoney(n) {
  return '$' + Math.round(n).toLocaleString()
}

export default function Step9Closing({ onComplete, isCompleted, priceEstimate, onSelectStep }) {
  const [walkthroughChecked, setWalkthroughChecked] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep9().walkthroughChecked || []
  })

  const [afterClosingChecked, setAfterClosingChecked] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep9().afterClosingChecked || []
  })

  const celebrationRef = useRef(null)
  const [celebrationVisible, setCelebrationVisible] = useState(false)

  useEffect(() => {
    saveStep9({ walkthroughChecked, afterClosingChecked })
  }, [walkthroughChecked, afterClosingChecked])

  useEffect(() => {
    const el = celebrationRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCelebrationVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const currentEstimate = priceEstimate?.currentEstimate || 0
  const savings = currentEstimate * 0.03

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 max-w-3xl">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          top: 0;
          animation: confettiFall linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#ede9fe', color: PURPLE }}
        >
          Close
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Closing Day 🎉</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        You made it. Today you sign, transfer ownership, and collect your proceeds. Here&apos;s everything you need to know to make closing day smooth.
      </p>

      {/* Section: Final walkthrough */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Final walkthrough — 24 hours before closing 🏠</h3>
        <p className="text-sm text-gray-500 mb-6">The buyer will walk through your home one last time. Be ready.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">What buyer will verify</p>
            <div className="space-y-3">
              {WALKTHROUGH_BUYER.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 text-gray-400 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Your checklist</p>
            <div className="space-y-3">
              {WALKTHROUGH_SELLER.map(({ id, label, badge, isMust }) => (
                <label key={id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkthroughChecked.includes(id)}
                    onChange={() => setWalkthroughChecked(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    )}
                    className="h-4 w-4 rounded border-gray-300 flex-shrink-0 mt-0.5"
                    style={{ accentColor: ACCENT }}
                  />
                  <span className={`text-sm flex-1 ${walkthroughChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {label}
                    <span
                      className="ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold"
                      style={isMust
                        ? { backgroundColor: '#fef2f2', color: '#dc2626' }
                        : { backgroundColor: '#f1f5f9', color: '#64748b' }}
                    >
                      {badge}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: What to expect at closing */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">What to expect at closing ✍️</h3>
        <p className="text-sm text-gray-500 mb-6">Most FSBO sellers have never done this. Here&apos;s exactly what happens.</p>

        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-200" />
          <div className="space-y-4">
            {CLOSING_TIMELINE.map(({ emoji, title, detail }, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: '#ede9fe' }}
                >
                  {emoji}
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">{title}</p>
                  <p className="text-sm text-gray-600">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: After closing */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Do these right after closing ✅</h3>
        <p className="text-sm text-gray-500 mb-6">Don&apos;t let these slip through the cracks.</p>

        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <div className="space-y-3">
            {AFTER_CLOSING.map(({ id, label, timeframe }) => (
              <label key={id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={afterClosingChecked.includes(id)}
                  onChange={() => setAfterClosingChecked(prev =>
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                  )}
                  className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
                  style={{ accentColor: ACCENT }}
                />
                <span className={`text-sm flex-1 ${afterClosingChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {label}
                </span>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
                >
                  {timeframe}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Keep forever */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Documents to keep forever 📁</h3>
        <p className="text-sm text-gray-500 mb-6">You will need these for taxes and future reference.</p>

        <div className="space-y-3">
          {KEEP_FOREVER.map(({ doc, why }) => (
            <div key={doc} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-sm font-bold text-gray-900 mb-1">{doc}</p>
              <p className="text-sm text-gray-600">{why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Capital gains tax */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">A note on taxes 💰</h3>

        <div className="space-y-3">
          {TAX_CARDS.map((card, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
              style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}
            >
              <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
              <span>{card}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Celebration */}
      <section
        ref={celebrationRef}
        className="mb-12 relative overflow-hidden rounded-2xl px-8 py-8"
        style={{ backgroundColor: '#faf5ff', border: '2px solid #e9d5ff' }}
      >
        {celebrationVisible && CONFETTI_PIECES.map(({ id, color, left, delay, duration, size, isCircle }) => (
          <div
            key={id}
            className="confetti-piece"
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

        <h3 className="text-2xl font-bold text-center mb-6 relative z-10" style={{ color: PURPLE }}>
          🎉 You did it!
        </h3>

        {currentEstimate > 0 ? (
          <div className="space-y-4 mb-6 relative z-10">
            <div className="rounded-xl px-5 py-4 text-center bg-white">
              <p className="text-sm text-gray-600 mb-1">You just sold your home for</p>
              <p className="text-3xl font-bold" style={{ color: ACCENT }}>{fmtMoney(currentEstimate)}</p>
            </div>
            <div className="rounded-xl px-5 py-4 text-center" style={{ backgroundColor: '#ede9fe' }}>
              <p className="text-sm text-gray-600 mb-1">By selling FSBO, you saved approximately</p>
              <p className="text-3xl font-bold" style={{ color: PURPLE }}>{fmtMoney(savings)}</p>
              <p className="text-sm text-gray-600 mt-1">in listing agent commission</p>
            </div>
            <div
              className="rounded-xl px-5 py-3 text-center text-sm font-semibold"
              style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}
            >
              That&apos;s money in YOUR pocket
            </div>
          </div>
        ) : (
          <div className="rounded-xl px-5 py-4 text-center text-sm text-gray-500 mb-6 bg-white relative z-10">
            Complete Step 1 to see your estimated sale price here.
          </div>
        )}

        <p className="text-center text-gray-700 leading-relaxed text-sm relative z-10">
          Selling a home is one of the biggest financial decisions of your life. You took control, did the work, and came out ahead. That&apos;s something to be proud of.
        </p>
      </section>

      {/* Mark complete */}
      <div className="pt-6 border-t border-gray-100">
        {isCompleted ? (
          <div className="space-y-4">
            <div
              className="rounded-2xl px-6 py-6 text-center"
              style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }}
            >
              <p className="text-lg font-bold mb-1" style={{ color: ACCENT }}>✓ All 9 steps complete!</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">You sold your home FSBO — congratulations!</p>
              {savings > 0 && (
                <p className="text-base font-semibold" style={{ color: ACCENT }}>
                  You saved {fmtMoney(savings)} in listing agent commission
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                style={{ backgroundColor: PURPLE }}
              >
                Share your success (coming soon)
              </button>
              <button
                type="button"
                onClick={() => onComplete(false)}
                className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
              >
                Undo
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(true)}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Mark this step complete — I&apos;m done! 🎉
          </button>
        )}
      </div>
    </div>
  )
}
