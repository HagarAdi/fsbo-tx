import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { notifyStepDataChange } from '../../utils/notifyStepData'
import MilestoneCelebration from '../MilestoneCelebration'
import SetupModal from '../SetupModal'

const ACCENT = '#16a34a'

const SUB_STEPS = [
  { id: 1, label: 'Setup' },
  { id: 2, label: 'Showing Log' },
]

const slideVariants = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.16, ease: 'easeIn' } }),
}

const SETUP_CARDS = [
  { id: 'yardsign',    emoji: '🪧', label: 'Yard Sign' },
  { id: 'virtualtour', emoji: '🎥', label: 'Virtual Tour' },
  { id: 'method',      emoji: '🔑', label: 'Showing Method' },
]

const YARD_SIGN_PROVIDERS = [
  { name: 'Amazon',           priceRange: '$20–50',  url: 'https://www.amazon.com/s?k=fsbo+yard+sign', blurb: 'Pre-printed FSBO signs, delivered in 2 days.' },
  { name: 'Home Depot',       priceRange: '$30–80',  url: 'https://www.homedepot.com',                 blurb: 'Pick up the same day in most TX metros.' },
  { name: 'Local print shop', priceRange: '$50–100', url: 'https://www.google.com/search?q=sign+printing+near+me', blurb: 'Custom design with your wording — search "sign printing near me".' },
]

const SAFETY_ITEMS = [
  'Never show alone — have someone present',
  'Verify buyer is working with a licensed agent',
  'Remove valuables, meds, and personal documents',
  "Don't share personal reasons why you're selling",
  "Trust your instincts — it's okay to decline a showing",
]

const SHOWING_METHOD_OPTIONS = [
  {
    id: 'self',
    label: 'Show it yourself',
    description: 'Best for direct buyer feedback. Be present but not hovering — let them explore freely.',
    link: null,
    linkLabel: null,
  },
  {
    id: 'lockbox',
    label: 'Lockbox',
    description: 'More showings, less scheduling. Buyers or their agents access via a code. $40–80.',
    link: 'https://www.amazon.com/s?k=real+estate+lockbox',
    linkLabel: 'Buy a lockbox on Amazon →',
  },
  {
    id: 'service',
    label: 'Showing service',
    description: 'Most professional option. ShowingTime coordinates requests for you. ~$30–50/month.',
    link: 'https://www.showingtime.com',
    linkLabel: 'Learn about ShowingTime →',
  },
]

const VIRTUAL_TOUR_PROVIDERS = [
  {
    id: 'matterport',
    label: 'Matterport',
    cost: '$150–300',
    costColor: '#92400e',
    costBg: '#fef3c7',
    description: 'Professional 3D walkthrough. Hire a photographer to shoot it.',
    link: 'https://www.thumbtack.com/k/matterport/near-me/',
    linkLabel: 'Find a photographer on Thumbtack →',
  },
  {
    id: 'zillow3d',
    label: 'Zillow 3D Home',
    cost: 'Free',
    costColor: '#15803d',
    costBg: '#dcfce7',
    description: 'Free app — shoot it yourself in about 30 minutes. Integrates directly with your Zillow listing.',
    link: 'https://www.zillow.com/z3d/',
    linkLabel: 'Get the Zillow 3D app →',
  },
  {
    id: 'youtube',
    label: 'YouTube walkthrough',
    cost: 'Free',
    costColor: '#15803d',
    costBg: '#dcfce7',
    description: 'Walk through on video, post to YouTube, and paste the link in your listing. 30 minutes to shoot.',
    link: 'https://www.youtube.com',
    linkLabel: 'Open YouTube →',
  },
]

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No Show']

const STATUS_COLORS = {
  Scheduled:  { bg: '#dbeafe', text: '#1d4ed8' },
  Completed:  { bg: '#dcfce7', text: '#15803d' },
  Cancelled:  { bg: '#fee2e2', text: '#dc2626' },
  'No Show':  { bg: '#fef3c7', text: '#92400e' },
}

const EMPTY_TITLE_CO = { name: '', escrow: '', email: '', phone: '' }

