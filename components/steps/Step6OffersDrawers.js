import { ACCENT, PURPLE, DRAWERS, OFFER_TERMS, fmtCurrency, inputCls } from './Step6Offers.data'

export default function Step6OffersDrawers({
  activeDrawer, closeDrawer, offers,
  proceedsPrice, setProceedsPrice,
  proceedsCommission, setProceedsCommission,
  proceedsClosingCosts, setProceedsClosingCosts,
  openTerms, toggleTerm, openTrecDrawer,
}) {
  if (!activeDrawer) return null

  const price = parseFloat(proceedsPrice) || 0
  const commission = parseFloat(proceedsCommission) || 0
  const closing = parseFloat(proceedsClosingCosts) || 0
  const commissionAmt = price * (commission / 100)
  const net = price - commissionAmt - closing

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={closeDrawer} />
      <div
        className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl overflow-y-auto"
        style={{ width: 'min(420px, calc(100vw - 40px))', transition: 'transform 300ms ease' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {DRAWERS.find(d => d.id === activeDrawer)?.emoji}{' '}
            {DRAWERS.find(d => d.id === activeDrawer)?.label}
          </h3>
          <button type="button" onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">

          {activeDrawer === 'terms' && (
            <>
              <p className="text-sm text-gray-600">Texas uses the TREC contract. Here&apos;s what each part means for you.</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {OFFER_TERMS.map((term, i) => (
                  <div key={i}>
                    <div
                      onClick={() => toggleTerm(i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{term.title}</span>
                        {term.trecInfo && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openTrecDrawer(term.trecInfo) }}
                            className="text-xs font-semibold px-1.5 py-0.5 rounded border transition-colors hover:bg-purple-50"
                            style={{ borderColor: '#c4b5fd', color: PURPLE }}
                          >
                            ⚖️ TREC
                          </button>
                        )}
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
                        style={{ transform: openTerms[i] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        viewBox="0 0 20 20" fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {openTerms[i] && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-gray-700 mb-2">{term.explanation}</p>
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}>
                          <span className="flex-shrink-0 font-semibold">Why it matters:</span>
                          <span>{term.whyItMatters}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeDrawer === 'proceeds' && (
            <>
              <p className="text-sm text-gray-600">Quick estimate of what you&apos;ll walk away with. Full calculation in Step 8.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Accepted sale price ($)</label>
                  <input type="number" value={proceedsPrice} onChange={e => setProceedsPrice(e.target.value)} placeholder="e.g. 450000" className={inputCls} />
                  {offers.some(o => o.status === 'Accepted') && (
                    <p className="text-xs text-green-600 mt-1">Auto-filled from your accepted offer.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer&apos;s agent commission (%)</label>
                  <input type="number" step="0.1" min="0" max="10" value={proceedsCommission} onChange={e => setProceedsCommission(e.target.value)} className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">FSBO sellers often offer 2–3% to attract buyer agents. Enter 0 if none.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated closing costs ($)</label>
                  <input type="number" value={proceedsClosingCosts} onChange={e => setProceedsClosingCosts(e.target.value)} className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Includes owner&apos;s title policy (~$1,500), taxes, HOA fees. Adjust as needed.</p>
                </div>
              </div>

              {price > 0 && (
                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mt-2">
                  {[
                    { label: 'Sale price', value: fmtCurrency(String(price)), color: '#374151' },
                    { label: `Buyer's agent (${commission}%)`, value: `− ${fmtCurrency(String(Math.round(commissionAmt)))}`, color: '#dc2626' },
                    { label: 'Closing costs', value: `− ${fmtCurrency(String(closing))}`, color: '#dc2626' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-gray-600">{row.label}</span>
                      <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <span className="text-sm font-bold text-gray-900">Est. net proceeds</span>
                    <span className="text-base font-bold" style={{ color: net >= 0 ? ACCENT : '#dc2626' }}>
                      {fmtCurrency(String(Math.round(net)))}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#ede9fe' }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: PURPLE }}>Doesn&apos;t include mortgage payoff</p>
                <p className="text-xs" style={{ color: '#5b21b6' }}>Your net proceeds minus your remaining loan balance = your actual cash at closing. Add your payoff amount in Step 8 for the full picture.</p>
              </div>
            </>
          )}

          {activeDrawer === 'counter' && (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">What&apos;s negotiable</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {['Purchase price', 'Option period length and fee', 'Closing date', 'Earnest money amount', 'Repair requests or credits', 'Inclusions (appliances, fixtures)'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Counter script</p>
                <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;We&apos;ve reviewed your offer and would like to counter at [price] with a [X]-day option period and [earnest money] in earnest money, closing on [date].&rdquo;
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">The process</p>
                <div className="space-y-2">
                  {[
                    'Write your counter in writing — verbal counters are not binding in Texas',
                    'Give the buyer a 24–48 hour deadline to respond',
                    'Stay calm — this is business, not personal',
                    'If they accept your counter, you have a contract',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ backgroundColor: ACCENT, fontSize: '10px' }}>
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
                <p className="font-semibold text-amber-800 text-sm mb-1">⚠️ Texas law</p>
                <p className="text-xs text-amber-700">Only written acceptance is legally binding in Texas. Use the TREC Amendment form. Your title company can help.</p>
              </div>
            </>
          )}

          {activeDrawer === 'decision' && (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Signals of a strong buyer</p>
                <div className="space-y-2">
                  {[
                    { icon: '✅', text: 'Pre-approved (not just pre-qualified)' },
                    { icon: '✅', text: '20%+ down payment' },
                    { icon: '✅', text: '7 days or fewer option period' },
                    { icon: '✅', text: 'Flexible on your closing timeline' },
                    { icon: '✅', text: 'Earnest money at 1%+ of purchase price' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{item.icon}</span> {item.text}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Red flags to watch for</p>
                <div className="space-y-2">
                  {[
                    'FHA/VA without a pre-approval letter',
                    'Earnest money under 1% of purchase price',
                    'Option period longer than 10 days',
                    'Multiple or unusual contingencies',
                    'Buyer requests you pay all closing costs',
                  ].map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span>⚠️</span> {flag}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Before you decide</p>
                <div className="space-y-2">
                  {[
                    'Have you compared all offers side by side?',
                    'Have you calculated your net proceeds?',
                    "Have you verified the buyer's financing confidence?",
                    'Does the closing date work for your timeline?',
                    'Have you consulted your title company?',
                  ].map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-4 h-4 rounded border-2 border-gray-300 mt-0.5" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                <p className="font-semibold text-sm mb-1" style={{ color: ACCENT }}>💡 Multiple offers?</p>
                <p className="text-xs text-green-800">Ask all buyers to submit their &ldquo;highest and best&rdquo; offer by a specific deadline. This is common practice and completely acceptable as an FSBO seller.</p>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
