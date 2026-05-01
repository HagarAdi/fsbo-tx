import { useState, useEffect, useCallback } from 'react'
import TRECDrawer from '../TRECDrawer'
import {
  ACCENT, PURPLE, DRAWERS, SDN_ITEMS, SDN_TREC_INFO, PHASE_RANGES,
  TIMELINE, INFO_NOTES, FINDINGS, REQUEST_TYPES, RESPONSE_TYPES, RESPONSE_STYLE,
  PRO_TIPS, VENDORS, makeEmptyRequest, loadStep7, saveStep7, getAcceptedOptionDays, inputCls,
} from './Step7Inspection.data'

export default function Step7Inspection({ onComplete, isCompleted, onSelectStep }) {
  const [activeDrawer, setActiveDrawer] = useState(null)
  const [openFindings, setOpenFindings] = useState({})
  const [form, setForm] = useState(makeEmptyRequest())
  const [trecDrawer, setTrecDrawer] = useState({ isOpen: false, info: null })

  const [optionPeriod, setOptionPeriod] = useState(() => {
    if (typeof window === 'undefined') return { startDate: '', endDate: '' }
    const saved = loadStep7().optionPeriod || {}
    return { startDate: saved.startDate || '', endDate: saved.endDate || '' }
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

  useEffect(() => {
    saveStep7({ optionPeriod, repairRequests, bottomLine, contractorNotes, sdnChecked })
  }, [optionPeriod, repairRequests, bottomLine, contractorNotes, sdnChecked])

  const closeDrawer = useCallback(() => setActiveDrawer(null), [])

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addRequest = () => {
    if (!form.description.trim()) return
    setRepairRequests(prev => [...prev, { ...form, id: Date.now() + Math.random() }])
    setForm(makeEmptyRequest())
  }

  const removeRequest = (id) => setRepairRequests(prev => prev.filter(r => r.id !== id))

  const updateRequest = (id, field, value) =>
    setRepairRequests(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))

  const totalConcessions = repairRequests.reduce((sum, r) => {
    if (r.response === 'Decline') return sum
    const amt = r.response === 'Counter'
      ? parseFloat(r.counterAmount) || 0
      : parseFloat(r.requestedAmount) || 0
    return sum + amt
  }, 0)

  const maxCreditNum = parseFloat(bottomLine.maxCredit) || 0
  const overCeiling = maxCreditNum > 0 && totalConcessions > maxCreditNum

  // Progress bar derived values
  const { startDate, endDate } = optionPeriod
  let daysRemaining = null
  let pctElapsed = 0
  let activePhaseIdx = -1
  let isExpired = false

  if (startDate && endDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate + 'T00:00:00')
    const end   = new Date(endDate   + 'T00:00:00')
    const totalDays = Math.round((end - start) / 86400000)
    const elapsed   = Math.round((today - start) / 86400000)
    daysRemaining   = Math.round((end - today)   / 86400000)
    isExpired       = daysRemaining <= 0
    pctElapsed      = totalDays > 0 ? Math.min(100, Math.max(0, (elapsed / totalDays) * 100)) : 0
    if (!isExpired) {
      activePhaseIdx = PHASE_RANGES.findIndex(
        p => elapsed >= p.startDay && (p.endDay === null || elapsed < p.endDay)
      )
      if (activePhaseIdx === -1) activePhaseIdx = PHASE_RANGES.length - 1
    }
  }

  const sidebarDaysColor = isExpired ? ACCENT
    : daysRemaining !== null && daysRemaining <= 1 ? '#dc2626'
    : daysRemaining !== null && daysRemaining <= 5 ? '#ca8a04'
    : ACCENT

  return (
    <>
    <div className="flex max-w-4xl">

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
                  value={startDate}
                  onChange={e => {
                    const s = e.target.value
                    setOptionPeriod(prev => {
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
                  value={endDate}
                  onChange={e => setOptionPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {startDate && endDate && (
              <div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pctElapsed}%`,
                      backgroundColor: isExpired ? '#dc2626' : daysRemaining <= 2 ? '#ca8a04' : ACCENT,
                    }}
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {PHASE_RANGES.map((p, i) => (
                    <span
                      key={p.label}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={
                        isExpired
                          ? { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                          : i === activePhaseIdx
                          ? { backgroundColor: '#dcfce7', color: '#15803d' }
                          : i < activePhaseIdx
                          ? { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                          : { backgroundColor: '#f9fafb', color: '#6b7280' }
                      }
                    >
                      {p.label}
                    </span>
                  ))}
                  {isExpired && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                      Expired
                    </span>
                  )}
                </div>
                {isExpired ? (
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
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: daysRemaining <= 1 ? '#fee2e2' : daysRemaining <= 5 ? '#fef9c3' : '#f0fdf4',
                      color: daysRemaining <= 1 ? '#dc2626' : daysRemaining <= 5 ? '#854d0e' : '#15803d',
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">Repair &amp; Credit Tracker</h3>
          <p className="text-sm text-gray-500 mb-4">Log each buyer request and decide how to respond.</p>

          {/* Add form */}
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={form.description}
                onChange={e => handleFormChange('description', e.target.value)}
                placeholder="Item description (e.g. HVAC not cooling)"
                className={inputCls + ' flex-1'}
              />
              <select
                value={form.requestType}
                onChange={e => handleFormChange('requestType', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <input
                type="number"
                min="0"
                value={form.requestedAmount}
                onChange={e => handleFormChange('requestedAmount', e.target.value)}
                placeholder="Amount ($)"
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition w-32"
              />
              <button
                type="button"
                onClick={addRequest}
                disabled={!form.description.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ backgroundColor: ACCENT }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Request list */}
          {repairRequests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No repair requests logged yet — add one above.</p>
          ) : (
            <div className="space-y-3 mb-4">
              {repairRequests.map(r => {
                const style = RESPONSE_STYLE[r.response] || RESPONSE_STYLE.Accept
                return (
                  <div key={r.id} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-sm font-semibold text-gray-900">{r.description}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                            {r.requestType}
                          </span>
                          {r.requestedAmount && (
                            <span className="text-xs text-gray-500">
                              ${parseFloat(r.requestedAmount).toLocaleString()} requested
                            </span>
                          )}
                        </div>
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
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: style.bg, color: style.text }}>
                            {r.response}
                          </span>
                        </div>
                        {r.response === 'Counter' && (
                          <div className="flex gap-3 mt-3">
                            <div className="w-36">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Counter amount ($)</label>
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
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
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
                      <button
                        type="button"
                        onClick={() => removeRequest(r.id)}
                        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                        aria-label="Remove"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6 2a1 1 0 00-1 1H3a1 1 0 000 2h10a1 1 0 100-2h-2a1 1 0 00-1-1H6zM4 7a1 1 0 011 1v4a1 1 0 002 0V8a1 1 0 012 0v4a1 1 0 002 0V8a1 1 0 011-1 1 1 0 100-2H4a1 1 0 100 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {repairRequests.length > 0 && (
            <div
              className="flex items-center justify-between px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: overCeiling ? '#fef9c3' : '#f0fdf4', color: overCeiling ? '#854d0e' : ACCENT }}
            >
              <span>Total Concessions</span>
              <span>
                ${totalConcessions.toLocaleString()}
                {overCeiling && <span className="ml-2 text-xs font-normal">⚠️ Over your ceiling</span>}
              </span>
            </div>
          )}
        </div>

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
                <button type="button" onClick={() => onComplete(false)}
                  className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors">
                  Undo
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectStep && onSelectStep(8)}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: ACCENT }}
              >
                Next up: Title &amp; Escrow →
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

      {/* ── Right Sidebar ── */}
      <aside className="hidden lg:block w-56 shrink-0 pt-8 pr-6">
        <div className="sticky top-8 space-y-5">

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Days Remaining</p>
            {startDate && endDate ? (
              isExpired ? (
                <div style={{ color: ACCENT }}>
                  <span className="text-3xl">✅</span>
                  <p className="text-xs text-gray-500 mt-1">Option expired</p>
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
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none">
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
                          onChange={() => setSdnChecked(prev =>
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
                    onChange={e => setContractorNotes(e.target.value)}
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
                      <p className="text-xs text-gray-400 mb-1">The lowest you'll go after all concessions</p>
                      <input type="number" min="0" value={bottomLine.minPrice}
                        onChange={e => setBottomLine(prev => ({ ...prev, minPrice: e.target.value }))}
                        placeholder="e.g. 440000" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Max repair credit ceiling ($)</label>
                      <p className="text-xs text-gray-400 mb-1">Your ceiling for total concessions</p>
                      <input type="number" min="0" value={bottomLine.maxCredit}
                        onChange={e => setBottomLine(prev => ({ ...prev, maxCredit: e.target.value }))}
                        placeholder="e.g. 5000" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Deal breakers</label>
                      <input type="text" value={bottomLine.dealBreakers}
                        onChange={e => setBottomLine(prev => ({ ...prev, dealBreakers: e.target.value }))}
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

                <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
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
