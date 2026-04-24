import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const OFFER_TERMS = [
  {
    title: 'Purchase Price',
    explanation: 'The amount the buyer is offering to pay.',
    whyItMatters: 'This is your starting point for negotiation — not necessarily your ending point.',
  },
  {
    title: 'Down Payment',
    explanation: 'How much cash the buyer is putting down.',
    whyItMatters: 'Higher down payment = stronger buyer. 20%+ means no PMI and a serious buyer. Under 5% = higher risk of financing falling through.',
  },
  {
    title: 'Financing Type',
    explanation: 'How the buyer is paying.',
    whyItMatters: 'Cash is king — no appraisal risk, faster close. Conventional is solid. FHA/VA have more requirements and take longer.',
  },
  {
    title: 'Option Period',
    explanation: 'A set number of days (typically 5–10) where the buyer can back out for any reason.',
    whyItMatters: 'Shorter option period = more committed buyer. The buyer pays you an option fee — typically $100–500 — which you keep if they walk.',
  },
  {
    title: 'Option Fee',
    explanation: 'Money paid by buyer for the option period.',
    whyItMatters: 'Non-refundable if buyer cancels. Negotiate for as much as possible.',
  },
  {
    title: 'Closing Date',
    explanation: 'When ownership transfers.',
    whyItMatters: '30–45 days is standard in Texas. Shorter close can be a negotiating chip.',
  },
  {
    title: 'Earnest Money',
    explanation: 'Good faith deposit held by title company.',
    whyItMatters: 'Typically 1% of purchase price. If buyer backs out outside the option period, you may keep this.',
  },
  {
    title: 'Inclusions',
    explanation: 'What stays with the home.',
    whyItMatters: 'Appliances, fixtures, shelving — get clear on what\'s included to avoid surprises at closing.',
  },
  {
    title: 'Appraisal Contingency',
    explanation: 'Buyer can back out if home appraises below purchase price.',
    whyItMatters: 'Common with financed offers. Can negotiate appraisal gap coverage.',
  },
  {
    title: 'Inspection Contingency',
    explanation: 'Buyer can request repairs after inspection.',
    whyItMatters: 'Handled during option period in Texas — not a separate contingency.',
  },
]

const FINANCING_OPTIONS = ['Cash', 'Conventional', 'FHA', 'VA', 'Other']

function makeEmptyOffer(label) {
  return {
    id: Date.now() + Math.random(),
    nickname: label,
    price: '',
    financing: 'Conventional',
    downPayment: '',
    optionDays: '',
    optionFee: '',
    earnestMoney: '',
    closingDate: '',
    notes: '',
  }
}

function calcScore(offer, maxPrice) {
  let score = 0

  // Financing: up to 30
  if (offer.financing === 'Cash') score += 30
  else if (offer.financing === 'Conventional') score += 20
  else if (offer.financing === 'FHA' || offer.financing === 'VA') score += 10

  // Down payment: up to 20
  const dp = parseFloat(offer.downPayment) || 0
  if (dp > 20) score += 20
  else if (dp >= 10) score += 10

  // Option period: up to 15
  const opt = parseFloat(offer.optionDays) || 99
  if (opt < 5) score += 15
  else if (opt <= 7) score += 10
  else score += 5

  // Closing date: up to 10
  if (offer.closingDate) {
    const today = new Date()
    const closing = new Date(offer.closingDate)
    const diffDays = Math.round((closing - today) / (1000 * 60 * 60 * 24))
    if (diffDays <= 30) score += 10
    else if (diffDays <= 45) score += 5
  }

  // Price: up to 25 proportional
  const price = parseFloat(offer.price) || 0
  if (maxPrice > 0 && price > 0) {
    score += Math.round((price / maxPrice) * 25)
  }

  return Math.min(score, 100)
}

function loadStep6() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step6 || {}
  } catch { return {} }
}

function saveStep6(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step6: data }))
  } catch {}
}

