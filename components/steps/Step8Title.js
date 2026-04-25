import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const TITLE_COMPANIES = [
  {
    name: 'Republic Title',
    description: 'Full service title & escrow',
    rating: '4.9',
    coverage: 'Dallas/Fort Worth & Austin',
    url: 'https://republictitle.com',
  },
  {
    name: 'Chicago Title Texas',
    description: 'Statewide coverage',
    rating: '4.8',
    coverage: 'All TX counties',
    url: 'https://cttexas.com',
  },
  {
    name: 'Independence Title',
    description: 'Local TX title company',
    rating: '4.7',
    coverage: 'Austin & Central TX',
    url: 'https://independencetitle.com',
  },
]

const TITLE_TIMELINE = [
  { period: 'Week 1', label: 'Title search', detail: 'Checks for liens, judgments, ownership disputes on your property' },
  { period: 'Week 1–2', label: 'HOA estoppel letter', detail: 'If you have an HOA, they request a clearance letter (takes 1–2 weeks, costs $200–400 — factor this in)' },
  { period: 'Week 2–3', label: 'Lien clearance', detail: 'Pays off any liens from your proceeds at closing' },
  { period: 'Week 3', label: 'Closing disclosure', detail: 'You receive a document showing exact costs and net proceeds 3 days before closing' },
  { period: 'Closing day', label: 'Deed transfer, funds distribution', detail: 'You get paid' },
]

const PAYOFF_CARDS = [
  "Call your mortgage lender and request a 'payoff statement' — give them your expected closing date",
  'Takes 3–5 business days — request it as soon as you have a closing date',
  'The payoff amount changes daily due to interest — get it dated close to your closing date',
  'If you own your home free and clear — skip this step ✓',
]

const SURVEY_OPTIONS = ['I have a survey', 'I need a new survey', 'Not sure']

function loadStep8() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step8 || {}
  } catch { return {} }
}

function saveStep8(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step8: data }))
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

