import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const TIMELINE = [
  { range: 'Day 1–2',          text: 'Buyer hires a licensed inspector. You must provide access. Plan to be out of the home for 3–4 hours.' },
  { range: 'Day 2–3',          text: 'Inspector delivers a report to the buyer — typically 30–80 pages with photos of every finding.' },
  { range: 'Day 3–7',          text: 'Buyer reviews report and decides what to request. They may ask for repairs, credits, or price reduction.' },
  { range: 'Day 7–10',         text: 'You respond to repair requests. Negotiate. Reach agreement — or buyer walks.' },
  { range: 'Option period ends', text: 'Once expired, buyer loses their right to walk away for free. They\'re committed.' },
]

const INFO_NOTES = [
  'Buyers can back out for ANY reason during the option period — no explanation needed.',
  'The option fee ($100–500) is yours to keep regardless of outcome.',
  'In Texas, inspectors are licensed by TREC — verify your inspector is licensed at trec.texas.gov.',
]

const FINDINGS = [
  {
    title: 'Foundation issues',
    detail: 'The #1 concern in Texas clay soil. Minor cracks are normal. Major movement needs a structural engineer. Cost to repair: $3,000–15,000+',
  },
  {
    title: 'HVAC problems',
    detail: 'Age, dirty filters, refrigerant levels. Texas buyers are especially sensitive to AC issues. A recent service receipt helps.',
  },
  {
    title: 'Roof condition',
    detail: 'Age, missing shingles, flashing issues. Most lenders require roof to have 2+ years of life remaining.',
  },
  {
    title: 'Plumbing',
    detail: 'Slow drains, leaks under sinks, water heater age. Common and usually cheap to fix.',
  },
  {
    title: 'Electrical',
    detail: 'Older panels, GFCI outlets near water, double-tapped breakers. Safety items buyers take seriously.',
  },
  {
    title: 'Wood rot',
    detail: 'Fascia boards, window sills, door frames. Common in Texas humidity. Usually $200–500 to fix.',
  },
  {
    title: 'Poor drainage',
    detail: 'Water pooling near foundation. Serious concern in TX — affects foundation long term.',
  },
]

const REQUEST_TYPES = ['Repair', 'Credit', 'Price Reduction']
const RESPONSE_TYPES = ['Accept', 'Counter', 'Decline']

const RESPONSE_STYLE = {
  Accept:  { bg: '#dcfce7', text: '#15803d' },
  Counter: { bg: '#fef9c3', text: '#854d0e' },
  Decline: { bg: '#fee2e2', text: '#dc2626' },
}

const PRO_TIPS = [
  { tip: 'Offer a closing credit instead of repairs — you stay in control of cost', source: 'Industry best practice' },
  { tip: 'Prioritize safety items — buyers and lenders care most about these', source: 'HomeLight Agent Survey' },
  { tip: 'The inspection report is not a repair list — you don\'t have to fix everything', source: 'NAR guidelines' },
  { tip: 'In Texas, foundation issues are common — get a structural engineer opinion before agreeing to repairs', source: 'Industry best practice' },
]

const VENDORS = [
  { label: 'TREC License Lookup', url: 'https://trec.texas.gov' },
  { label: 'HomeAdvisor', url: 'https://homeadvisor.com' },
  { label: 'Thumbtack', url: 'https://thumbtack.com' },
  { label: 'Foundation repair TX', url: 'https://thumbtack.com/k/foundation-repair/near-me' },
]

function makeEmptyRequest() {
  return {
    id: Date.now() + Math.random(),
    description: '',
    requestType: 'Repair',
    requestedAmount: '',
    response: 'Accept',
    counterAmount: '',
    notes: '',
  }
}

function loadStep7() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step7 || {}
  } catch { return {} }
}

function saveStep7(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step7: data }))
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

