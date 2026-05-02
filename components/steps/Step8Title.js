import { useState, useEffect } from 'react'
import {
  ACCENT, PURPLE, DRAWERS,
  TITLE_COMPANIES, TITLE_TIMELINE, PAYOFF_CARDS, SURVEY_OPTIONS,
  PRO_TIPS_CLOSE, VENDORS_CLOSE, WIRE_FRAUD_SOURCE,
  UTILITIES, CLOSING_DAY_ITEMS, DOCUMENTS,
  NET_PROCEEDS_FIELDS, CLOSING_DATE_FIELDS,
  loadStep8, saveStep8, daysUntilDate, initNetProceeds, initClosingDates, inputCls,
} from './Step8Title.data'

export default function Step8Title({ onComplete, isCompleted, onSelectStep }) {
  const [activeDrawer, setActiveDrawer]   = useState(null)
  const [timelineOpen, setTimelineOpen]   = useState(false)

  const [titleOpened, setTitleOpened]     = useState(() => typeof window === 'undefined' ? false : (loadStep8().titleOpened || false))
  const [hasHOA, setHasHOA]               = useState(() => { if (typeof window === 'undefined') return null; const s = loadStep8().hasHOA; return s === undefined ? null : s })
  const [hoaClearanceRequested, setHoaClearanceRequested] = useState(() => typeof window === 'undefined' ? false : (loadStep8().hoaClearanceRequested || false))
  const [payoffRequested, setPayoffRequested]             = useState(() => typeof window === 'undefined' ? false : (loadStep8().payoffRequested || false))
  const [surveyStatus, setSurveyStatus]   = useState(() => typeof window === 'undefined' ? '' : (loadStep8().surveyStatus || ''))
  const [surveyConfirmed, setSurveyConfirmed] = useState(() => typeof window === 'undefined' ? false : (loadStep8().surveyConfirmed || false))
  const [netProceeds, setNetProceeds]     = useState(initNetProceeds)
  const [wireFraudAcknowledged, setWireFraudAcknowledged] = useState(() => typeof window === 'undefined' ? false : (loadStep8().wireFraudAcknowledged || false))
  const [documentsChecked, setDocumentsChecked] = useState(() => typeof window === 'undefined' ? [] : (loadStep8().documentsChecked || []))
  const [closingDates, setClosingDates]   = useState(initClosingDates)
  const [utilitiesChecked, setUtilitiesChecked] = useState(() => typeof window === 'undefined' ? [] : (loadStep8().utilitiesChecked || []))
  const [closingDayChecked, setClosingDayChecked] = useState([])

  useEffect(() => {
    saveStep8({ titleOpened, hasHOA, hoaClearanceRequested, payoffRequested, surveyStatus, surveyConfirmed, closingDates, documentsChecked, wireFraudAcknowledged, netProceeds, utilitiesChecked })
  }, [titleOpened, hasHOA, hoaClearanceRequested, payoffRequested, surveyStatus, surveyConfirmed, closingDates, documentsChecked, wireFraudAcknowledged, netProceeds, utilitiesChecked])

  const sp    = parseFloat(netProceeds.salePrice)      || 0
  const mp    = parseFloat(netProceeds.mortgagePayoff)  || 0
  const tf    = parseFloat(netProceeds.titleFees)       || 0
  const pt    = parseFloat(netProceeds.propertyTaxes)   || 0
  const hf    = parseFloat(netProceeds.hoaFees)         || 0
  const rc    = parseFloat(netProceeds.repairCredits)   || 0
  const baPct = parseFloat(netProceeds.buyerAgentPct)   || 0
  const ba    = sp > 0 && baPct > 0 ? sp * baPct / 100 : 0
  const ms    = parseFloat(netProceeds.misc)            || 0
  const estimatedNet     = sp - mp - tf - pt - hf - rc - ba - ms
  const listingAgentCost = sp * 0.03
  const withAgentNet     = estimatedNet - listingAgentCost

  const daysToClose = daysUntilDate(closingDates.closingDate)

  const milestones = [
    { label: 'Title opened',           done: titleOpened },
    { label: 'Survey confirmed',       done: surveyConfirmed },
    { label: 'Wire fraud acknowledged',done: wireFraudAcknowledged },
    { label: `Docs ready (${documentsChecked.length}/${DOCUMENTS.length})`, done: documentsChecked.length === DOCUMENTS.length },
  ]

  function toggleDoc(id) {
    setDocumentsChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleUtil(id) {
    setUtilitiesChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleClosingDay(id) {
    setClosingDayChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleDrawer(id) {
    setActiveDrawer(prev => prev === id ? null : id)
  }

  return (
    <div className="relative flex gap-6 px-4 py-8 md:px-10 md:py-12 max-w-4xl">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: '#ede9fe', color: PURPLE }}>Close</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Title &amp; Escrow</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
          In Texas, the title company handles everything legal. Your job is to open title immediately, stay organized, and respond quickly.
        </p>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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

        {/* Setup Block */}
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-8 space-y-5">

          {/* Title opened */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="checkbox" checked={titleOpened} onChange={e => setTitleOpened(e.target.checked)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
              <span className={`text-sm font-medium ${titleOpened ? 'line-through text-gray-400' : 'text-gray-800'}`}>Title company contacted / escrow opened</span>
            </label>
            <div className="flex flex-wrap gap-3 pl-7">
              {TITLE_COMPANIES.map(co => (
                <a key={co.name} href={co.url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">🏢 {co.name}</a>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* HOA */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-700 w-10">HOA:</span>
              {[{ label: 'No HOA', val: false }, { label: 'Yes — HOA', val: true }, { label: 'Not sure', val: null }].map(({ label, val }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setHasHOA(val)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={hasHOA === val
                    ? { backgroundColor: PURPLE, color: '#fff', borderColor: PURPLE }
                    : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
                >
                  {label}
                </button>
              ))}
            </div>
            {hasHOA === true && (
              <label className="flex items-center gap-3 pl-14 cursor-pointer">
                <input type="checkbox" checked={hoaClearanceRequested} onChange={e => setHoaClearanceRequested(e.target.checked)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
                <span className={`text-sm ${hoaClearanceRequested ? 'line-through text-gray-400' : 'text-gray-700'}`}>HOA clearance letter requested</span>
              </label>
            )}
            {hasHOA === false && (
              <p className="pl-14 text-xs text-green-600 font-medium">✓ No HOA — one less thing to worry about</p>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Payoff */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={payoffRequested} onChange={e => setPayoffRequested(e.target.checked)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
            <span className={`text-sm font-medium ${payoffRequested ? 'line-through text-gray-400' : 'text-gray-800'}`}>Payoff statement requested from lender</span>
          </label>

          <div className="border-t border-gray-100" />

          {/* Survey */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-700 w-10">Survey:</span>
              {SURVEY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSurveyStatus(opt)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={surveyStatus === opt
                    ? { backgroundColor: PURPLE, color: '#fff', borderColor: PURPLE }
                    : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {surveyStatus === 'I need a new survey' && (
              <p className="text-xs px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: '#fef9c3', color: '#713f12' }}>! Order ASAP — budget $400–600. Ask your title company for a recommendation.</p>
            )}
            {surveyStatus === 'I have a survey' && (
              <label className="flex items-center gap-3 pl-14 cursor-pointer">
                <input type="checkbox" checked={surveyConfirmed} onChange={e => setSurveyConfirmed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
                <span className={`text-sm ${surveyConfirmed ? 'line-through text-gray-400' : 'text-gray-700'}`}>Survey confirmed and sent to title</span>
              </label>
            )}
            {surveyStatus === 'Not sure' && (
              <p className="pl-14 text-xs text-purple-700">ℹ Ask your title company — they&apos;ll tell you what&apos;s required for your county.</p>
            )}
          </div>
        </div>

        {/* Net Proceeds Calculator — hero */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Net Proceeds Calculator 💰</h3>
          <p className="text-sm text-gray-500 mb-5">What will you actually walk away with after closing costs?</p>

          <div className="rounded-xl border-2 border-green-200 bg-white px-5 py-5" style={{ boxShadow: '0 0 0 4px #f0fdf4' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {NET_PROCEEDS_FIELDS.map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={netProceeds[field]}
                    onChange={e => setNetProceeds(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>

            {sp > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between text-gray-700"><span>Sale price</span><span className="font-medium">${sp.toLocaleString()}</span></div>
                  {mp > 0 && <div className="flex justify-between text-gray-500"><span>Less: Mortgage payoff</span><span>−${mp.toLocaleString()}</span></div>}
                  {tf > 0 && <div className="flex justify-between text-gray-500"><span>Less: Title fees</span><span>−${tf.toLocaleString()}</span></div>}
                  {pt > 0 && <div className="flex justify-between text-gray-500"><span>Less: Property taxes</span><span>−${pt.toLocaleString()}</span></div>}
                  {hf > 0 && <div className="flex justify-between text-gray-500"><span>Less: HOA fees</span><span>−${hf.toLocaleString()}</span></div>}
                  {rc > 0 && <div className="flex justify-between text-gray-500"><span>Less: Repair credits</span><span>−${rc.toLocaleString()}</span></div>}
                  {ba > 0 && <div className="flex justify-between text-gray-500"><span>Less: Buyer&apos;s agent ({baPct}%)</span><span>−${Math.round(ba).toLocaleString()}</span></div>}
                  {ms > 0 && <div className="flex justify-between text-gray-500"><span>Less: Miscellaneous</span><span>−${ms.toLocaleString()}</span></div>}
                </div>
                <div className="flex justify-between items-center px-4 py-3 rounded-xl font-bold text-base mb-3" style={{ backgroundColor: '#f0fdf4', color: ACCENT }}>
                  <span>Estimated net proceeds</span>
                  <span className="text-2xl">${Math.round(estimatedNet).toLocaleString()}</span>
                </div>
                <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                  vs. with a listing agent (additional 3% = −${Math.round(listingAgentCost).toLocaleString()}): <span className="font-semibold">${Math.round(withAgentNet).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Closing Timeline Tracker */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Closing Timeline 📅</h3>
          <p className="text-sm text-gray-500 mb-5">Key dates — fill as you confirm them.</p>

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CLOSING_DATE_FIELDS.map(({ field, label }) => {
                const days = daysUntilDate(closingDates[field])
                let chip = null
                if (days !== null) {
                  if (days < 0)        chip = <span className="text-xs text-gray-400 mt-1">Done</span>
                  else if (days === 0) chip = <span className="text-xs font-semibold text-amber-600 mt-1">Today</span>
                  else {
                    const [bg, fg] = days > 7 ? ['#f0fdf4', '#16a34a'] : ['#fef9c3', '#854d0e']
                    chip = <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 self-start" style={{ backgroundColor: bg, color: fg }}>In {days} days</span>
                  }
                }
                return (
                  <div key={field} className="flex flex-col">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                    <input
                      type="date"
                      value={closingDates[field]}
                      onChange={e => setClosingDates(prev => ({ ...prev, [field]: e.target.value }))}
                      className={inputCls}
                    />
                    {chip}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

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
                onClick={() => onSelectStep && onSelectStep(9)}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: ACCENT }}
              >
                Next up: Closing Day →
              </button>
            </>
          ) : (
            <button type="button" onClick={() => onComplete(true)} className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
              Mark this step complete
            </button>
          )}
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <div className="sticky top-8 space-y-4">

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Days to Close</p>
            {daysToClose === null && <p className="text-4xl font-black text-gray-300">—</p>}
            {daysToClose !== null && daysToClose < 0 && <p className="text-lg font-black" style={{ color: ACCENT }}>Closed ✅</p>}
            {daysToClose === 0 && <p className="text-3xl font-black text-amber-500">Today!</p>}
            {daysToClose !== null && daysToClose > 0 && (
              <>
                <p className="text-5xl font-black leading-none mb-1" style={{ color: daysToClose > 14 ? '#16a34a' : daysToClose > 7 ? '#d97706' : '#dc2626' }}>{daysToClose}</p>
                <p className="text-xs text-gray-400">days until closing</p>
              </>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Milestones</p>
            <div className="space-y-2">
              {milestones.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={done ? 'text-green-600' : 'text-gray-300'} style={{ fontSize: 14 }}>{done ? '✅' : '○'}</span>
                  <span className={done ? 'text-gray-700 font-medium' : 'text-gray-400'}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Est. Net Proceeds</p>
            {sp > 0
              ? <p className="text-2xl font-black" style={{ color: ACCENT }}>${Math.round(estimatedNet).toLocaleString()}</p>
              : <p className="text-2xl font-black text-gray-300">—</p>}
          </div>

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

              {/* Title Setup */}
              {activeDrawer === 'title' && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Title Companies</p>
                    <div className="space-y-3">
                      {TITLE_COMPANIES.map(co => (
                        <div key={co.name} className="rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{co.name}</p>
                            <p className="text-xs text-gray-500">{co.description} · {co.coverage}</p>
                            <p className="text-xs text-gray-400">⭐ {co.rating}</p>
                          </div>
                          <a href={co.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: PURPLE }}>Quote →</a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setTimelineOpen(o => !o)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      <span>Title process timeline</span>
                      <span>{timelineOpen ? '▲' : '▼'}</span>
                    </button>
                    {timelineOpen && (
                      <div className="mt-3 space-y-2 pl-2">
                        {TITLE_TIMELINE.map(({ period, label, detail }, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ backgroundColor: PURPLE }}>{i + 1}</div>
                            <div className="rounded-lg border border-gray-200 px-3 py-2 flex-1">
                              <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: PURPLE }}>{period}</p>
                              <p className="text-sm font-semibold text-gray-900">{label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payoff Statement</p>
                    <div className="space-y-2">
                      {PAYOFF_CARDS.map((card, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">{card}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Survey Options</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-semibold">I have a survey</span> — your title company will review it; have it ready.</p>
                      <p><span className="font-semibold">I need a new survey</span> — budget $400–600; your title company can refer a surveyor.</p>
                      <p><span className="font-semibold">Not sure</span> — ask your title company; requirements vary by county.</p>
                    </div>
                  </div>
                </>
              )}

              {/* Doc Prep */}
              {activeDrawer === 'docs' && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents checklist</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={documentsChecked.length === DOCUMENTS.length ? { backgroundColor: '#f0fdf4', color: '#16a34a' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      {documentsChecked.length} / {DOCUMENTS.length} ready
                    </span>
                  </div>
                  <div className="space-y-3">
                    {DOCUMENTS.map(({ id, label, badge, isMust }) => (
                      <label key={id} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={documentsChecked.includes(id)} onChange={() => toggleDoc(id)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
                        <span className={`text-sm flex-1 ${documentsChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>{label}</span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={isMust ? { backgroundColor: '#fef2f2', color: '#dc2626' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>{badge}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic">Your title company will confirm exactly which documents are required for your transaction.</p>
                </>
              )}

              {/* Wire Fraud */}
              {activeDrawer === 'fraud' && (
                <>
                  <div className="rounded-xl px-4 py-4 space-y-3" style={{ backgroundColor: '#fff7ed' }}>
                    <p className="text-sm font-bold" style={{ color: '#92400e' }}>{WIRE_FRAUD_SOURCE.title} ({WIRE_FRAUD_SOURCE.year})</p>
                    <p className="text-sm text-gray-700">{WIRE_FRAUD_SOURCE.intro}</p>
                    <ul className="space-y-1">
                      {WIRE_FRAUD_SOURCE.bullets.map((b, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="flex-shrink-0 text-amber-600 font-bold">•</span>{b}</li>
                      ))}
                    </ul>
                    <a href={WIRE_FRAUD_SOURCE.fullReportUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">FBI full report →</a>
                  </div>

                  <div className="rounded-xl border-2 border-amber-200 px-4 py-4" style={{ backgroundColor: '#fffbeb' }}>
                    <p className="text-sm font-bold text-amber-800 mb-2">⚠ Critical rule</p>
                    <p className="text-sm text-amber-800">Your title company will <strong>NEVER</strong> call you to change wire instructions. If you receive a call like this, hang up and call your title officer directly at their published number.</p>
                  </div>

                  <p className="text-sm text-gray-600">{WIRE_FRAUD_SOURCE.whyItMatters}</p>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={wireFraudAcknowledged} onChange={e => setWireFraudAcknowledged(e.target.checked)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0 mt-0.5" style={{ accentColor: ACCENT }} />
                    <span className={`text-sm ${wireFraudAcknowledged ? 'line-through text-gray-400' : 'text-gray-800'}`}>I understand the wire fraud risk and will verify all wire instructions by phone before sending any funds</span>
                  </label>
                  {wireFraudAcknowledged && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: '#f0fdf4', color: ACCENT }}>
                      <span>✓</span> Acknowledged — you&apos;re protected
                    </div>
                  )}
                </>
              )}

              {/* Closing Day */}
              {activeDrawer === 'closing' && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Must bring to closing</p>
                    <div className="space-y-3">
                      {CLOSING_DAY_ITEMS.map(({ id, label, badge, isMust }) => (
                        <label key={id} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={closingDayChecked.includes(id)} onChange={() => toggleClosingDay(id)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
                          <span className={`text-sm flex-1 ${closingDayChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>{label}</span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={isMust ? { backgroundColor: '#fef2f2', color: '#dc2626' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>{badge}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Utilities — schedule for closing day</p>
                    <div className="space-y-3">
                      {UTILITIES.map(({ id, label }) => (
                        <label key={id} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={utilitiesChecked.includes(id)} onChange={() => toggleUtil(id)} className="h-4 w-4 rounded border-gray-300 flex-shrink-0" style={{ accentColor: ACCENT }} />
                          <span className={`text-sm ${utilitiesChecked.includes(id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pro tips</p>
                    <div className="space-y-3">
                      {PRO_TIPS_CLOSE.map(({ tip, source }) => (
                        <div key={source} className="rounded-xl border border-gray-200 px-4 py-3">
                          <p className="text-sm font-medium text-gray-800 mb-1">&ldquo;{tip}&rdquo;</p>
                          <p className="text-xs text-gray-400">{source}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {VENDORS_CLOSE.map(({ label, url }) => (
                        <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
                          {label}
                          <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5l7-7M9.5 2.5H4M9.5 2.5v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </a>
                      ))}
                    </div>
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