function ChevronIcon({ open }) {
  return (
    <svg
      className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

export default function Step6Offers({ onComplete, isCompleted, onSelectStep }) {
  const [openTerms, setOpenTerms] = useState({})
  const [showTable, setShowTable] = useState(false)

  const [offers, setOffers] = useState(() => {
    if (typeof window === 'undefined') return [makeEmptyOffer('Offer 1'), makeEmptyOffer('Offer 2')]
    const saved = loadStep6().offers
    if (saved && saved.length > 0) return saved
    return [makeEmptyOffer('Offer 1'), makeEmptyOffer('Offer 2')]
  })

  useEffect(() => {
    saveStep6({ offers })
  }, [offers])

  const toggleTerm = (i) => setOpenTerms(prev => ({ ...prev, [i]: !prev[i] }))

  const updateOffer = (idx, field, value) => {
    setOffers(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o))
  }

  const addOffer = () => {
    if (offers.length >= 3) return
    setOffers(prev => [...prev, makeEmptyOffer(`Offer ${prev.length + 1}`)])
  }

  const removeOffer = (idx) => {
    setOffers(prev => prev.filter((_, i) => i !== idx))
  }

  const filledOffers = offers.filter(o => o.price && o.price !== '')
  const showComparison = filledOffers.length >= 2

  const maxPrice = Math.max(...filledOffers.map(o => parseFloat(o.price) || 0))
  const scores = filledOffers.map(o => calcScore(o, maxPrice))
  const maxScore = Math.max(...scores)
  const winnerIdx = scores.indexOf(maxScore)

  const fmtCurrency = (val) => {
    const n = parseFloat(val)
    if (!val || isNaN(n)) return '—'
    return '$' + n.toLocaleString()
  }

  const fmtDate = (val) => {
    if (!val) return '—'
    const d = new Date(val + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // For comparison table: best value per row
  const compareRows = [
    {
      label: 'Purchase Price',
      values: filledOffers.map(o => ({ raw: parseFloat(o.price) || 0, display: fmtCurrency(o.price) })),
      best: 'max',
    },
    {
      label: 'Financing',
      values: filledOffers.map(o => ({ raw: ['Cash', 'Conventional', 'FHA', 'VA', 'Other'].indexOf(o.financing), display: o.financing || '—' })),
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
      values: filledOffers.map((_, i) => ({ raw: scores[i], display: `${scores[i]}/100` })),
      best: 'max',
    },
  ]

  return (
    <div className="px-10 py-12 max-w-3xl">

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
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        Getting an offer is exciting — but the wrong response can cost you thousands. Price isn&apos;t
        everything. Terms, financing, and contingencies matter just as much.
      </p>

      {/* What's in a Texas offer */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">What&apos;s in a Texas offer? 📋</h3>
        <p className="text-sm text-gray-500 mb-6">
          Texas uses the TREC contract. Here&apos;s what each part means for you.
        </p>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {OFFER_TERMS.map((term, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggleTerm(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">{term.title}</span>
                <ChevronIcon open={!!openTerms[i]} />
              </button>
              {openTerms[i] && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-700 mb-2">{term.explanation}</p>
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                    style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}
                  >
                    <span className="flex-shrink-0 font-semibold">Why it matters:</span>
                    <span>{term.whyItMatters}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Offer comparison tool */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Compare your offers side by side</h3>
        <p className="text-sm text-gray-500 mb-6">
          Don&apos;t just look at price — the best offer considers all terms.
        </p>

        {/* Offer input cards */}
        <div className="space-y-4 mb-6">
          {offers.map((offer, idx) => (
            <div key={offer.id} className="rounded-xl border border-gray-200 bg-white px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900">Offer {idx + 1}</h4>
                {offers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOffer(idx)}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Offer nickname</label>
                  <input
                    type="text"
                    value={offer.nickname}
                    onChange={e => updateOffer(idx, 'nickname', e.target.value)}
                    placeholder='e.g. "The Jones Family"'
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    style={{ '--tw-ring-color': PURPLE }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase price ($)</label>
                  <input
                    type="number"
                    value={offer.price}
                    onChange={e => updateOffer(idx, 'price', e.target.value)}
                    placeholder="e.g. 450000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Financing type</label>
                  <select
                    value={offer.financing}
                    onChange={e => updateOffer(idx, 'financing', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                  >
                    {FINANCING_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Down payment (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={offer.downPayment}
                    onChange={e => updateOffer(idx, 'downPayment', e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Option period (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={offer.optionDays}
                    onChange={e => updateOffer(idx, 'optionDays', e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Option fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={offer.optionFee}
                    onChange={e => updateOffer(idx, 'optionFee', e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Earnest money ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={offer.earnestMoney}
                    onChange={e => updateOffer(idx, 'earnestMoney', e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Closing date</label>
                  <input
                    type="date"
                    value={offer.closingDate}
                    onChange={e => updateOffer(idx, 'closingDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={offer.notes}
                    onChange={e => updateOffer(idx, 'notes', e.target.value)}
                    placeholder="e.g. Pre-approved, motivated buyer"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {offers.length < 3 && (
          <button
            type="button"
            onClick={addOffer}
            className="mb-8 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors w-full"
          >
            + Add another offer (up to 3)
          </button>
        )}

        {/* Compare button */}
        {showComparison && !showTable && (
          <button
            type="button"
            onClick={() => setShowTable(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            Compare offers →
          </button>
        )}

        {/* Comparison table */}
        {showComparison && showTable && (
          <div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 w-36">
                      Term
                    </th>
                    {filledOffers.map((o, i) => (
                      <th key={i} className="text-left px-4 py-3 bg-gray-50">
                        <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                          {o.nickname || `Offer ${i + 1}`}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {compareRows.map((row, ri) => {
                    const isScoreRow = row.label === 'Strength Score'
                    const raws = row.values.map(v => v.raw)
                    const validRaws = raws.filter(r => r !== Infinity && r !== 0 && !isNaN(r))
                    const bestRaw = validRaws.length > 0
                      ? (row.best === 'max' ? Math.max(...validRaws) : Math.min(...validRaws))
                      : null

                    return (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                          {row.label}
                        </td>
                        {row.values.map((v, ci) => {
                          const isWinner = bestRaw !== null && v.raw === bestRaw && v.raw !== 0 && v.raw !== Infinity
                          return (
                            <td
                              key={ci}
                              className="px-4 py-3 text-sm font-medium"
                              style={isWinner ? { backgroundColor: '#f0fdf4', color: '#15803d' } : { color: '#374151' }}
                            >
                              {isScoreRow && isWinner ? (
                                <span className="flex items-center gap-1.5 flex-wrap">
                                  <span>{v.display}</span>
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                                    style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                                  >
                                    ✓ Strongest
                                  </span>
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

            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-gray-400">
                This score is a guide — always consult with a real estate attorney or title company for final decisions.
              </p>
              <button
                type="button"
                onClick={() => setShowTable(false)}
                className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors flex-shrink-0"
              >
                Hide comparison
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mark complete */}
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
              <button
                type="button"
                onClick={() => onComplete(false)}
                className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
              >
                Undo
              </button>
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
  )
}