export default function Step7Inspection({ onComplete, isCompleted, onSelectStep }) {
  const [openFindings, setOpenFindings] = useState({})

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

  const [form, setForm] = useState(makeEmptyRequest())

  useEffect(() => {
    saveStep7({
      repairRequests,
      bottomLine: {
        minPrice: bottomLine.minPrice === '' ? null : bottomLine.minPrice,
        maxCredit: bottomLine.maxCredit === '' ? null : bottomLine.maxCredit,
        dealBreakers: bottomLine.dealBreakers,
      },
    })
  }, [repairRequests, bottomLine])

  const toggleFinding = (i) => setOpenFindings(prev => ({ ...prev, [i]: !prev[i] }))

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addRequest = () => {
    if (!form.description.trim()) return
    setRepairRequests(prev => [...prev, { ...form, id: Date.now() + Math.random() }])
    setForm(makeEmptyRequest())
  }

  const removeRequest = (id) => setRepairRequests(prev => prev.filter(r => r.id !== id))

  const totalConcessions = repairRequests.reduce((sum, r) => {
    if (r.response === 'Decline') return sum
    const amt = r.response === 'Counter'
      ? parseFloat(r.counterAmount) || 0
      : parseFloat(r.requestedAmount) || 0
    return sum + amt
  }, 0)

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
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Option Period &amp; Inspection</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        The option period is the most critical 5–10 days of your sale. Buyers will find things — every
        home has issues. The goal is to negotiate smartly, not panic.
      </p>

      {/* Timeline */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">What happens during the option period? ⏱</h3>
        <p className="text-sm text-gray-500 mb-6">Here&apos;s the timeline so nothing surprises you.</p>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gray-200" />

          <div className="space-y-4">
            {TIMELINE.map(({ range, text }, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: PURPLE }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: PURPLE }}>{range}</p>
                  <p className="text-sm text-gray-700">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info notes */}
        <div className="mt-6 space-y-2">
          {INFO_NOTES.map((note, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}
            >
              <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Common findings */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">What inspectors commonly find in Texas homes 🔍</h3>
        <p className="text-sm text-gray-500 mb-6">Don&apos;t panic — these are normal. Know what&apos;s coming.</p>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {FINDINGS.map((item, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggleFinding(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                <ChevronIcon open={!!openFindings[i]} />
              </button>
              {openFindings[i] && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-700">{item.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Repair request tracker */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Track and respond to repair requests</h3>
        <p className="text-sm text-gray-500 mb-6">Enter each repair request and decide how to respond.</p>

        {/* Add form */}
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Item description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => handleFormChange('description', e.target.value)}
                placeholder="e.g. HVAC not cooling properly"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer&apos;s request type</label>
              <select
                value={form.requestType}
                onChange={e => handleFormChange('requestType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
              >
                {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Requested amount ($)</label>
              <input
                type="number"
                min="0"
                value={form.requestedAmount}
                onChange={e => handleFormChange('requestedAmount', e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Your response</label>
              <select
                value={form.response}
                onChange={e => handleFormChange('response', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
              >
                {RESPONSE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {form.response === 'Counter' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your counter amount ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.counterAmount}
                  onChange={e => handleFormChange('counterAmount', e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                />
              </div>
            )}

            <div className={form.response === 'Counter' ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => handleFormChange('notes', e.target.value)}
                placeholder="e.g. Will get 3 quotes first"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addRequest}
            disabled={!form.description.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            Add request
          </button>
        </div>

        {/* Request list */}
        {repairRequests.length > 0 && (
          <>
            <div className="space-y-3 mb-4">
              {repairRequests.map(r => {
                const style = RESPONSE_STYLE[r.response] || RESPONSE_STYLE.Accept
                const displayAmt = r.response === 'Counter'
                  ? parseFloat(r.counterAmount) || 0
                  : parseFloat(r.requestedAmount) || 0
                return (
                  <div key={r.id} className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-900">{r.description}</span>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                        >
                          {r.requestType}
                        </span>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {r.response}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        {r.requestedAmount && (
                          <span>Requested: ${parseFloat(r.requestedAmount).toLocaleString()}</span>
                        )}
                        {r.response === 'Counter' && r.counterAmount && (
                          <span>Counter: ${parseFloat(r.counterAmount).toLocaleString()}</span>
                        )}
                        {r.response === 'Accept' && r.requestedAmount && (
                          <span>Concession: ${displayAmt.toLocaleString()}</span>
                        )}
                      </div>
                      {r.notes && (
                        <p className="mt-1 text-xs text-gray-500 italic">{r.notes}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRequest(r.id)}
                      className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Remove"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 2a1 1 0 00-1 1H3a1 1 0 000 2h10a1 1 0 100-2h-2a1 1 0 00-1-1H6zM4 7a1 1 0 011 1v4a1 1 0 002 0V8a1 1 0 012 0v4a1 1 0 002 0V8a1 1 0 011-1 1 1 0 100-2H4a1 1 0 100 2z" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>

            <div
              className="flex items-center justify-between px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#f0fdf4', color: ACCENT }}
            >
              <span>Total concessions</span>
              <span>${totalConcessions.toLocaleString()}</span>
            </div>
          </>
        )}

        {repairRequests.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No repair requests logged yet.</p>
        )}

        {/* Strategic tip */}
        <div
          className="mt-6 flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
          style={{ backgroundColor: '#fefce8', color: '#713f12' }}
        >
          <span className="text-lg flex-shrink-0">💡</span>
          <p>
            Offering a closing credit instead of doing repairs keeps you in control of cost and timeline.
            Buyers often prefer cash anyway.
          </p>
        </div>
      </section>

      {/* Bottom line */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Before you negotiate, know your numbers 💰</h3>

        <div className="rounded-xl border border-gray-200 bg-white px-5 py-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your minimum acceptable price ($)
              </label>
              <p className="text-xs text-gray-400 mb-2">The lowest you&apos;ll go after all concessions</p>
              <input
                type="number"
                min="0"
                value={bottomLine.minPrice}
                onChange={e => setBottomLine(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="e.g. 440000"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Maximum repair credit you&apos;ll offer ($)
              </label>
              <p className="text-xs text-gray-400 mb-2">Your ceiling for concessions</p>
              <input
                type="number"
                min="0"
                value={bottomLine.maxCredit}
                onChange={e => setBottomLine(prev => ({ ...prev, maxCredit: e.target.value }))}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Deal breakers</label>
              <p className="text-xs text-gray-400 mb-2">What would make you walk away?</p>
              <input
                type="text"
                value={bottomLine.dealBreakers}
                onChange={e => setBottomLine(prev => ({ ...prev, dealBreakers: e.target.value }))}
                placeholder="e.g. Buyer demands full foundation repair"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pro tips */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRO_TIPS.map(({ tip, source }) => (
            <div key={source + tip} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-sm font-medium text-gray-800 mb-2">&ldquo;{tip}&rdquo;</p>
              <p className="text-xs text-gray-400">{source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vendor chips */}
      <section className="mb-12">
        <div className="flex flex-wrap gap-2">
          {VENDORS.map(({ label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              {label}
              <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5l7-7M9.5 2.5H4M9.5 2.5v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
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
  )
}
