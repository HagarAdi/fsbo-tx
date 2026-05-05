import {
  ACCENT, OFFER_STATUS_OPTIONS, OFFER_STATUS_COLORS, FINANCING_OPTIONS,
  getScoreBand, fmtCurrency, fmtDate, inputCls,
} from './Step6Offers.data'

function TooltipIcon({ id, activeTooltip, setActiveTooltip }) {
  return (
    <button
      type="button"
      onMouseEnter={() => setActiveTooltip(id)}
      onMouseLeave={() => setActiveTooltip(cur => cur === id ? null : cur)}
      onPointerDown={e => {
        if (e.pointerType === 'touch') { e.preventDefault(); setActiveTooltip(cur => cur === id ? null : id) }
      }}
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold text-gray-400 border border-gray-300 hover:text-gray-600 hover:border-gray-400 transition-colors ml-1.5 flex-shrink-0 leading-none"
      aria-label="Show tip"
    >?</button>
  )
}

function Tooltip({ children }) {
  return <p className="mt-1 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded px-3 py-2">{children}</p>
}

export default function Step6OfferCard({
  offer, isExpanded, score, flags, breakdown, isHighestPrice,
  confirmDelete, setConfirmDelete, removeOffer, updateOffer, toggleExpanded,
  activeTooltip, setActiveTooltip,
}) {
  return (
    <div
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

        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600 mb-3">
          {offer.price && (
            <span className="text-base font-bold text-gray-900">{fmtCurrency(offer.price)}</span>
          )}
          {offer.financing && (
            <span>{offer.financing}{offer.downPayment ? ` · ${offer.downPayment}% down` : ''}</span>
          )}
          {offer.closingDate && <span>Closing {fmtDate(offer.closingDate)}</span>}
        </div>

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
                onClick={() => toggleExpanded(offer.id)}
                title="Click to see flag details"
              >
                ⚠️ {flags.length} Flag{flags.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {confirmDelete === offer.id ? (
            <span className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Remove this offer?</span>
              <button type="button" onClick={() => removeOffer(offer.id)} className="text-red-500 font-semibold hover:text-red-700 transition-colors">Yes</button>
              <button type="button" onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(offer.id)}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          )}
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
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Seller Contribution to Buyer (Para 12) ($)
                <TooltipIcon id={`${offer.id}-sellerContrib`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
              </label>
              {activeTooltip === `${offer.id}-sellerContrib` && (
                <Tooltip>Check Paragraph 12A(1)(b) of the contract. This is the amount the buyer is asking you to pay toward their closing costs or agent fees.</Tooltip>
              )}
              <input type="number" min="0" value={offer.sellerContribution} onChange={e => updateOffer(offer.id, 'sellerContribution', e.target.value)} placeholder="e.g. 5000" className={inputCls} />
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
              <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                Earnest money ($)
                <TooltipIcon id={`${offer.id}-earnest`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
              </label>
              {activeTooltip === `${offer.id}-earnest` && (
                <Tooltip>Found in Paragraph 5. Usually 1% of the purchase price.</Tooltip>
              )}
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
