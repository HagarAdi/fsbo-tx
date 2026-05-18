import { useState, useEffect } from 'react'
import { notifyStepDataChange } from '../../utils/notifyStepData'
import MilestoneCelebration from '../MilestoneCelebration'
import SetupModal from '../SetupModal'

const ACCENT = '#16a34a'

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

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No Show']

const STATUS_COLORS = {
  Scheduled:  { bg: '#dbeafe', text: '#1d4ed8' },
  Completed:  { bg: '#dcfce7', text: '#15803d' },
  Cancelled:  { bg: '#fee2e2', text: '#dc2626' },
  'No Show':  { bg: '#fef3c7', text: '#92400e' },
}

function loadStep5() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step5 || {}
  } catch { return {} }
}

function saveStep5(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    const merged = { ...(all.step5 || {}), ...data }
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step5: merged }))
    notifyStepDataChange()
  } catch {}
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

export default function Step5Showings({ onSelectStep }) {
  const [activeModal, setActiveModal] = useState(null)

  const [showingMethod, setShowingMethod] = useState('')
  const [showings, setShowings]           = useState([])

  const [expandedShowingId, setExpandedShowingId] = useState(null)
  const [orderSnapshot, setOrderSnapshot] = useState(null)
  const [logView, setLogView] = useState('list')
  const [panelShowingId, setPanelShowingId] = useState(null)
  const openPanel = (id) => setPanelShowingId(id)
  const closePanel = () => setPanelShowingId(null)
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [showMilestone, setShowMilestone] = useState(false)

  const sortKey = (s) => `${s.date || '9999-99-99'} ${s.time || '99:99'}`
  const sortShowings = (arr) => [...arr].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))

  const toggleExpand = (id) => {
    if (expandedShowingId === id) {
      setExpandedShowingId(null)
      setOrderSnapshot(null)
    } else {
      setOrderSnapshot(sortShowings(showings).map(s => s.id))
      setExpandedShowingId(id)
    }
  }

  const displayShowings = orderSnapshot
    ? [
        ...orderSnapshot.map(id => showings.find(s => s.id === id)).filter(Boolean),
        ...showings.filter(s => !orderSnapshot.includes(s.id)),
      ]
    : sortShowings(showings)

  const calendarMonthLabel = new Date(calendarCursor.y, calendarCursor.m, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInCalendarMonth = new Date(calendarCursor.y, calendarCursor.m + 1, 0).getDate()
  const firstWeekdayOfCalendar = new Date(calendarCursor.y, calendarCursor.m, 1).getDay()
  const showingsListByDate = showings.reduce((acc, s) => {
    if (!s.date) return acc
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})
  const isoForCell = (day) => {
    const mm = String(calendarCursor.m + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${calendarCursor.y}-${mm}-${dd}`
  }
  const goPrevMonth = () => setCalendarCursor(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })
  const goNextMonth = () => setCalendarCursor(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })
  const goThisMonth = () => {
    const d = new Date()
    setCalendarCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  const buildMarketSummary = () => {
    let listingLabel = 'Listing in progress'
    const showingLabel = showingMethod || 'Method not yet selected'
    let titleLabel = 'Title company not yet set'
    try {
      const data = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
      const tc = data.step4?.titleCompany || data.step5?.titleCompany
      if (tc?.name) titleLabel = tc.name
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
  }, [])

  useEffect(() => {
    saveStep5({ showingMethod, showings })
  }, [showingMethod, showings])

  const addShowing = () => {
    const newShowing = { id: Date.now(), date: '', time: '', agent: '', status: 'Scheduled', notes: '' }
    setShowings(prev => [newShowing, ...prev])
    if (logView === 'calendar') {
      openPanel(newShowing.id)
    } else {
      setExpandedShowingId(newShowing.id)
    }
  }

  const panelShowing = panelShowingId ? showings.find(s => s.id === panelShowingId) : null

  const updateShowing = (id, field, value) =>
    setShowings(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))

  const deleteShowing = (id) => {
    setShowings(prev => prev.filter(s => s.id !== id))
    if (expandedShowingId === id) {
      setExpandedShowingId(null)
      setOrderSnapshot(null)
    }
    if (panelShowingId === id) closePanel()
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

          {/* Showing method picker */}
          <button
            type="button"
            onClick={() => setActiveModal('method')}
            className="mb-8 w-full sm:w-auto inline-flex items-center gap-3 rounded-xl border border-gray-200 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🔑</span>
            <span>
              <span className="block text-sm font-semibold text-gray-800">Showing Method</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {showingMethod
                  ? `Selected: ${SHOWING_METHOD_OPTIONS.find(o => o.id === showingMethod)?.label || showingMethod}`
                  : 'Choose how buyers will tour the home'}
              </span>
            </span>
          </button>

          <div>
                  <section className="mb-12">
                    <div className="flex items-start justify-between mb-4">
                      <p className="text-sm text-gray-500">
                        {showings.length} showing{showings.length !== 1 ? 's' : ''} logged
                      </p>
                      <button
                        type="button"
                        onClick={addShowing}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90 touch-manipulation"
                        style={{ backgroundColor: ACCENT }}
                      >
                        + Log New Showing
                      </button>
                    </div>

                    {showings.length > 0 && logView === 'list' && (
                      <div className="space-y-3">
                        {displayShowings.map(s => {
                          const colors = STATUS_COLORS[s.status] || STATUS_COLORS['Scheduled']
                          const isExpanded = expandedShowingId === s.id
                          const whenLabel = formatShowingWhen(s.date, s.time) || 'New showing'
                          return (
                            <div key={s.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                              <div className="px-5 py-4 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(s.id)}
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
                                    className="p-2.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
                                    aria-label="Delete showing"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 5h10M6.5 5V3.5a1 1 0 011-1h1a1 1 0 011 1V5M4.5 5l.7 8.1a1 1 0 001 .9h3.6a1 1 0 001-.9L11.5 5M6.8 7.5v4M9.2 7.5v4" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(s.id)}
                                    className="p-2.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
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
                                  <div className="mt-4">
                                    <button
                                      type="button"
                                      onClick={() => setActiveModal('comingSoon')}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4.5" width="14" height="13" rx="2" />
                                        <path d="M3 8h14M7 2.5v4M13 2.5v4" />
                                      </svg>
                                      Add to calendar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {showings.length === 0 && logView === 'list' && (
                      <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
                        <p className="text-sm text-gray-400">No showings logged yet.</p>
                        <button type="button" onClick={addShowing} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 touch-manipulation" style={{ backgroundColor: ACCENT }}>
                          Log your first showing
                        </button>
                      </div>
                    )}

                    {logView === 'calendar' && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={goPrevMonth} aria-label="Previous month" className="w-10 h-10 rounded-md text-gray-500 hover:bg-gray-100 transition-colors touch-manipulation">‹</button>
                            <button type="button" onClick={goNextMonth} aria-label="Next month" className="w-10 h-10 rounded-md text-gray-500 hover:bg-gray-100 transition-colors touch-manipulation">›</button>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{calendarMonthLabel}</p>
                          <button type="button" onClick={goThisMonth} className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-2 py-2 rounded-md hover:bg-gray-100 touch-manipulation">
                            Today
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-gray-100 text-center">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="bg-gray-50 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{d}</div>
                          ))}
                          {Array.from({ length: firstWeekdayOfCalendar }).map((_, i) => (
                            <div key={`pad-${i}`} className="bg-white aspect-square" />
                          ))}
                          {Array.from({ length: daysInCalendarMonth }).map((_, i) => {
                            const day = i + 1
                            const iso = isoForCell(day)
                            const dayShowings = showingsListByDate[iso] || []
                            const today = new Date()
                            const isToday = today.getFullYear() === calendarCursor.y && today.getMonth() === calendarCursor.m && today.getDate() === day
                            const visible = dayShowings.slice(0, 2)
                            const overflow = dayShowings.length - visible.length
                            return (
                              <div key={day} className="bg-white aspect-square flex flex-col items-start p-1.5 gap-1">
                                <span className={`text-xs ${isToday ? 'font-bold text-green-700' : 'text-gray-600'}`}>{day}</span>
                                <div className="flex flex-wrap gap-1">
                                  {visible.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => openPanel(s.id)}
                                      aria-label={`Open showing on ${iso}`}
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                                      style={{ backgroundColor: ACCENT }}
                                    >
                                      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 7l6-4 6 4v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" />
                                      </svg>
                                    </button>
                                  ))}
                                  {overflow > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => openPanel(dayShowings[2].id)}
                                      className="h-5 px-1.5 rounded-full text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                      +{overflow}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setLogView(v => v === 'list' ? 'calendar' : 'list')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4.5" width="14" height="13" rx="2" />
                          <path d="M3 8h14M7 2.5v4M13 2.5v4" />
                        </svg>
                        {logView === 'list' ? 'Show in calendar view' : 'Show as list'}
                      </button>
                    </div>
                  </section>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowMilestone(true)}
                      className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 touch-manipulation"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Move to the next step: Review &amp; Negotiate Offers →
                    </button>
                  </div>
                </div>

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

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Checklist</p>
              <p className="text-xs text-gray-400 mb-3 leading-snug">Pick how buyers will tour your home</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className={showingMethod ? 'text-green-500' : 'text-gray-300'} style={{ fontSize: 13 }}>{showingMethod ? '✓' : '○'}</span>
                  <span className={showingMethod ? 'text-gray-700 font-medium' : 'text-gray-400'}>🔑 Showing method</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* Showing method modal */}
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

      <SetupModal open={activeModal === 'comingSoon'} onClose={closeModal} title="🗓️ Add to calendar">
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Calendar export is coming soon — we&apos;ll let you push showings to Google Calendar, Apple Calendar, and Outlook with one click.
          </p>
          <p className="text-xs text-gray-500">
            In the meantime, keep using the date and time fields above so the showing is tracked here.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 touch-manipulation"
              style={{ backgroundColor: ACCENT }}
            >
              Got it
            </button>
          </div>
        </div>
      </SetupModal>

      {panelShowing && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closePanel} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Showing</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {formatShowingWhen(panelShowing.date, panelShowing.time) || 'New showing'}
                </p>
              </div>
              <button type="button" onClick={closePanel} aria-label="Close" className="w-9 h-9 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input type="date" value={panelShowing.date} onChange={e => updateShowing(panelShowing.id, 'date', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input type="time" value={panelShowing.time} onChange={e => updateShowing(panelShowing.id, 'time', e.target.value)} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer agent name</label>
                  <input type="text" value={panelShowing.agent} onChange={e => updateShowing(panelShowing.id, 'agent', e.target.value)} placeholder="e.g. Sarah Johnson" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select value={panelShowing.status} onChange={e => updateShowing(panelShowing.id, 'status', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                    {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
                  <input type="text" value={panelShowing.notes} onChange={e => updateShowing(panelShowing.id, 'notes', e.target.value)} placeholder="e.g. Very interested, asked about the backyard" className={inputCls} />
                </div>
              </div>
            </div>
            <footer className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <button type="button" onClick={() => deleteShowing(panelShowing.id)} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                Delete
              </button>
              <button type="button" onClick={closePanel} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 touch-manipulation" style={{ backgroundColor: ACCENT }}>
                Done
              </button>
            </footer>
          </aside>
        </div>
      )}

      <MilestoneCelebration
        isOpen={showMilestone}
        onClose={() => setShowMilestone(false)}
        onContinue={() => { setShowMilestone(false); onSelectStep && onSelectStep(6) }}
        phaseTitle="Market phase complete!"
        subtitle="Your home is live, showings are set up, and the title company is lined up. The hard part is behind you — now the offers come in."
        summaryItems={showMilestone ? buildMarketSummary() : []}
        continueLabel="Move to the next step: Review & Negotiate Offers →"
        badge="Phase 2 of 3 unlocked"
      />
    </>
  )
}
