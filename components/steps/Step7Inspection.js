import { useState, useCallback } from 'react'
import TRECDrawer from '../TRECDrawer'
import {
  ACCENT, PURPLE, DRAWERS, SDN_ITEMS, SDN_TREC_INFO,
  INFO_NOTES, FINDINGS, REQUEST_TYPES, RESPONSE_TYPES, RESPONSE_STYLE,
  PRO_TIPS, VENDORS, makeEmptyRequest, loadStep7, saveStep7, getAcceptedOffer,
  getAcceptedOptionDays, getOptionPeriodStatus, inputCls,
} from './Step7Inspection.data'
import { calcNetProceeds, fmtCurrency, getOptionDays } from './Step6Offers.data'

export default function Step7Inspection({ onSelectStep }) {
  const [activeDrawer, setActiveDrawer] = useState(null)
  const [openFindings, setOpenFindings] = useState({})
  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [trecDrawer, setTrecDrawer] = useState({ isOpen: false, info: null })

  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window === 'undefined') return false
    return loadStep7().isLocked || false
  })

  const [optionPeriod, setOptionPeriod] = useState(() => {
    if (typeof window === 'undefined') return { startDate: '', endDate: '' }
    const saved = loadStep7().optionPeriod || {}
    const accepted = getAcceptedOffer()
    const todayStr = new Date().toISOString().slice(0, 10)

    let defaultStart = ''
    let defaultEnd = ''
    if (accepted) {
      defaultStart = accepted.optionStartDate || todayStr
      if (accepted.optionEndDate) {
        defaultEnd = accepted.optionEndDate
      } else {
        const days = getOptionDays(accepted)
        if (days && defaultStart) {
          const d = new Date(defaultStart + 'T00:00:00')
          d.setDate(d.getDate() + days)
          defaultEnd = d.toISOString().slice(0, 10)
        }
      }
    }

    return {
      startDate: accepted?.optionStartDate || saved.startDate || defaultStart,
      endDate:   accepted?.optionEndDate   || saved.endDate   || defaultEnd,
    }
  })

  const [repairRequests, setRepairRequests] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep7().repairRequests || []
  })

  const [bottomLine, setBottomLine] = useState(() => {
    if (typeof window === 'undefined') return { minPrice: '', maxCredit: '', dealBreakers: '' }
    const saved = loadStep7().bottomLine || {}
    return {
      minPrice: saved.minPrice ?? '',
      maxCredit: saved.maxCredit ?? '',
      dealBreakers: saved.dealBreakers ?? '',
    }
  })

  const [contractorNotes, setContractorNotes] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStep7().contractorNotes || ''
  })

  const [sdnChecked, setSdnChecked] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep7().sdnChecked || []
  })

  const acceptedOffer = typeof window !== 'undefined' ? getAcceptedOffer() : null

  const buildSavePayload = (overrides = {}) => ({
    optionPeriod,
    repairRequests,
    bottomLine,
    contractorNotes,
    sdnChecked,
    isLocked,
    ...overrides,
  })

  const setAndSaveOptionPeriod = (val) => {
    const next = typeof val === 'function' ? val(optionPeriod) : val
    setOptionPeriod(next)
    saveStep7(buildSavePayload({ optionPeriod: next }))
  }

  const setAndSaveRepairRequests = (val) => {
    const next = typeof val === 'function' ? val(repairRequests) : val
    setRepairRequests(next)
    saveStep7(buildSavePayload({ repairRequests: next }))
  }

  const setAndSaveBottomLine = (val) => {
    const next = typeof val === 'function' ? val(bottomLine) : val
    setBottomLine(next)
    saveStep7(buildSavePayload({ bottomLine: next }))
  }

  const setAndSaveContractorNotes = (val) => {
    setContractorNotes(val)
    saveStep7(buildSavePayload({ contractorNotes: val }))
  }

  const setAndSaveSdnChecked = (val) => {
    const next = typeof val === 'function' ? val(sdnChecked) : val
    setSdnChecked(next)
    saveStep7(buildSavePayload({ sdnChecked: next }))
  }

  const closeDrawer = useCallback(() => setActiveDrawer(null), [])

  const addRequest = () => {
    const fresh = makeEmptyRequest()
    setAndSaveRepairRequests(prev => [fresh, ...prev])
    setExpandedRequestId(fresh.id)
  }

  const removeRequest = (id) => {
    setAndSaveRepairRequests(prev => prev.filter(r => r.id !== id))
    if (expandedRequestId === id) setExpandedRequestId(null)
  }

  const updateRequest = (id, field, value) =>
    setAndSaveRepairRequests(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))

  const totalConcessions = repairRequests.reduce((sum, r) => {
    if (r.response === 'Decline') return sum
    const amt = r.response === 'Counter'
      ? parseFloat(r.counterAmount) || 0
      : parseFloat(r.requestedAmount) || 0
    return sum + amt
  }, 0)

  const maxCreditNum = parseFloat(bottomLine.maxCredit) || 0
  const overCeiling = maxCreditNum > 0 && totalConcessions > maxCreditNum

  const finalizeAmendments = () => {
    const netProceedsResult = acceptedOffer?.price
      ? calcNetProceeds(acceptedOffer, '', { repairConcessions: totalConcessions })
      : null
    const finalNet = netProceedsResult ? Math.round(netProceedsResult.net) : null
    setIsLocked(true)
    saveStep7(buildSavePayload({ isLocked: true, finalNetProceeds: finalNet }))
  }

  const unlockAmendments = () => {
    setIsLocked(false)
    saveStep7(buildSavePayload({ isLocked: false, finalNetProceeds: null }))
  }

  const { daysRemaining, hoursRemaining, pctElapsed, isExpired, isLastDayBeforeFive } = getOptionPeriodStatus(optionPeriod)

  const sidebarDaysColor = isExpired ? ACCENT
    : daysRemaining !== null && daysRemaining <= 5 ? '#ca8a04'
    : ACCENT

  const netProceedsResult = acceptedOffer?.price
    ? calcNetProceeds(acceptedOffer, '', { repairConcessions: totalConcessions })
    : null

  return (
    <>
    <div className="flex">

      {/* ── Main column ── */}
      <div className="flex-1 px-4 py-8 md:px-10 md:py-12 min-w-0">

        {/* Header */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: '#ede9fe', color: PURPLE }}>
            Close
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Option Period &amp; Inspection</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
          The option period is the most critical 5–10 days of your sale. Buyers will find things — every home has issues.
          The goal is to negotiate smartly, not panic.
        </p>

        {/* Locked Contract header */}
        {acceptedOffer && (
          <div className="rounded-xl px-5 py-4 mb-8 flex items-center gap-4 flex-wrap"
            style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
            <span className="text-xl">🔒</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-green-800">
                Under Contract — {acceptedOffer.nickname || 'Accepted Offer'}
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                {acceptedOffer.price ? `$${parseFloat(acceptedOffer.price).toLocaleString()} · ` : ''}
                {acceptedOffer.financing || ''}
                {acceptedOffer.closingDate
                  ? ` · Closing ${new Date(acceptedOffer.closingDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : ''}
              </p>
            </div>
            <button type="button" onClick={() => onSelectStep && onSelectStep(6)}
              className="text-xs font-semibold text-green-700 hover:text-green-900 transition-colors flex-shrink-0">
              ← View offer
            </button>
          </div>
        )}

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {DRAWERS.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDrawer(prev => prev === d.id ? null : d.id)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold text-left hover:bg-gray-50 transition-colors ${activeDrawer === d.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
            >
              <span className="text-xl mb-1 block">{d.emoji}</span>
              {d.label}
              <span className="block text-xs font-medium text-gray-400 mt-1">Open guide →</span>
            </button>
          ))}
        </div>

        {/* Option Period Block */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Option Period Tracker</h3>
          <p className="text-sm text-gray-500 mb-4">Know exactly how much time you have left to negotiate.</p>

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start date</label>
                <input
                  type="date"
                  value={optionPeriod.startDate}
                  onChange={e => {
                    const s = e.target.value
                    setAndSaveOptionPeriod(prev => {
                      let end = prev.endDate
                      if (!end && s) {
                        const d = new Date(s + 'T00:00:00')
                        d.setDate(d.getDate() + getAcceptedOptionDays())
                        end = d.toISOString().slice(0, 10)
                      }
                      return { startDate: s, endDate: end }
                    })
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End date</label>
                <input
                  type="date"
                  value={optionPeriod.endDate}
                  onChange={e => setAndSaveOptionPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {optionPeriod.startDate && optionPeriod.endDate && (
              <div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pctElapsed}%`,
                      backgroundColor: isExpired
                        ? (isLocked ? ACCENT : '#dc2626')
                        : isLastDayBeforeFive ? '#ca8a04'
                        : daysRemaining !== null && daysRemaining <= 2 ? '#ca8a04'
                        : ACCENT,
                    }}
                  />
                </div>
                {isExpired ? (
                  isLocked ? (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                      <span>✅ Option period complete — your buyer is committed. Time to close.</span>
                      <button
                        type="button"
                        onClick={() => onSelectStep && onSelectStep(8)}
                        className="ml-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: ACCENT }}
                      >
                        → Step 8
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-3 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                      ⛔ Option Period has expired. The buyer no longer has an unrestricted right to terminate.
                    </div>
                  )
                ) : isLastDayBeforeFive ? (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
                    <span>Option period ends TODAY at 5 PM</span>
                    <span>{hoursRemaining}h remaining</span>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: daysRemaining <= 2 ? '#fee2e2' : daysRemaining <= 5 ? '#fef9c3' : '#f0fdf4',
                      color: daysRemaining <= 2 ? '#dc2626' : daysRemaining <= 5 ? '#854d0e' : '#15803d',
                    }}
                  >
                    <span>
                      <span className="text-2xl font-bold mr-1">{daysRemaining}</span>
                      days remaining
                    </span>
                    {daysRemaining <= 5 && <span>⚠️ Finalize negotiations soon</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Repair & Credit Tracker */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Repair &amp; Credit Tracker</h3>
              <p className="text-sm text-gray-500">Log each buyer request and decide how to respond.</p>
            </div>
            {!isLocked && (
              <button
                type="button"
                onClick={addRequest}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90 touch-manipulation"
                style={{ backgroundColor: ACCENT }}
              >
                + Add Repair Request
              </button>
            )}
          </div>

          {isLocked ? (
            <div className="rounded-xl px-5 py-6 text-center"
              style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
              <p className="text-lg font-bold text-green-800 mb-1">🎉 Repair amendments finalized.</p>
              <p className="text-sm text-green-700 mb-4">Option Period Complete. Moving to Title &amp; Escrow.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectStep && onSelectStep(8)}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 touch-manipulation"
                  style={{ backgroundColor: ACCENT }}
                >
                  Move to the next step: Title &amp; Escrow →
                </button>
                <button
                  type="button"
                  onClick={unlockAmendments}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Unlock
                </button>
              </div>
            </div>
          ) : (
            <>
              {overCeiling && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-4"
                  style={{ backgroundColor: '#fef9c3', border: '1px solid #fcd34d', color: '#854d0e' }}>
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold">Ceiling Exceeded: </span>
                    Current concessions (${totalConcessions.toLocaleString()}) exceed your pre-set limit of ${parseFloat(bottomLine.maxCredit).toLocaleString()}. Consider reviewing your backup offers in Step 6 before agreeing to further terms.
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectStep && onSelectStep(6)}
                    className="text-xs font-semibold flex-shrink-0 underline transition-opacity hover:opacity-80"
                    style={{ color: '#854d0e' }}
                  >
                    ← Step 6
                  </button>
                </div>
              )}

              {repairRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3 mb-4">
                  <p className="text-sm text-gray-400">No repair requests logged yet.</p>
                  <button type="button" onClick={addRequest} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 touch-manipulation" style={{ backgroundColor: ACCENT }}>
                    + Add your first repair request
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {repairRequests.map(r => {
                    const isExpanded = expandedRequestId === r.id
                    const titleLabel = r.description?.trim() || 'New repair request'
                    const responseStyle = RESPONSE_STYLE[r.response] || RESPONSE_STYLE['Accept']
                    return (
                      <div key={r.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="px-5 py-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedRequestId(isExpanded ? null : r.id)}
                            className="flex-1 min-w-0 text-left rounded-md hover:bg-gray-50 -mx-1 px-1 py-1 transition-colors"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900">{titleLabel}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                {r.requestType}
                              </span>
                              {r.requestedAmount && (
                                <span className="text-xs text-gray-500">
                                  ${parseFloat(r.requestedAmount).toLocaleString()} requested
                                </span>
                              )}
                            </div>
                          </button>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: responseStyle.bg, color: responseStyle.text }}>
                              {r.response}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRequest(r.id)}
                              className="p-2.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
                              aria-label="Delete repair request"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 5h10M6.5 5V3.5a1 1 0 011-1h1a1 1 0 011 1V5M4.5 5l.7 8.1a1 1 0 001 .9h3.6a1 1 0 001-.9L11.5 5M6.8 7.5v4M9.2 7.5v4" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedRequestId(isExpanded ? null : r.id)}
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

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-4 border-t border-gray-100 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={r.description}
                                onChange={e => updateRequest(r.id, 'description', e.target.value)}
                                placeholder="e.g. HVAC not cooling"
                                className={inputCls}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Request type</label>
                                <select
                                  value={r.requestType}
                                  onChange={e => updateRequest(r.id, 'requestType', e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                >
                                  {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="w-full sm:w-40">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={r.requestedAmount}
                                  onChange={e => updateRequest(r.id, 'requestedAmount', e.target.value)}
                                  placeholder="0"
                                  className={inputCls}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Your response</label>
                              <div className="flex items-center gap-2 flex-wrap">
                                {RESPONSE_TYPES.map(rt => (
                                  <button
                                    key={rt}
                                    type="button"
                                    onClick={() => updateRequest(r.id, 'response', rt)}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                                    style={r.response === rt
                                      ? { backgroundColor: RESPONSE_STYLE[rt].bg, color: RESPONSE_STYLE[rt].text }
                                      : { backgroundColor: '#f9fafb', color: '#6b7280' }
                                    }
                                  >
                                    {rt}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {r.response === 'Counter' && (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="w-full sm:w-40">
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Counter amount ($)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={r.counterAmount}
                                    onChange={e => updateRequest(r.id, 'counterAmount', e.target.value)}
                                    placeholder="e.g. 1000"
                                    className={inputCls}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                                  <input
                                    type="text"
                                    value={r.notes}
                                    onChange={e => updateRequest(r.id, 'notes', e.target.value)}
                                    placeholder="e.g. Will get 3 quotes first"
                                    className={inputCls}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {repairRequests.length > 0 && (
                <>
                  <div
                    className="flex items-center justify-between px-5 py-3 rounded-xl text-sm font-semibold mb-3"
                    style={{ backgroundColor: overCeiling ? '#fef9c3' : '#f0fdf4', color: overCeiling ? '#854d0e' : ACCENT }}
                  >
                    <span>Total Concessions</span>
                    <span>${totalConcessions.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={finalizeAmendments}
                    className="w-full px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 touch-manipulation"
                    style={{ backgroundColor: ACCENT }}
                  >
                    ✅ Finalize Repair Amendments
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Updated Net Proceeds */}
        {netProceedsResult && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Updated Net Proceeds</h3>
            <p className="text-sm text-gray-500 mb-4">Repair concessions deducted from your estimated proceeds in real-time.</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex">
                <div className="px-4 py-4 flex flex-col items-center justify-center min-w-[120px]"
                  style={{ backgroundColor: '#f0fdf4' }}>
                  <p className="text-xl font-bold leading-none"
                    style={{ color: netProceedsResult.net >= 0 ? '#15803d' : '#dc2626' }}>
                    {fmtCurrency(String(Math.round(netProceedsResult.net)))}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Est. net proceeds</p>
                </div>
                <div className="flex-1 divide-y divide-gray-100">
                  <div className="flex justify-between px-3 py-1.5 text-xs">
                    <span className="text-gray-500">Gross Price</span>
                    <span className="text-gray-800 font-bold tabular-nums">{fmtCurrency(acceptedOffer.price)}</span>
                  </div>
                  {netProceedsResult.sellerContrib > 0 && (
                    <div className="flex justify-between px-3 py-1.5 text-xs">
                      <span className="text-gray-500">Para 12</span>
                      <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(Math.round(netProceedsResult.sellerContrib)))}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-3 py-1.5 text-xs">
                    <span className="text-gray-500">Title Policy</span>
                    <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(Math.round(netProceedsResult.titlePolicy)))}</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 text-xs">
                    <span className="text-gray-500">Tax{!netProceedsResult.hasClosingDate ? ' (est.)' : ''}</span>
                    <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(Math.round(netProceedsResult.taxProration)))}</span>
                  </div>
                  <div className="flex justify-between px-3 py-1.5 text-xs">
                    <span className="text-gray-500">Escrow &amp; Rec.</span>
                    <span className="text-gray-700 font-medium tabular-nums">−{fmtCurrency(String(netProceedsResult.escrow))}</span>
                  </div>
                  {netProceedsResult.repairConcessions > 0 && (
                    <div className="flex justify-between px-3 py-1.5 text-xs bg-amber-50">
                      <span className="text-amber-700 font-semibold">Repair Concessions</span>
                      <span className="text-amber-700 font-medium tabular-nums">−{fmtCurrency(String(Math.round(netProceedsResult.repairConcessions)))}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onSelectStep && onSelectStep(8)}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 touch-manipulation flex items-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            Move to the next step: Title &amp; Escrow →
          </button>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <aside className="hidden lg:block w-56 shrink-0 pt-8 pr-6">
        <div className="sticky top-8 space-y-5">

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Days Remaining</p>
            {optionPeriod.startDate && optionPeriod.endDate ? (
              isExpired ? (
                <div style={{ color: ACCENT }}>
                  <span className="text-3xl">✅</span>
                  <p className="text-xs text-gray-500 mt-1">Option expired</p>
                </div>
              ) : isLastDayBeforeFive ? (
                <div>
                  <span className="text-2xl font-bold" style={{ color: '#ca8a04' }}>Today</span>
                  <p className="text-xs text-gray-500 mt-1">{hoursRemaining}h left · 5 PM</p>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-bold" style={{ color: sidebarDaysColor }}>{daysRemaining}</span>
                  <span className="text-sm text-gray-500 ml-1">days</span>
                </div>
              )
            ) : (
              <span className="text-2xl font-bold text-gray-200">—</span>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Live Stats</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Requests</span>
                <span className="font-semibold text-gray-900">{repairRequests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concessions</span>
                <span className={`font-semibold ${overCeiling ? 'text-amber-600' : 'text-gray-900'}`}>
                  ${totalConcessions.toLocaleString()}
                </span>
              </div>
              {netProceedsResult && (
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span className="text-gray-600">Est. Net</span>
                  <span className="font-semibold" style={{ color: '#15803d' }}>
                    {fmtCurrency(String(Math.round(netProceedsResult.net)))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Numbers</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Min price</span>
                <p className="font-semibold text-gray-900">
                  {bottomLine.minPrice ? `$${parseFloat(bottomLine.minPrice).toLocaleString()}` : '—'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Max credit</span>
                <p className={`font-semibold ${overCeiling ? 'text-amber-600' : 'text-gray-900'}`}>
                  {bottomLine.maxCredit ? `$${parseFloat(bottomLine.maxCredit).toLocaleString()}` : '—'}
                </p>
              </div>
              {bottomLine.dealBreakers && (
                <div>
                  <span className="text-gray-500 text-xs">Deal breakers</span>
                  <p className="text-gray-700 text-xs mt-0.5">{bottomLine.dealBreakers}</p>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setActiveDrawer('math')}
              className="mt-3 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ color: ACCENT }}>
              Edit →
            </button>
          </div>

        </div>
      </aside>
    </div>

    {/* ── Drawers ── */}
    {activeDrawer && (
      <>
        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeDrawer} />
        <div
          className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl overflow-y-auto"
          style={{ width: 'min(460px, calc(100vw - 40px))' }}
        >
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {DRAWERS.find(d => d.id === activeDrawer)?.emoji}{' '}
                {DRAWERS.find(d => d.id === activeDrawer)?.label}
              </h3>
              <button type="button" onClick={closeDrawer}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-2xl leading-none touch-manipulation">
                ×
              </button>
            </div>

            {/* ── TREC Disclosure ── */}
            {activeDrawer === 'disclosure' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  {[
                    "The SDN must disclose everything you KNOW about your home's condition — roof leaks, foundation repairs, flooding history, HOA disputes.",
                    "Non-disclosure = legal liability. When in doubt, disclose.",
                    "Buyers can't sue you for something you disclosed — they CAN sue for things you hid.",
                  ].map((note, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                      style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}>
                      <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">SDN Checklist</p>
                    <button
                      type="button"
                      onClick={() => setTrecDrawer({ isOpen: true, info: SDN_TREC_INFO })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ backgroundColor: '#ede9fe', color: PURPLE }}
                    >
                      ⚖️ TREC
                    </button>
                  </div>
                  <div className="space-y-3">
                    {SDN_ITEMS.map((item, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sdnChecked.includes(i)}
                          onChange={() => setAndSaveSdnChecked(prev =>
                            prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                          )}
                          className="h-4 w-4 rounded border-gray-300 flex-shrink-0 mt-0.5"
                          style={{ accentColor: ACCENT }}
                        />
                        <span className={`text-sm ${sdnChecked.includes(i) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <a
                  href="https://trec.texas.gov/sites/default/files/pdf-forms/OP-H.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: PURPLE }}
                >
                  Download TREC SDN form (OP-H) →
                </a>
              </div>
            )}

            {/* ── Inspection Prep ── */}
            {activeDrawer === 'prep' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Day 1–2 Prep Checklist</p>
                  <div className="space-y-2">
                    {[
                      'Unlock all doors, attic hatches, and electrical panels',
                      'Clear access to HVAC, water heater, and crawl spaces',
                      'Leave all utilities on (gas, water, electricity)',
                      'Have service records ready (HVAC, roof, foundation)',
                      'Plan to be out for 3–4 hours',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-600 flex-shrink-0">✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Common Findings in Texas Homes</p>
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
                    {FINDINGS.map((item, i) => (
                      <div key={i}>
                        <button
                          type="button"
                          onClick={() => setOpenFindings(prev => ({ ...prev, [i]: !prev[i] }))}
                          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
                            style={{ transform: openFindings[i] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            viewBox="0 0 20 20" fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {openFindings[i] && (
                          <div className="px-5 pb-3">
                            <p className="text-sm text-gray-700">{item.detail}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contractor Notes</label>
                  <textarea
                    value={contractorNotes}
                    onChange={e => setAndSaveContractorNotes(e.target.value)}
                    rows={4}
                    placeholder="e.g. Foundation — Got quote from ABC Structural: $4,200 vs buyer's requested $8,000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div className="space-y-2">
                  {INFO_NOTES.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                      style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}>
                      <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {VENDORS.map(({ label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors">
                      {label}
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 9.5l7-7M9.5 2.5H4M9.5 2.5v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Negotiation Math ── */}
            {activeDrawer === 'math' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Know your numbers before you negotiate</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum acceptable price ($)</label>
                      <p className="text-xs text-gray-400 mb-1">The lowest you&apos;ll go after all concessions</p>
                      <input type="number" min="0" value={bottomLine.minPrice}
                        onChange={e => setAndSaveBottomLine(prev => ({ ...prev, minPrice: e.target.value }))}
                        placeholder="e.g. 440000" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Max repair credit ceiling ($)</label>
                      <p className="text-xs text-gray-400 mb-1">Your ceiling for total concessions</p>
                      <input type="number" min="0" value={bottomLine.maxCredit}
                        onChange={e => setAndSaveBottomLine(prev => ({ ...prev, maxCredit: e.target.value }))}
                        placeholder="e.g. 5000" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Deal breakers</label>
                      <input type="text" value={bottomLine.dealBreakers}
                        onChange={e => setAndSaveBottomLine(prev => ({ ...prev, dealBreakers: e.target.value }))}
                        placeholder="e.g. Buyer demands full foundation repair" className={inputCls} />
                    </div>
                  </div>
                </div>

                {overCeiling && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: '#fef9c3', color: '#713f12' }}>
                    <span className="flex-shrink-0 font-bold mt-0.5">⚠️</span>
                    <span>
                      Total concessions (${totalConcessions.toLocaleString()}) exceed your ceiling
                      (${parseFloat(bottomLine.maxCredit).toLocaleString()}). Review your responses.
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Pro Tips</p>
                  <div className="space-y-3">
                    {PRO_TIPS.map(({ tip, source }) => (
                      <div key={source} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">&ldquo;{tip}&rdquo;</p>
                        <p className="text-xs text-gray-400">{source}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
                  style={{ backgroundColor: '#fefce8', color: '#713f12' }}>
                  <span className="text-lg flex-shrink-0">💡</span>
                  <p>A closing credit keeps you in control of cost — you don&apos;t manage contractors or worry about quality.</p>
                </div>
              </div>
            )}

            {/* ── Termination Rules ── */}
            {activeDrawer === 'rules' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  {[
                    { title: 'How buyer terminates', body: 'The buyer must deliver written notice to you before the option period expires. Verbal communication is not binding — everything must be in writing.' },
                    { title: 'Option fee', body: "The option fee is always yours — the buyer cannot recover it under any circumstances, even if they terminate on Day 1." },
                    { title: 'Earnest money during option period', body: "If the buyer walks during the option period, earnest money is returned to them. You keep only the option fee." },
                    { title: 'After option period expires', body: "Once the option period ends, the buyer's earnest money is now at risk. They can no longer walk away for free — backing out now may forfeit their earnest money deposit." },
                    { title: 'Appraisal contingency', body: "Separate from the option period. If the home appraises below purchase price, the buyer may renegotiate or walk per their lender's requirements — this is a different protection than the option period." },
                    { title: 'Financing contingency', body: "If the buyer's financing falls through, earnest money may be returned depending on contract terms. Check your specific contract language." },
                  ].map(({ title, body }) => (
                    <div key={title} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                      <p className="text-sm text-gray-700">{body}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
                  style={{ backgroundColor: '#fef9c3', color: '#713f12' }}>
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p>
                    <span className="font-semibold">Never agree verbally to extend the option period.</span>{' '}
                    All amendments must be in writing using the TREC Amendment form. Your title company can prepare this.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </>
    )}

    {/* TRECDrawer */}
    <TRECDrawer
      isOpen={trecDrawer.isOpen}
      onClose={() => setTrecDrawer({ isOpen: false, info: null })}
      termName={trecDrawer.info?.termName}
      whatItSays={trecDrawer.info?.whatItSays}
      whatItMeans={trecDrawer.info?.whatItMeans}
      moneyTrail={trecDrawer.info?.moneyTrail}
      txSellerTip={trecDrawer.info?.txSellerTip}
    />
    </>
  )
}