export default function Step8Title({ onComplete, isCompleted, onSelectStep }) {
  const [titleOpened, setTitleOpened] = useState(() => {
    if (typeof window === 'undefined') return false
    return loadStep8().titleOpened || false
  })

  const [hasHOA, setHasHOA] = useState(() => {
    if (typeof window === 'undefined') return null
    const saved = loadStep8().hasHOA
    return saved === undefined ? null : saved
  })

  const [hoaClearanceRequested, setHoaClearanceRequested] = useState(() => {
    if (typeof window === 'undefined') return false
    return loadStep8().hoaClearanceRequested || false
  })

  const [payoffRequested, setPayoffRequested] = useState(() => {
    if (typeof window === 'undefined') return false
    return loadStep8().payoffRequested || false
  })

  const [surveyStatus, setSurveyStatus] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStep8().surveyStatus || ''
  })

  const [surveyConfirmed, setSurveyConfirmed] = useState(() => {
    if (typeof window === 'undefined') return false
    return loadStep8().surveyConfirmed || false
  })

  const [timelineOpen, setTimelineOpen] = useState(false)

  useEffect(() => {
    saveStep8({ titleOpened, hasHOA, hoaClearanceRequested, payoffRequested, surveyStatus, surveyConfirmed })
  }, [titleOpened, hasHOA, hoaClearanceRequested, payoffRequested, surveyStatus, surveyConfirmed])

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
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Title &amp; Escrow</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        In Texas, the title company handles everything legal. Your job is to open title immediately,
        stay organized, and respond quickly. They do the heavy lifting — you just show up.
      </p>

      {/* Section 2: Open title */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Step 1: Open title immediately 🏦</h3>
        <p className="text-sm text-gray-500 mb-6">
          As soon as you have a signed contract, open title the same day. Don&apos;t wait.
        </p>

        {/* Info card */}
        <div
          className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm mb-6"
          style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}
        >
          <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
          <span>
            In Texas, the title company handles: title search, lien clearing, deed preparation,
            closing disclosure, and funds distribution. You do <strong>NOT</strong> need an attorney.
          </span>
        </div>

        {/* What to look for */}
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 mb-6">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">What to look for</p>
          <div className="space-y-2">
            {[
              'Experience with FSBO transactions',
              'Responsive communication — you\'ll have questions',
              'Competitive fees — shop around, fees vary $500–1,500',
              'Local knowledge of your county',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-600 flex-shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Title company cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {TITLE_COMPANIES.map((co) => (
            <div
              key={co.name}
              className="rounded-xl border border-gray-200 bg-white px-4 py-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-sm font-bold text-gray-900">{co.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{co.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>⭐ {co.rating}</span>
                <span className="mx-1 text-gray-300">·</span>
                <span>{co.coverage}</span>
              </div>
              <a
                href={co.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: PURPLE }}
              >
                Get quote
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5l7-7M9.5 2.5H4M9.5 2.5v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Ask each title company: &ldquo;Do you work with FSBO sellers?&rdquo; and &ldquo;What are your total closing fees?&rdquo; Get at least 2 quotes.
        </p>

        {/* Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={titleOpened}
            onChange={e => setTitleOpened(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
            style={{ accentColor: ACCENT }}
          />
          <span className={`text-sm font-medium ${titleOpened ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            I have opened title with a title company
          </span>
        </label>
      </section>

      {/* Section 3: What the title company does */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">What happens on their end 📋</h3>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setTimelineOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">
              See the full process {timelineOpen ? '▲' : '▼'}
            </span>
            <ChevronIcon open={timelineOpen} />
          </button>

          {timelineOpen && (
            <div className="px-5 pb-5 pt-1">
              <div className="relative">
                <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gray-200" />
                <div className="space-y-4">
                  {TITLE_TIMELINE.map(({ period, label, detail }, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: PURPLE }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: PURPLE }}>{period}</p>
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">{label}</p>
                        <p className="text-sm text-gray-600">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: HOA */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Do you have an HOA? ⚠️</h3>

        <div className="flex gap-3 mb-6 mt-4">
          {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
            <button
              key={label}
              type="button"
              onClick={() => setHasHOA(val)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all"
              style={
                hasHOA === val
                  ? { backgroundColor: PURPLE, color: '#fff', borderColor: PURPLE }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {hasHOA === true && (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 space-y-4">
            <div className="space-y-2">
              {[
                'Your title company will request an HOA estoppel letter — allow 1–2 weeks',
                'Cost: $200–400 paid from your proceeds',
                'The letter confirms: no outstanding dues, no violations, current assessment amounts',
              ].map((note, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#fef9c3', color: '#713f12' }}
                >
                  <span className="flex-shrink-0 font-bold mt-0.5">!</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
            >
              <span className="flex-shrink-0 font-bold mt-0.5">💡</span>
              <span>Tip: Contact your HOA directly to speed up the process</span>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hoaClearanceRequested}
                onChange={e => setHoaClearanceRequested(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
                style={{ accentColor: ACCENT }}
              />
              <span className={`text-sm font-medium ${hoaClearanceRequested ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                HOA clearance letter requested
              </span>
            </label>
          </div>
        )}

        {hasHOA === false && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
          >
            <span className="font-bold">✓</span>
            <span>No HOA — one less thing to worry about</span>
          </div>
        )}
      </section>

      {/* Section 5: Payoff statement */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Request your mortgage payoff statement 💰</h3>
        <p className="text-sm text-gray-500 mb-6">
          The title company needs your exact payoff amount to close. You must request this from your lender.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {PAYOFF_CARDS.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700"
            >
              {card}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={payoffRequested}
            onChange={e => setPayoffRequested(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
            style={{ accentColor: ACCENT }}
          />
          <span className={`text-sm font-medium ${payoffRequested ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            Payoff statement requested from lender
          </span>
        </label>
      </section>

      {/* Section 6: Survey */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Do you have a property survey? 📐</h3>
        <p className="text-sm text-gray-500 mb-6">
          Title companies often require a survey showing your property boundaries.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          {SURVEY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSurveyStatus(opt)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all"
              style={
                surveyStatus === opt
                  ? { backgroundColor: PURPLE, color: '#fff', borderColor: PURPLE }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
              }
            >
              {opt}
            </button>
          ))}
        </div>

        {surveyStatus === 'I have a survey' && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-6"
            style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
          >
            <span className="flex-shrink-0 font-bold mt-0.5">✓</span>
            <span>Great — your title company will let you know if it&apos;s acceptable. Have it ready.</span>
          </div>
        )}

        {surveyStatus === 'I need a new survey' && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-6"
            style={{ backgroundColor: '#fef9c3', color: '#713f12' }}
          >
            <span className="flex-shrink-0 font-bold mt-0.5">!</span>
            <span>Budget $400–600 for a new survey. Ask your title company for a recommendation.</span>
          </div>
        )}

        {surveyStatus === 'Not sure' && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-6"
            style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}
          >
            <span className="flex-shrink-0 font-bold mt-0.5">ℹ</span>
            <span>Ask your title company — they&apos;ll tell you what&apos;s required for your county.</span>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={surveyConfirmed}
            onChange={e => setSurveyConfirmed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
            style={{ accentColor: ACCENT }}
          />
          <span className={`text-sm font-medium ${surveyConfirmed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            Survey status confirmed with title company
          </span>
        </label>
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