const TITLE_COMPANIES = [
  { name: 'Republic Title',      coverage: 'Dallas/Fort Worth & Austin', url: 'https://republictitle.com' },
  { name: 'Chicago Title Texas', coverage: 'All TX counties',            url: 'https://cttexas.com' },
  { name: 'Independence Title',  coverage: 'Austin & Central TX',        url: 'https://independencetitle.com' },
]

const TITLE_BENEFITS = [
  {
    icon: '🛡️',
    label: 'Earnest money on day one',
    detail: 'Having an open escrow lets the buyer deposit funds the moment the contract is signed — satisfying Paragraph 5 immediately and signaling a committed deal.',
  },
  {
    icon: '🔍',
    label: 'Catch problems before the Option Period clock starts',
    detail: "A preliminary title search can surface liens, boundary errors, or ownership gaps before the buyer's 10-day inspection window even begins.",
  },
  {
    icon: '✅',
    label: 'Signal you are a prepared seller',
    detail: 'Buyer agents notice when a FSBO has an established escrow team. It removes a common objection and speeds up offer negotiations.',
  },
]

function loadStep5() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step5 || {}
  } catch { return {} }
}

function saveStep5(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step5: data }))
    notifyStepDataChange()
  } catch {}
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

export default function Step5Showings({ onSelectStep }) {
  const [activeSubStep, setActiveSubStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const goTo = (step) => {
    setDirection(step > activeSubStep ? 1 : -1)
    setActiveSubStep(step)
  }

  const [activeModal, setActiveModal] = useState(null)
  const [timelineOpen, setTimelineOpen] = useState(false)

  const [showingMethod, setShowingMethod] = useState('')
  const [showings, setShowings]           = useState([])
  const [titleCompany, setTitleCompany]   = useState(EMPTY_TITLE_CO)

  const [expandedShowingId, setExpandedShowingId] = useState(null)
  const [showMilestone, setShowMilestone] = useState(false)

  const buildMarketSummary = () => {
    let listingLabel = 'Listing in progress'
    const showingLabel = showingMethod || 'Method not yet selected'
    const titleLabel = titleCompany?.name || 'Title company not yet set'
    try {
      const data = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
      const photoCount = Array.isArray(data.step4?.uploadedRooms) ? data.step4.uploadedRooms.length : 0
      const hasDescription = !!(data.step4?.listingDetails?.description && String(data.step4.listingDetails.description).trim())
      if (photoCount > 0 || hasDescription) {
        const parts = []
        if (photoCount > 0) parts.push(`${photoCount} photo room${photoCount === 1 ? '' : 's'}`)
        if (hasDescription) parts.push('description ready')
        listingLabel = parts.join(' · ')
      }
    } catch {}
    return [
      { icon: '📸', label: 'Listing', value: listingLabel },
      { icon: '🔑', label: 'Showings', value: showingLabel },
      { icon: '🏛️', label: 'Title', value: titleLabel },
    ]
  }

  useEffect(() => {
    const saved = loadStep5()
    setShowingMethod(saved.showingMethod || '')
    setShowings(saved.showings || [])
    setTitleCompany(saved.titleCompany || EMPTY_TITLE_CO)
  }, [])

  useEffect(() => {
    saveStep5({ showingMethod, showings, titleCompany })
  }, [showingMethod, showings, titleCompany])

  const addShowing = () => {
    const newShowing = { id: Date.now(), date: '', time: '', agent: '', status: 'Scheduled', notes: '' }
    setShowings(prev => [newShowing, ...prev])
    setExpandedShowingId(newShowing.id)
  }

  const updateShowing = (id, field, value) =>
    setShowings(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))

  const deleteShowing = (id) => {
    setShowings(prev => prev.filter(s => s.id !== id))
    if (expandedShowingId === id) setExpandedShowingId(null)
  }

  const formatShowingWhen = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return ''
    const d = new Date(`${dateStr}T${timeStr}`)
    if (Number.isNaN(d.getTime())) return ''
    const datePart = d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })
    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
    const tz = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(d).find(p => p.type === 'timeZoneName')?.value || ''
    return tz ? `${datePart} at ${timePart} ${tz}` : `${datePart} at ${timePart}`
  }

  const closeModal = () => setActiveModal(null)

  return (
    <>
      <div className="flex">

        {/* LEFT: main content */}
        <div className="flex-1 px-4 py-8 md:px-10 md:py-12 min-w-0">

          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
            >
              Market
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Showings Command Center</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            <span className="font-semibold text-gray-800">Set up your showings.</span>{' '}
            Configure your listing, track buyer visits, and manage everything from one place.
          </p>

          {/* Sub-step pills */}
          <div className="flex items-center mb-8">
            {SUB_STEPS.map((step, i) => {
              const done = step.id < activeSubStep
              const active = step.id === activeSubStep
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goTo(step.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'text-white'
                        : done
                        ? 'text-green-700 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    style={active ? { backgroundColor: ACCENT } : {}}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        done
                          ? 'bg-green-500 text-white'
                          : active
                          ? 'bg-white/30 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {done ? '✓' : step.id}
                    </span>
                    {step.label}
                  </button>
                  {i < SUB_STEPS.length - 1 && (
                    <div className={`w-5 h-px mx-1 ${activeSubStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={activeSubStep} custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit">

              {/* Sub-step 1: Setup */}
              {activeSubStep === 1 && (
                <div>
                  {/* 3-card setup grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                    {SETUP_CARDS.map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setActiveModal(d.id)}
                        className="rounded-xl border px-4 py-3 text-sm font-semibold text-left hover:bg-gray-50 transition-colors"
                        style={{
                          borderColor: '#e5e7eb',
                          color: '#374151',
                        }}
                      >
                        <span className="block text-xl mb-1">{d.emoji}</span>
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Preferred Title Company */}
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Preferred Title Company</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      In Texas, the seller pays for the Title Policy and typically chooses the title company.
                      Locking this in now means buyers can send earnest money to the right place immediately
                      after you accept an offer — preventing delays at Step 8.
                    </p>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

                      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT }} />
                        <p className="text-xs text-gray-500">Escrow opens the moment you accept an offer. Lock this in now.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

                        <div className="flex-1 px-5 py-5 min-w-0">
                          <div className="space-y-4 max-w-xs">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Company name</label>
                              <input
                                type="text"
                                value={titleCompany.name}
                                onChange={e => setTitleCompany(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Capital Title of Texas"
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Escrow officer name</label>
                              <input
                                type="text"
                                value={titleCompany.escrow}
                                onChange={e => setTitleCompany(p => ({ ...p, escrow: e.target.value }))}
                                placeholder="e.g. Maria Gonzalez"
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={titleCompany.email}
                                onChange={e => setTitleCompany(p => ({ ...p, email: e.target.value }))}
                                placeholder="escrow@titleco.com"
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                              <input
                                type="tel"
                                value={titleCompany.phone}
                                onChange={e => setTitleCompany(p => ({ ...p, phone: e.target.value }))}
                                placeholder="(512) 555-0100"
                                className={inputCls}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="w-full sm:w-64 shrink-0 px-5 py-5 bg-gray-50">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Popular in Texas</p>
                          <div className="space-y-2">
                            {TITLE_COMPANIES.map(co => (
                              <a
                                key={co.name}
                                href={co.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start justify-between gap-2 px-3 py-3 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:shadow-sm transition-all group"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors truncate">{co.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{co.coverage}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0 mt-0.5 transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 8h10M9 4l4 4-4 4" />
                                </svg>
                              </a>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => setTimelineOpen(o => !o)}
                              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-700 transition-colors"
                            >
                              <span>Why choose title now?</span>
                              <span>{timelineOpen ? '▲' : '▼'}</span>
                            </button>
                            {timelineOpen && (
                              <div className="mt-3 space-y-3">
                                {TITLE_BENEFITS.map(({ icon, label, detail }, i) => (
                                  <div key={i} className="flex gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2">
                                    <span className="text-base flex-shrink-0">{icon}</span>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-800">{label}</p>
                                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{detail}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {titleCompany.name && (
                        <div className="px-5 py-3 border-t border-green-100 bg-green-50 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="#16a34a" />
                            <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-xs text-green-700 font-medium">Will auto-populate Para 5C (Escrow Agent) in your Step 6 offer cards</p>
                        </div>
                      )}

                    </div>
                  </section>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => goTo(2)}
                      className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Continue to Showing Log →
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-step 2: Showing Log */}
              {activeSubStep === 2 && (
                <div>
                  <section className="mb-12">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Showing Log</h3>
                        <p className="text-sm text-gray-500">
                          {showings.length} showing{showings.length !== 1 ? 's' : ''} logged
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addShowing}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
                        style={{ backgroundColor: ACCENT }}
                      >
                        + Log New Showing
                      </button>
                    </div>

                    {showings.length > 0 && (
                      <div className="space-y-3">
                        {[...showings]
                          .sort((a, b) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`))
                          .map(s => {
                          const colors = STATUS_COLORS[s.status] || STATUS_COLORS['Scheduled']
                          const isExpanded = expandedShowingId === s.id
                          const whenLabel = formatShowingWhen(s.date, s.time) || 'New showing'
                          return (
                            <div key={s.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                              <div className="px-5 py-4 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedShowingId(isExpanded ? null : s.id)}
                                  className="flex-1 min-w-0 text-left rounded-md hover:bg-gray-50 -mx-1 px-1 py-1 transition-colors"
                                  aria-expanded={isExpanded}
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {whenLabel}
                                    </span>
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                      {s.status}
                                    </span>
                                  </div>
                                </button>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => deleteShowing(s.id)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    aria-label="Delete showing"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 5h10M6.5 5V3.5a1 1 0 011-1h1a1 1 0 011 1V5M4.5 5l.7 8.1a1 1 0 001 .9h3.6a1 1 0 001-.9L11.5 5M6.8 7.5v4M9.2 7.5v4" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedShowingId(isExpanded ? null : s.id)}
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
                                <div className="px-5 pb-5 pt-4 border-t border-gray-100">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                                      <input type="date" value={s.date} onChange={e => updateShowing(s.id, 'date', e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                                      <input type="time" value={s.time} onChange={e => updateShowing(s.id, 'time', e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer agent name</label>
                                      <input type="text" value={s.agent} onChange={e => updateShowing(s.id, 'agent', e.target.value)} placeholder="e.g. Sarah Johnson" className={inputCls} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                                      <select value={s.status} onChange={e => updateShowing(s.id, 'status', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                                        {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
                                    <input type="text" value={s.notes} onChange={e => updateShowing(s.id, 'notes', e.target.value)} placeholder="e.g. Very interested, asked about the backyard" className={inputCls} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {showings.length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
                        <p className="text-sm text-gray-400">No showings logged yet.</p>
                        <button type="button" onClick={addShowing} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                          Log your first showing
                        </button>
                      </div>
                    )}
                  </section>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMilestone(true)}
                      className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Next up: Review &amp; Negotiate Offers →
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

        {/* RIGHT: sticky sidebar */}
        <aside className="hidden lg:block w-52 shrink-0 pt-8 pr-6">
          <div className="sticky top-8 space-y-6">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">🔒 Safety Protocol</p>
              <ol className="space-y-2.5">
                {SAFETY_ITEMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium leading-snug">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ backgroundColor: ACCENT, fontSize: '10px' }}>
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {activeSubStep === 1 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Checklist</p>
                <p className="text-xs text-gray-400 mb-3 leading-snug">2 things to lock in</p>
                <div className="space-y-2">
                  {[
                    { emoji: '🔑', label: 'Showing method', done: !!showingMethod },
                    { emoji: '🏢', label: 'Title company', done: !!titleCompany.name },
                  ].map(({ emoji, label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <span className={done ? 'text-green-500' : 'text-gray-300'} style={{ fontSize: 13 }}>{done ? '✓' : '○'}</span>
                      <span className={done ? 'text-gray-700 font-medium' : 'text-gray-400'}>{emoji} {label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>

      {/* Setup modals */}
      <SetupModal open={activeModal === 'yardsign'} onClose={closeModal} title="🪧 Yard Sign">
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            A &ldquo;For Sale by Owner&rdquo; yard sign is one of the cheapest, highest-leverage things you can do.
            In Texas, drive-by buyers and neighborhood word-of-mouth still convert — a clean sign with a phone
            number often beats a Zillow ad for local foot traffic.
          </p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">What goes on your sign</p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <p><span className="font-semibold">&ldquo;For Sale By Owner&rdquo;</span> — required on every sign</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <p>A phone number — your primary lead source</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-300 font-bold mt-0.5">○</span>
                <p>Price — <span className="text-gray-500">optional. Adding a price gets more serious calls; skipping it gets more curious ones.</span></p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Placement tips</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span>•</span> Street-facing, visible from the road</li>
              <li className="flex items-start gap-2"><span>•</span> Corner of the lot if possible — double visibility</li>
              <li className="flex items-start gap-2"><span>•</span> Eye level, not blocked by bushes or parked cars</li>
            </ul>
          </div>
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
            <p className="font-semibold text-amber-800 mb-1">⚠️ HOA Warning</p>
            <p className="text-amber-700 text-xs">Check your HOA rules before ordering — some restrict sign size, style, or placement.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Where to buy</p>
            <div className="space-y-2">
              {YARD_SIGN_PROVIDERS.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.priceRange} · {p.blurb}</p>
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </SetupModal>

      <SetupModal open={activeModal === 'virtualtour'} onClose={closeModal} title="🎥 Virtual Tour">
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            A virtual tour lets buyers walk through your home online before requesting an in-person showing.
            It filters tire-kickers, reduces calendar clutter, and keeps your listing fresh on every major
            platform. Texas buyers — especially out-of-state relocators — expect one.
          </p>
          <div className="rounded-xl px-4 py-4 text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
            <p className="text-2xl font-extrabold text-green-700 mb-1">87%</p>
            <p className="text-sm text-green-700">more views for listings with a virtual tour <span className="text-xs text-green-500">(NAR)</span></p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Your options</p>
            <div className="space-y-3">
              {VIRTUAL_TOUR_PROVIDERS.map(opt => (
                <div key={opt.id} className="rounded-xl border border-gray-200 px-4 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: opt.costBg, color: opt.costColor }}>{opt.cost}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{opt.description}</p>
                  {opt.link && (
                    <a href={opt.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold hover:underline" style={{ color: ACCENT }}>
                      {opt.linkLabel}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SetupModal>

      <SetupModal open={activeModal === 'method'} onClose={closeModal} title="🔑 Showing Method">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Choose your method</p>
            <div className="space-y-3">
              {SHOWING_METHOD_OPTIONS.map(opt => {
                const isSelected = showingMethod === opt.id
                return (
                  <button key={opt.id} type="button" onClick={() => setShowingMethod(opt.id)}
                    className="w-full text-left rounded-xl border px-4 py-4 transition-colors hover:bg-gray-50"
                    style={{ borderColor: isSelected ? ACCENT : '#e5e7eb', backgroundColor: isSelected ? '#f0fdf4' : 'white' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center" style={{ borderColor: isSelected ? ACCENT : '#d1d5db' }}>
                        {isSelected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT }} />}
                      </span>
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">{opt.description}</p>
                    {opt.link && (
                      <a href={opt.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        className="ml-6 mt-1.5 inline-block text-xs font-semibold hover:underline" style={{ color: ACCENT }}>
                        {opt.linkLabel}
                      </a>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">How to handle a showing request</p>
            <div className="space-y-2">
              {[
                "Get the buyer's name, agent name, and preferred date/time",
                'Confirm the appointment 24–48 hours in advance',
                'Be available but give them space during the tour',
                'Follow up within 24 hours to ask for feedback',
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
        </div>
      </SetupModal>

      <MilestoneCelebration
        isOpen={showMilestone}
        onClose={() => setShowMilestone(false)}
        onContinue={() => { setShowMilestone(false); onSelectStep && onSelectStep(6) }}
        phaseTitle="Market phase complete!"
        subtitle="Your home is live, showings are set up, and the title company is lined up. The hard part is behind you — now the offers come in."
        summaryItems={showMilestone ? buildMarketSummary() : []}
        continueLabel="Continue to Step 6: Offers →"
        badge="Phase 2 of 3 unlocked"
      />
    </>
  )
}
