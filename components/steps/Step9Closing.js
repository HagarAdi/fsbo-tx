import { useState, useEffect, useRef } from 'react'
import {
  ACCENT, PURPLE, DRAWERS,
  WALKTHROUGH_BUYER, WALKTHROUGH_SELLER,
  CLOSING_TIMELINE, AFTER_CLOSING, KEEP_FOREVER, TAX_CARDS,
  CONFETTI_PIECES,
  loadStep9, saveStep9, fmtMoney, getSalePrice,
} from './Step9Closing.data'

export default function Step9Closing({ onComplete, isCompleted, priceEstimate, onSelectStep }) {
  const [activeDrawer, setActiveDrawer] = useState(null)

  const [walkthroughChecked, setWalkthroughChecked] = useState(() =>
    typeof window === 'undefined' ? [] : (loadStep9().walkthroughChecked || [])
  )
  const [afterClosingChecked, setAfterClosingChecked] = useState(() =>
    typeof window === 'undefined' ? [] : (loadStep9().afterClosingChecked || [])
  )

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

  const salePrice = typeof window !== 'undefined' ? getSalePrice(priceEstimate) : (priceEstimate?.currentEstimate || 0)
  const savings   = salePrice * 0.03

  function toggleWalkthrough(id) {
    setWalkthroughChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleAfterClosing(id) {
    setAfterClosingChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleDrawer(id) {
    setActiveDrawer(prev => prev === id ? null : id)
  }

  const mustDoCount  = WALKTHROUGH_SELLER.filter(i => i.isMust).length
  const mustDoneDone = walkthroughChecked.filter(id => WALKTHROUGH_SELLER.find(i => i.id === id && i.isMust)).length

  return (
    <div className="relative flex gap-6 px-4 py-8 md:px-10 md:py-12 max-w-4xl">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute; top: 0;
          animation: confettiFall linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: '#ede9fe', color: PURPLE }}>Close</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Closing Day 🎉</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
          You made it. Today you sign, transfer ownership, and collect your proceeds. Here&apos;s everything you need to make closing day smooth.
        </p>

        {/* 3 Drawer Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {DRAWERS.map(({ id, emoji, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleDrawer(id)}
              className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm"
              style={activeDrawer === id
                ? { backgroundColor: PURPLE, color: '#fff', borderColor: PURPLE }
                : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Closing Day Timeline — hero */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-1">What happens at closing ✍️</h3>
          <p className="text-sm text-gray-500 mb-5">Most FSBO sellers have never done this. Here&apos;s exactly what happens, step by step.</p>

          <div className="rounded-xl border-2 px-5 py-5" style={{ borderColor: '#e9d5ff', backgroundColor: '#faf5ff' }}>
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-px bg-purple-200" />
              <div className="space-y-4">
                {CLOSING_TIMELINE.map(({ emoji, title, detail }, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: '#ede9fe' }}>
                      {emoji}
                    </div>
                    <div className="flex-1 rounded-xl border border-purple-100 bg-white px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 mb-0.5">{title}</p>
                      <p className="text-sm text-gray-600">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* After Closing Checklist */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Do these right after closing ✅</h3>
          <p className="text-sm text-gray-500 mb-5">Don&apos;t let these slip through the cracks.</p>

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <div className="space-y-3">
              {AFTER_CLOSING.map(({ id, label, timeframe }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={afterClosingChecked.includes(id)}
                    onChange={() => toggleAfterClosing(id)}
                    className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
                    style={{ accentColor: ACCENT }}
                  />
                  <span className={`text-sm flex-1 ${afterClosingChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>{label}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>{timeframe}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Celebration + Mark Complete */}
        <section
          ref={celebrationRef}
          className="relative overflow-hidden rounded-2xl px-8 py-8 mb-2"
          style={{ backgroundColor: '#faf5ff', border: '2px solid #e9d5ff' }}
        >
          {celebrationVisible && CONFETTI_PIECES.map(({ id, color, left, delay, duration, size, isCircle }) => (
            <div
              key={id}
              className="confetti-piece"
              style={{ left, width: size, height: size, backgroundColor: color, animationDelay: delay, animationDuration: duration, borderRadius: isCircle ? '50%' : '2px' }}
            />
          ))}

          <h3 className="text-2xl font-bold text-center mb-6 relative z-10" style={{ color: PURPLE }}>🎉 You did it!</h3>

          {salePrice > 0 ? (
            <div className="space-y-4 mb-6 relative z-10">
              <div className="rounded-xl px-5 py-4 text-center bg-white">
                <p className="text-sm text-gray-600 mb-1">You just sold your home for</p>
                <p className="text-3xl font-bold" style={{ color: ACCENT }}>{fmtMoney(salePrice)}</p>
              </div>
              <div className="rounded-xl px-5 py-4 text-center" style={{ backgroundColor: '#ede9fe' }}>
                <p className="text-sm text-gray-600 mb-1">By selling FSBO, you saved approximately</p>
                <p className="text-3xl font-bold" style={{ color: PURPLE }}>{fmtMoney(savings)}</p>
                <p className="text-sm text-gray-600 mt-1">in listing agent commission</p>
              </div>
              <div className="rounded-xl px-5 py-3 text-center text-sm font-semibold" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
                That&apos;s money in YOUR pocket
              </div>
            </div>
          ) : (
            <div className="rounded-xl px-5 py-4 text-center text-sm text-gray-500 mb-6 bg-white relative z-10">
              Complete Step 1 to see your estimated sale price here.
            </div>
          )}

          <p className="text-center text-gray-700 leading-relaxed text-sm relative z-10 mb-8">
            Selling a home is one of the biggest financial decisions of your life. You took control, did the work, and came out ahead. That&apos;s something to be proud of.
          </p>

          <div className="relative z-10">
            {isCompleted ? (
              <div className="text-center space-y-3">
                <div className="rounded-xl px-6 py-4 bg-white" style={{ border: '2px solid #16a34a' }}>
                  <p className="text-lg font-bold mb-1" style={{ color: ACCENT }}>✓ All 9 steps complete!</p>
                  <p className="text-xl font-bold text-gray-900">You sold your home FSBO — congratulations!</p>
                  {savings > 0 && <p className="text-sm font-semibold mt-2" style={{ color: ACCENT }}>You saved {fmtMoney(savings)} in listing agent commission</p>}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled
                    className="px-6 py-3 rounded-lg text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: PURPLE }}
                  >
                    Share your success (coming soon)
                  </button>
                  <button type="button" onClick={() => onComplete(false)} className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors">Undo</button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onComplete(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  Mark this step complete — I&apos;m done! 🎉
                </button>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* ── Right Sidebar ── */}
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <div className="sticky top-8 space-y-4">

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pre-closing</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Walkthrough ready</span>
              <span className="text-sm font-bold" style={{ color: mustDoneDone === mustDoCount ? ACCENT : '#374151' }}>
                {mustDoneDone}/{mustDoCount}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${mustDoCount > 0 ? (mustDoneDone / mustDoCount) * 100 : 0}%`, backgroundColor: ACCENT }} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">After closing</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Tasks done</span>
              <span className="text-sm font-bold" style={{ color: afterClosingChecked.length === AFTER_CLOSING.length ? ACCENT : '#374151' }}>
                {afterClosingChecked.length}/{AFTER_CLOSING.length}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(afterClosingChecked.length / AFTER_CLOSING.length) * 100}%`, backgroundColor: ACCENT }} />
            </div>
          </div>

          {savings > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">FSBO Savings</p>
              <p className="text-2xl font-black" style={{ color: PURPLE }}>{fmtMoney(savings)}</p>
              <p className="text-xs text-gray-400">vs. listing agent</p>
            </div>
          )}

        </div>
      </aside>

      {/* ── Drawers ── */}
      {activeDrawer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setActiveDrawer(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <span className="font-bold text-gray-900">
                {DRAWERS.find(d => d.id === activeDrawer)?.emoji}{' '}
                {DRAWERS.find(d => d.id === activeDrawer)?.label}
              </span>
              <button type="button" onClick={() => setActiveDrawer(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-6 space-y-6">

              {/* Final Walkthrough */}
              {activeDrawer === 'walkthrough' && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What the buyer will verify</p>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 space-y-2">
                      {WALKTHROUGH_BUYER.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="flex-shrink-0 text-gray-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your checklist — 24 hours before</p>
                    <div className="space-y-3">
                      {WALKTHROUGH_SELLER.map(({ id, label, badge, isMust }) => (
                        <label key={id} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={walkthroughChecked.includes(id)}
                            onChange={() => toggleWalkthrough(id)}
                            className="h-4 w-4 rounded border-gray-300 flex-shrink-0 mt-0.5"
                            style={{ accentColor: ACCENT }}
                          />
                          <span className={`text-sm flex-1 ${walkthroughChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>{label}</span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={isMust ? { backgroundColor: '#fef2f2', color: '#dc2626' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>{badge}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Keep Forever */}
              {activeDrawer === 'forever' && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents to keep forever</p>
                  <div className="space-y-3">
                    {KEEP_FOREVER.map(({ doc, why }) => (
                      <div key={doc} className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                        <p className="text-sm font-bold text-gray-900 mb-1">{doc}</p>
                        <p className="text-sm text-gray-600">{why}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Tax Notes */}
              {activeDrawer === 'taxes' && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Capital gains — key points</p>
                  <div className="space-y-3">
                    {TAX_CARDS.map((card, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm" style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}>
                        <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
                        <span>{card}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  )
}
