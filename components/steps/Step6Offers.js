import { useState, useEffect, useCallback } from 'react'
import TRECDrawer from '../TRECDrawer'
import Step6OfferCard from './Step6OfferCard'
import Step6OffersDrawers from './Step6OffersDrawers'
import {
  ACCENT, PURPLE, DRAWERS, FINANCING_OPTIONS,
  OFFER_STATUS_COLORS, TX_TIPS,
  makeEmptyOffer, calcScore, scoreBreakdown, getRedFlags,
  fmtCurrency, fmtDate, loadStep6, saveStep6,
} from './Step6Offers.data'

export default function Step6Offers({ onComplete, isCompleted, onSelectStep }) {
  const [activeDrawer, setActiveDrawer] = useState(null)
  const [trecDrawer, setTrecDrawer] = useState({ isOpen: false, info: null })
  const [expandedOffer, setExpandedOffer] = useState(null)
  const [openTerms, setOpenTerms] = useState({})
  const [offers, setOffers] = useState([])
  const [proceedsPrice, setProceedsPrice] = useState('')
  const [proceedsCommission, setProceedsCommission] = useState('2.5')
  const [proceedsClosingCosts, setProceedsClosingCosts] = useState('3000')
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const saved = loadStep6()
    const loaded = saved.offers && saved.offers.length > 0
      ? saved.offers.map(o => ({ status: 'Received', ...o }))
      : []
    setOffers(loaded)
  }, [])

  useEffect(() => {
    if (offers.length > 0) saveStep6({ offers })
  }, [offers])

  const closeDrawer = useCallback(() => setActiveDrawer(null), [])

  useEffect(() => {
    if (!activeDrawer) return
    const handler = (e) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeDrawer, closeDrawer])

  const openTrecDrawer = (info) => setTrecDrawer({ isOpen: true, info })
  const closeTrecDrawer = () => setTrecDrawer(prev => ({ ...prev, isOpen: false }))

  useEffect(() => {
    const accepted = offers.find(o => o.status === 'Accepted')
    if (accepted && accepted.price) setProceedsPrice(accepted.price)
  }, [offers])

  const updateOffer = (id, field, value) =>
    setOffers(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o))

  const addOffer = () => {
    if (offers.length >= 4) return
    const newOffer = makeEmptyOffer(`Offer ${offers.length + 1}`)
    setOffers(prev => [newOffer, ...prev])
    setExpandedOffer(newOffer.id)
  }

  const removeOffer = (id) => {
    setOffers(prev => prev.filter(o => o.id !== id))
    if (expandedOffer === id) setExpandedOffer(null)
    setConfirmDelete(null)
  }

  const toggleExpanded = (id) => setExpandedOffer(prev => prev === id ? null : id)
  const toggleTerm = (i) => setOpenTerms(prev => ({ ...prev, [i]: !prev[i] }))

  const filledOffers = offers.filter(o => o.price)
  const maxPrice = filledOffers.length > 0 ? Math.max(...filledOffers.map(o => parseFloat(o.price) || 0)) : 0
  const hasAccepted = offers.some(o => o.status === 'Accepted')

  const offerScores = offers.reduce((acc, o) => {
    acc[o.id] = calcScore(o, maxPrice)
    return acc
  }, {})

  const compareRows = filledOffers.length >= 2 ? [
    {
      label: 'Status',
      type: 'status',
      values: filledOffers.map(o => ({ display: o.status, status: o.status })),
    },
    {
      label: 'Purchase Price',
      values: filledOffers.map(o => ({ raw: parseFloat(o.price) || 0, display: fmtCurrency(o.price) })),
      best: 'max',
    },
    {
      label: 'Financing',
      values: filledOffers.map(o => ({ raw: FINANCING_OPTIONS.indexOf(o.financing), display: o.financing || '—' })),
      best: 'min',
    },
    {
      label: 'Down Payment',
      values: filledOffers.map(o => ({ raw: parseFloat(o.downPayment) || 0, display: o.downPayment ? `${o.downPayment}%` : '—' })),
      best: 'max',
    },
    {
      label: 'Option Period',
      values: filledOffers.map(o => ({ raw: parseFloat(o.optionDays) ?? Infinity, display: o.optionDays ? `${o.optionDays} days` : '—' })),
      best: 'min',
    },
    {
      label: 'Option Fee',
      values: filledOffers.map(o => ({ raw: parseFloat(o.optionFee) || 0, display: fmtCurrency(o.optionFee) })),
      best: 'max',
    },
    {
      label: 'Earnest Money',
      values: filledOffers.map(o => ({ raw: parseFloat(o.earnestMoney) || 0, display: fmtCurrency(o.earnestMoney) })),
      best: 'max',
    },
    {
      label: 'Closing Date',
      values: filledOffers.map(o => ({
        raw: o.closingDate ? new Date(o.closingDate).getTime() : Infinity,
        display: fmtDate(o.closingDate),
      })),
      best: 'min',
    },
    {
      label: 'Strength Score',
      type: 'score',
      values: filledOffers.map(o => ({ raw: offerScores[o.id], display: `${offerScores[o.id]}/100` })),
      best: 'max',
    },
    {
      label: 'Red Flags',
      type: 'flags',
      values: filledOffers.map(o => {
        const count = getRedFlags(o).length
        return { raw: count, display: count === 0 ? '—' : `⚠️ ${count}` }
      }),
      best: 'min',
    },
  ] : []

  return (
    <>
      <div className="flex max-w-4xl">

        {/* LEFT: main content */}
        <div className="flex-1 px-4 py-8 md:px-10 md:py-12 min-w-0">

          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: '#ede9fe', color: PURPLE }}
            >
              Close
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Review &amp; Negotiate Offers</h2>
          <p className="text-gray-600 leading-relaxed mb-10">
            <span className="font-semibold text-gray-800">Price isn&apos;t everything.</span>{' '}
            Terms, financing, and contingencies matter just as much. Use the guides above to understand every part of a Texas offer.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {DRAWERS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDrawer(prev => prev === d.id ? null : d.id)}
                className="rounded-xl border px-4 py-3 text-sm font-semibold text-left hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: activeDrawer === d.id ? ACCENT : '#e5e7eb',
                  color: activeDrawer === d.id ? ACCENT : '#374151',
                }}
              >
                <span className="block text-xl mb-1">{d.emoji}</span>
                {d.label}
              </button>
            ))}
          </div>

          {hasAccepted && (
            <div
              className="rounded-xl px-5 py-4 mb-8 flex items-center justify-between gap-4 flex-wrap"
              style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}
            >
              <div>
                <p className="text-base font-bold text-green-800">
                  <span className="inline-block animate-bounce mr-1">🎉</span>
                  Congratulations — you&apos;re officially Under Contract!
                </p>
                <p className="text-sm text-green-700 mt-0.5">Move to Step 7 to manage the Option Period and inspection requests.</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectStep && onSelectStep(7)}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                → Go to Step 7
              </button>
            </div>
          )}

          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Offers</h3>
                <p className="text-sm text-gray-500">{offers.length} offer{offers.length !== 1 ? 's' : ''} logged</p>
              </div>
              {offers.length < 4 && (
                <button
                  type="button"
                  onClick={addOffer}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  + Add Offer
                </button>
              )}
            </div>

            {offers.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
                <p className="text-sm text-gray-400">No offers logged yet.</p>
                <button
                  type="button"
                  onClick={addOffer}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  Log your first offer
                </button>
              </div>
            )}

            <div className="space-y-3">
              {offers.map(offer => (
                <Step6OfferCard
                  key={offer.id}
                  offer={offer}
                  isExpanded={expandedOffer === offer.id}
                  score={offerScores[offer.id]}
                  flags={getRedFlags(offer)}
                  breakdown={scoreBreakdown(offer, maxPrice)}
                  isHighestPrice={offer.price && parseFloat(offer.price) === maxPrice && filledOffers.length > 1}
                  confirmDelete={confirmDelete}
                  setConfirmDelete={setConfirmDelete}
                  removeOffer={removeOffer}
                  updateOffer={updateOffer}
                  toggleExpanded={toggleExpanded}
                  activeTooltip={activeTooltip}
                  setActiveTooltip={setActiveTooltip}
                />
              ))}
            </div>
          </section>

          {compareRows.length > 0 && (
            <section className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Side-by-Side Comparison</h3>
              <p className="text-sm text-gray-500 mb-4">Highlights the best value in each row.</p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm" style={{ minWidth: `${filledOffers.length * 140 + 140}px` }}>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 w-36">Term</th>
                      {filledOffers.map((o) => (
                        <th key={o.id} className="text-left px-4 py-3 bg-gray-50">
                          <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{o.nickname || 'Offer'}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {compareRows.map((row, ri) => {
                      const raws = row.values.map(v => v.raw)
                      const validRaws = raws.filter(r => r !== Infinity && r !== 0 && !isNaN(r))
                      const bestRaw = (row.best && validRaws.length > 0)
                        ? (row.best === 'max' ? Math.max(...validRaws) : Math.min(...validRaws))
                        : null

                      return (
                        <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{row.label}</td>
                          {row.values.map((v, ci) => {
                            if (row.type === 'status') {
                              const c = OFFER_STATUS_COLORS[v.status] || OFFER_STATUS_COLORS['Received']
                              return (
                                <td key={ci} className="px-4 py-3">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>{v.display}</span>
                                </td>
                              )
                            }
                            const isWinner = bestRaw !== null && v.raw === bestRaw && v.raw !== 0 && v.raw !== Infinity
                            const isFlagsRow = row.type === 'flags'
                            return (
                              <td
                                key={ci}
                                className="px-4 py-3 text-sm font-medium"
                                style={isWinner && !isFlagsRow
                                  ? { backgroundColor: '#f0fdf4', color: '#15803d' }
                                  : isFlagsRow && v.raw > 0
                                    ? { color: '#92400e' }
                                    : { color: '#374151' }
                                }
                              >
                                {row.type === 'score' && isWinner ? (
                                  <span className="flex items-center gap-1.5 flex-wrap">
                                    <span>{v.display}</span>
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>✓ Strongest</span>
                                  </span>
                                ) : v.display}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Strength score is a guide — consult your title company or a real estate attorney for final decisions.
              </p>
            </section>
          )}

          <div className="pt-6 border-t border-gray-100">
            {isCompleted ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill={ACCENT} />
                      <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Done!
                  </span>
                  <button type="button" onClick={() => onComplete(false)} className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors">Undo</button>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectStep && onSelectStep(7)}
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: ACCENT }}
                >
                  Next up: Option Period &amp; Inspection →
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onComplete(true)}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Mark this step complete
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: sticky sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 pt-8 pr-6">
          <div className="sticky top-8 space-y-6">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Strength Score</p>
              <div className="space-y-1.5">
                {[
                  { range: '90–100', label: 'Exceptional', color: '#15803d' },
                  { range: '75–89',  label: 'Strong',      color: '#16a34a' },
                  { range: '60–74',  label: 'Average',     color: '#92400e' },
                  { range: '< 60',   label: 'Weak',        color: '#dc2626' },
                ].map(b => (
                  <div key={b.range} className="flex items-center gap-2 text-xs">
                    <span className="w-14 font-semibold text-gray-500">{b.range}</span>
                    <span style={{ color: b.color, fontWeight: 600 }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Quick Stats</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500">Offers:</span>
                  <span className="text-gray-800 font-medium">{offers.length}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500">Highest:</span>
                  <span className={maxPrice > 0 ? 'text-gray-800 font-medium' : 'text-gray-300'}>
                    {maxPrice > 0 ? fmtCurrency(String(maxPrice)) : '—'}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500">Strongest:</span>
                  <span className={filledOffers.length > 0 ? 'text-gray-800 font-medium' : 'text-gray-300'}>
                    {filledOffers.length > 0
                      ? (() => {
                          const best = filledOffers.reduce((a, b) => offerScores[a.id] >= offerScores[b.id] ? a : b)
                          return best.nickname || 'Offer'
                        })()
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Texas Tips</p>
              <ul className="space-y-2.5">
                {TX_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                    <span className="flex-shrink-0 mt-0.5">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </aside>

      </div>

      <Step6OffersDrawers
        activeDrawer={activeDrawer}
        closeDrawer={closeDrawer}
        offers={offers}
        proceedsPrice={proceedsPrice}
        setProceedsPrice={setProceedsPrice}
        proceedsCommission={proceedsCommission}
        setProceedsCommission={setProceedsCommission}
        proceedsClosingCosts={proceedsClosingCosts}
        setProceedsClosingCosts={setProceedsClosingCosts}
        openTerms={openTerms}
        toggleTerm={toggleTerm}
        openTrecDrawer={openTrecDrawer}
      />

      <TRECDrawer
        isOpen={trecDrawer.isOpen}
        onClose={closeTrecDrawer}
        termName={trecDrawer.info?.termName}
        whatItSays={trecDrawer.info?.whatItSays}
        whatItMeans={trecDrawer.info?.whatItMeans}
        moneyTrail={trecDrawer.info?.moneyTrail}
        txSellerTip={trecDrawer.info?.txSellerTip}
      />
    </>
  )
}
