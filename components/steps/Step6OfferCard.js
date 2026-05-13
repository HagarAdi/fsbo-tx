import { useState } from 'react'
import {
  ACCENT, OFFER_STATUS_OPTIONS, OFFER_STATUS_COLORS, FINANCING_OPTIONS,
  getScoreBand, fmtCurrency, fmtDate, inputCls, calcNetProceeds,
} from './Step6Offers.data'
import HelpTip from '../Tooltip'

function NetCheckPanel({ offer, annualTaxes, setAnnualTaxes }) {
  const r = calcNetProceeds(offer, annualTaxes)
  const price = parseFloat(offer?.price) || 0
  const taxNum = parseFloat(annualTaxes)
  const currentRatePct = annualTaxes && !isNaN(taxNum) && price > 0
    ? ((taxNum / price) * 100).toFixed(2).replace(/\.?0+$/, '')
    : '2.2'
  const [editingRate, setEditingRate] = useState(false)
  const [rateDraft, setRateDraft] = useState(currentRatePct)

  function startEditingRate() {
    setRateDraft(currentRatePct)
    setEditingRate(true)
  }

  function commitRate() {
    const pct = parseFloat(rateDraft)
    if (isNaN(pct) || pct < 0 || price <= 0) {
      setEditingRate(false)
      return
    }
    setAnnualTaxes(String(Math.round((pct * price) / 100)))
    setEditingRate(false)
  }

  function cancelRate() {
    setEditingRate(false)
  }

  if (!r) return null
  const isHighPara12 = r.sellerContrib > parseFloat(offer.price) * 0.02
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex">
        <div className="px-4 py-4 flex flex-col items-center justify-center min-w-[120px]" style={{ backgroundColor: '#f0fdf4' }}>
          <p className="text-xl font-bold leading-none" style={{ color: r.net >= 0 ? '#15803d' : '#dc2626' }}>
            {fmtCurrency(String(Math.round(r.net)))}
          </p>
          <p className="text-xs text-gray-400 mt-1">Est. net check</p>
        </div>
        <div className="flex-1 divide-y divide-gray-100">
          <div className="flex justify-between px-3 py-1.5 text-xs">
            <span className="text-gray-500">Gross Price</span>
            <span className="text-gray-800 font-bold tabular-nums">{fmtCurrency(offer.price)}</span>
          </div>
          <div className={`flex justify-between px-3 py-1.5 text-xs ${isHighPara12 ? 'bg-red-50' : ''}`}>
            <span className={isHighPara12 ? 'text-red-700 font-semibold' : 'text-gray-500'}>Para 12</span>
            <span className={`font-medium tabular-nums ${isHighPara12 ? 'text-red-600' : 'text-gray-700'}`}>
              {r.sellerContrib > 0 ? `−${fmtCurrency(String(Math.round(r.sellerContrib)))}` : '—'}
            </span>
          </div>
          <div className="flex justify-between px-3 py-1.5 text-xs">
            <span className="text-gray-500">Title Policy</span>
            <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(Math.round(r.titlePolicy)))}</span>
          </div>
          <div className="flex justify-between items-center px-3 py-1.5 text-xs">
            <span className="text-gray-500 flex items-center gap-1.5">
              Tax{!r.hasClosingDate ? ' (est.)' : ''}
              {editingRate ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rateDraft}
                    onChange={e => setRateDraft(e.target.value)}
                    onBlur={commitRate}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRate()
                      if (e.key === 'Escape') cancelRate()
                    }}
                    autoFocus
                    aria-label="Tax rate percentage"
                    className="w-14 px-1.5 py-0.5 rounded border border-gray-200 text-xs text-gray-700 tabular-nums focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <span className="text-gray-400">%</span>
                </span>
              ) : (
                <>
                  <span className="text-gray-400 tabular-nums">{currentRatePct}%</span>
                  <button
                    type="button"
                    onClick={startEditingRate}
                    aria-label="Edit tax rate"
                    title="Edit tax rate"
                    className="text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11.5 2.5l2 2-8 8-2.5.5.5-2.5 8-8z" />
                    </svg>
                  </button>
                </>
              )}
            </span>
            <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(Math.round(r.taxProration)))}</span>
          </div>
          <div className="flex justify-between px-3 py-1.5 text-xs">
            <span className="text-gray-500">Escrow &amp; Rec.</span>
            <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(r.escrow))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTitleCo() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step5?.titleCompany || null
  } catch { return null }
}

