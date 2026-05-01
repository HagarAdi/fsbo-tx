import { useState, useEffect, useCallback } from 'react'
import TRECDrawer from '../TRECDrawer'
import {
  ACCENT, PURPLE, DRAWERS, OFFER_TERMS, FINANCING_OPTIONS,
  OFFER_STATUS_OPTIONS, OFFER_STATUS_COLORS, TX_TIPS,
  makeEmptyOffer, calcScore, scoreBreakdown, getRedFlags, getScoreBand,
  fmtCurrency, fmtDate, loadStep6, saveStep6, inputCls,
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
    if (!window.confirm('Remove this offer?')) return
    setOffers(prev => prev.filter(o => o.id !== id))
    if (expandedOffer === id) setExpandedOffer(null)
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

          {/* Header */}
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

          {/* 4 Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {DRAWERS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setTrecReturnTo(null)
                  setActiveDrawer(prev => prev === d.id ? null : d.id)
                }}
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

          {/* Celebration banner */}
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

          {/* Offers */}
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
              {offers.map(offer => {
                const isExpanded = expandedOffer === offer.id
                const score = offerScores[offer.id]
                const flags = getRedFlags(offer)
                const breakdown = scoreBreakdown(offer, maxPrice)
                const isHighestPrice = offer.price && parseFloat(offer.price) === maxPrice && filledOffers.length > 1

                return (
                  <div
                    key={offer.id}
                    className="rounded-xl border bg-white overflow-hidden"
                    style={{ borderColor: isExpanded ? ACCENT : '#e5e7eb' }}
                  >
                    {/* Collapsed header — always visible */}
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {offer.nickname || 'Unnamed Offer'}
                          </span>
                          {isHighestPrice && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                              Highest
                            </span>
                          )}
                        </div>
                        {/* Status pills */}
                        <div className="flex gap-1 flex-shrink-0 flex-wrap">
                          {OFFER_STATUS_OPTIONS.map(s => {
                            const c = OFFER_STATUS_COLORS[s]
                            const active = offer.status === s
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => updateOffer(offer.id, 'status', s)}
                                className="px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors"
                                style={active
                                  ? { backgroundColor: c.bg, color: c.text, borderColor: c.bg }
                                  : { backgroundColor: 'white', color: '#9ca3af', borderColor: '#e5e7eb' }
                                }
                              >
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Summary row */}
                      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600 mb-3">
                        {offer.price && (
                          <span className="text-base font-bold text-gray-900">{fmtCurrency(offer.price)}</span>
                        )}
                        {offer.financing && (
                          <span>{offer.financing}{offer.downPayment ? ` · ${offer.downPayment}% down` : ''}</span>
                        )}
                        {offer.closingDate && <span>Closing {fmtDate(offer.closingDate)}</span>}
                      </div>

                      {/* Strength bar + flags */}
                      {offer.price && (
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Strength</span>
                              <span className="text-xs font-semibold text-gray-700">{score}/100 — {getScoreBand(score).label}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{ width: `${score}%`, backgroundColor: ACCENT }}
                              />
                            </div>
                          </div>
                          {flags.length > 0 && (
                            <span
                              className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer"
                              style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                              onClick={() => setExpandedOffer(offer.id)}
                              title="Click to see flag details"
                            >
                              ⚠️ {flags.length} Flag{flags.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => removeOffer(offer.id)}
                          className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(offer.id)}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                        >
                          {isExpanded ? 'Collapse ▴' : 'Edit details ▾'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded form */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Offer nickname</label>
                            <input type="text" value={offer.nickname} onChange={e => updateOffer(offer.id, 'nickname', e.target.value)} placeholder='e.g. "The Jones Family"' className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase price ($)</label>
                            <input type="number" value={offer.price} onChange={e => updateOffer(offer.id, 'price', e.target.value)} placeholder="e.g. 450000" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Financing type</label>
                            <select value={offer.financing} onChange={e => updateOffer(offer.id, 'financing', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                              {FINANCING_OPTIONS.map(f => <option key={f}>{f}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Down payment (%)</label>
                            <input type="number" min="0" max="100" value={offer.downPayment} onChange={e => updateOffer(offer.id, 'downPayment', e.target.value)} placeholder="e.g. 20" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Option period (days)</label>
                            <input type="number" min="0" value={offer.optionDays} onChange={e => updateOffer(offer.id, 'optionDays', e.target.value)} placeholder="e.g. 7" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Option fee ($)</label>
                            <input type="number" min="0" value={offer.optionFee} onChange={e => updateOffer(offer.id, 'optionFee', e.target.value)} placeholder="e.g. 250" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Earnest money ($)</label>
                            <input type="number" min="0" value={offer.earnestMoney} onChange={e => updateOffer(offer.id, 'earnestMoney', e.target.value)} placeholder="e.g. 4500" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Closing date</label>
                            <input type="date" value={offer.closingDate} onChange={e => updateOffer(offer.id, 'closingDate', e.target.value)} className={inputCls} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
                            <input type="text" value={offer.notes} onChange={e => updateOffer(offer.id, 'notes', e.target.value)} placeholder="e.g. Pre-approved, motivated buyer" className={inputCls} />
                          </div>
                        </div>

                        {/* Strength breakdown */}
                        {offer.price && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Strength Breakdown</p>
                            <div className="space-y-2">
                              {breakdown.map(b => (
                                <div key={b.label}>
                                  <div className="flex justify-between text-xs mb-0.5">
                                    <span className="text-gray-600">{b.label}</span>
                                    <span className="text-gray-700 font-medium">{b.points}/{b.max} pts</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                      className="h-1.5 rounded-full transition-all"
                                      style={{ width: `${(b.points / b.max) * 100}%`, backgroundColor: ACCENT }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Red flags */}
                        {flags.length > 0 && (
                          <div className="space-y-2">
                            {flags.map((msg, i) => (
                              <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
                                <span className="flex-shrink-0">⚠️</span>
                                <span className="text-amber-800">{msg}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Comparison Table */}
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

          {/* Footer */}
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

      {/* Slide-over drawers */}
      {activeDrawer && (
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

              {activeDrawer === 'proceeds' && (() => {
                const price = parseFloat(proceedsPrice) || 0
                const commission = parseFloat(proceedsCommission) || 0
                const closing = parseFloat(proceedsClosingCosts) || 0
                const commissionAmt = price * (commission / 100)
                const net = price - commissionAmt - closing
                return (
                  <>
                    <p className="text-sm text-gray-600">Quick estimate of what you&apos;ll walk away with. Full calculation in Step 8.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Accepted sale price ($)</label>
                        <input
                          type="number"
                          value={proceedsPrice}
                          onChange={e => setProceedsPrice(e.target.value)}
                          placeholder="e.g. 450000"
                          className={inputCls}
                        />
                        {offers.some(o => o.status === 'Accepted') && (
                          <p className="text-xs text-green-600 mt-1">Auto-filled from your accepted offer.</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer&apos;s agent commission (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={proceedsCommission}
                          onChange={e => setProceedsCommission(e.target.value)}
                          className={inputCls}
                        />
                        <p className="text-xs text-gray-400 mt-1">FSBO sellers often offer 2–3% to attract buyer agents. Enter 0 if none.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated closing costs ($)</label>
                        <input
                          type="number"
                          value={proceedsClosingCosts}
                          onChange={e => setProceedsClosingCosts(e.target.value)}
                          className={inputCls}
                        />
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
                )
              })()}

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
      )}

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