export default function Step6OfferCard({
  offer, isExpanded, score, flags, isHighestPrice,
  removeOffer, updateOffer, toggleExpanded,
  activeTooltip, setActiveTooltip, annualTaxes, setAnnualTaxes, onSelectStep,
}) {
  const band = getScoreBand(score)
  const netResult = offer.price ? calcNetProceeds(offer, annualTaxes) : null
  const missingForStep7 = offer.status === 'Accepted'
    ? [!offer.closingDate && 'closing date', !offer.optionDays && 'option days'].filter(Boolean)
    : []
  const titleCo = isExpanded ? getTitleCo() : null

  return (
    <div
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: isExpanded ? ACCENT : '#e5e7eb' }}
    >
      {/* Collapsed header — always visible */}
      <div className="px-5 py-4">

        {/* Row 1: nickname, badges, status dropdown, icon actions */}
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
            {offer.price && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: band.bg, color: band.text }}>
                {score} — {band.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <select
              value={offer.status}
              onChange={e => updateOffer(offer.id, 'status', e.target.value)}
              className="px-2 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
              style={{
                backgroundColor: OFFER_STATUS_COLORS[offer.status]?.bg || '#f3f4f6',
                color: OFFER_STATUS_COLORS[offer.status]?.text || '#6b7280',
                borderColor: OFFER_STATUS_COLORS[offer.status]?.bg || '#e5e7eb',
              }}
            >
              {OFFER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => removeOffer(offer.id)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Delete offer"
                title="Delete"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5h10M6.5 5V3.5a1 1 0 011-1h1a1 1 0 011 1V5M4.5 5l.7 8.1a1 1 0 001 .9h3.6a1 1 0 001-.9L11.5 5M6.8 7.5v4M9.2 7.5v4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => toggleExpanded(offer.id)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                title={isExpanded ? 'Hide details' : 'Show details'}
              >
                <svg
                  className="w-4 h-4 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: price · financing · ~net · flags · Step 7 warning */}
        <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600">
          {offer.price && (
            <span className="font-bold text-gray-900">{fmtCurrency(offer.price)}</span>
          )}
          {offer.financing && (
            <span>{offer.financing}{offer.downPayment ? ` · ${offer.downPayment}% down` : ''}</span>
          )}
          {netResult && (
            <span className="font-semibold text-xs" style={{ color: netResult.net >= 0 ? '#15803d' : '#dc2626' }}>
              ~{fmtCurrency(String(Math.round(netResult.net)))} net
            </span>
          )}
          {flags.length > 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer"
              style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
              onClick={() => toggleExpanded(offer.id)}
              title="Click to see flag details"
            >
              ⚠️ {flags.length} Flag{flags.length !== 1 ? 's' : ''}
            </span>
          )}
          {missingForStep7.length > 0 && (
            <span className="text-xs text-amber-600">
              ⚠️ Add {missingForStep7.join(' & ')} to unlock Step 7 auto-fill
            </span>
          )}
        </div>
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">

          {offer.price && (
            <NetCheckPanel offer={offer} annualTaxes={annualTaxes} setAnnualTaxes={setAnnualTaxes} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Offer nickname</label>
              <input type="text" value={offer.nickname} onChange={e => updateOffer(offer.id, 'nickname', e.target.value)} placeholder='e.g. "The Jones Family"' className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Purchase price ($)
                <HelpTip id={`${offer.id}-price`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  The total agreed sales price. Found in Paragraph 3C of the TREC contract.
                </HelpTip>
              </label>
              <input type="number" value={offer.price} onChange={e => updateOffer(offer.id, 'price', e.target.value)} placeholder="e.g. 450000" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Seller Contribution to Buyer (Para 12) ($)
                <HelpTip id={`${offer.id}-sellerContrib`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Check Paragraph 12A(1)(b) of the contract. This is the amount the buyer is asking you to pay toward their closing costs or agent fees.
                </HelpTip>
              </label>
              <input type="number" min="0" value={offer.sellerContribution} onChange={e => updateOffer(offer.id, 'sellerContribution', e.target.value)} placeholder="e.g. 5000" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Financing type
                <HelpTip id={`${offer.id}-financing`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Check Paragraph 4 or the Third Party Financing Addendum. (Cash is strongest).
                </HelpTip>
              </label>
              <select value={offer.financing} onChange={e => updateOffer(offer.id, 'financing', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                {FINANCING_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Down payment (%)
                <HelpTip id={`${offer.id}-downPayment`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  The cash portion of the sales price the buyer pays at closing. Found in Paragraph 3A.
                </HelpTip>
              </label>
              <input type="number" min="0" max="100" value={offer.downPayment} onChange={e => updateOffer(offer.id, 'downPayment', e.target.value)} placeholder="e.g. 20" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Option period (days)
                <HelpTip id={`${offer.id}-optionDays`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  The number of days for inspections and backing out. Found in Paragraph 5B.
                </HelpTip>
              </label>
              <input type="number" min="0" value={offer.optionDays} onChange={e => updateOffer(offer.id, 'optionDays', e.target.value)} placeholder="e.g. 7" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Option fee ($)
                <HelpTip id={`${offer.id}-optionFee`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  The non-refundable fee for the right to terminate. Found in Paragraph 5B.
                </HelpTip>
              </label>
              <input type="number" min="0" value={offer.optionFee} onChange={e => updateOffer(offer.id, 'optionFee', e.target.value)} placeholder="e.g. 250" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Earnest money ($)
                <HelpTip id={`${offer.id}-earnest`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  The &apos;good faith&apos; deposit, usually ~1%. Found in Paragraph 5A.
                </HelpTip>
              </label>
              <input type="number" min="0" value={offer.earnestMoney} onChange={e => updateOffer(offer.id, 'earnestMoney', e.target.value)} placeholder="e.g. 4500" className={inputCls} />
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Closing date
                <HelpTip id={`${offer.id}-closingDate`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  The date you officially get paid and hand over keys. Found in Paragraph 9A.
                </HelpTip>
              </label>
              <input type="date" value={offer.closingDate} onChange={e => updateOffer(offer.id, 'closingDate', e.target.value)} className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
              <input type="text" value={offer.notes} onChange={e => updateOffer(offer.id, 'notes', e.target.value)} placeholder="e.g. Pre-approved, motivated buyer" className={inputCls} />
            </div>
          </div>

          {/* Escrow Agent — Para 5C */}
          {titleCo?.name ? (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Escrow Agent · Para 5C</p>
              <p className="font-semibold text-gray-900">{titleCo.name}</p>
              {titleCo.escrow && <p className="text-gray-600 text-xs mt-0.5">{titleCo.escrow}</p>}
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                {titleCo.email && <span>{titleCo.email}</span>}
                {titleCo.phone && <span>{titleCo.phone}</span>}
              </div>
              <button
                type="button"
                onClick={() => onSelectStep?.(5)}
                className="mt-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ color: ACCENT }}
              >
                ← Edit in Step 5
              </button>
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-xl text-xs text-amber-700"
              style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
              ⚠️ No title company set — earnest money destination (Para 5C) is unknown.{' '}
              <button
                type="button"
                onClick={() => onSelectStep?.(5)}
                className="font-semibold underline hover:no-underline"
              >
                Add one in Step 5
              </button>
            </div>
          )}

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
}
