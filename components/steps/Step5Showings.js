import { useState, useEffect, useCallback } from 'react'

const ACCENT = '#16a34a'

const DRAWERS = [
  { id: 'yardsign',    emoji: '🪧', label: 'Yard Sign' },
  { id: 'virtualtour', emoji: '🎥', label: 'Virtual Tour' },
  { id: 'method',      emoji: '🔑', label: 'Showing Method' },
  { id: 'buyers',      emoji: '👥', label: 'Buyer Contacts' },
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

const TOUR_TYPE_OPTIONS = [
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

const CONTACT_STATUS_OPTIONS = ['Interested', 'Toured', 'Offer Made', 'Passed']

const CONTACT_STATUS_COLORS = {
  Interested:   { bg: '#dbeafe', text: '#1d4ed8' },
  Toured:       { bg: '#f3e8ff', text: '#7c3aed' },
  'Offer Made': { bg: '#dcfce7', text: '#15803d' },
  Passed:       { bg: '#f3f4f6', text: '#6b7280' },
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
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step5: data }))
  } catch {}
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

const pillStyle = (active) =>
  active
    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }

export default function Step5Showings({ onComplete, isCompleted, onSelectStep }) {
  const [activeDrawer, setActiveDrawer] = useState(null)

  const [yardSignPhone, setYardSignPhone] = useState('')
  const [virtualTourUrl, setVirtualTourUrl] = useState('')
  const [virtualTourType, setVirtualTourType] = useState('')
  const [showingMethod, setShowingMethod] = useState('')
  const [contacts, setContacts] = useState([])
  const [showings, setShowings] = useState([])

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ date: '', time: '', agent: '', status: 'Scheduled', notes: '' })

  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', status: 'Interested' })

  useEffect(() => {
    const saved = loadStep5()
    setYardSignPhone(saved.yardSignPhone || '')
    setVirtualTourUrl(saved.virtualTourUrl || '')
    setVirtualTourType(saved.virtualTourType || '')
    setShowingMethod(saved.showingMethod || '')
    setContacts(saved.contacts || [])
    setShowings(saved.showings || [])
  }, [])

  useEffect(() => {
    saveStep5({ yardSignPhone, virtualTourUrl, virtualTourType, showingMethod, contacts, showings })
  }, [yardSignPhone, virtualTourUrl, virtualTourType, showingMethod, contacts, showings])

  const closeDrawer = useCallback(() => setActiveDrawer(null), [])

  useEffect(() => {
    if (!activeDrawer) return
    const handler = (e) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeDrawer, closeDrawer])

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const handleContactFormChange = (field, value) => setContactForm(prev => ({ ...prev, [field]: value }))

  const addShowing = () => {
    if (!form.date || !form.time) return
    setShowings(prev => [{ id: Date.now(), ...form }, ...prev])
    setForm({ date: '', time: '', agent: '', status: 'Scheduled', notes: '' })
  }

  const deleteShowing = (id) => setShowings(prev => prev.filter(s => s.id !== id))

  const addContact = () => {
    if (!contactForm.name.trim()) return
    setContacts(prev => [{ id: Date.now(), ...contactForm }, ...prev])
    setContactForm({ name: '', phone: '', email: '', status: 'Interested' })
    setContactFormOpen(false)
  }

  const deleteContact = (id) => setContacts(prev => prev.filter(c => c.id !== id))

  const updateContactStatus = (id, status) =>
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))

  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':')
    const hr = parseInt(h, 10)
    return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
  }

  const methodLabel = SHOWING_METHOD_OPTIONS.find(o => o.id === showingMethod)?.label || '—'

  return (
    <>
      <div className="flex max-w-4xl">

        {/* LEFT: main content */}
        <div className="flex-1 px-4 py-8 md:px-10 md:py-12 min-w-0">

          {/* Header */}
          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
            >
              Market
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Showings Command Center</h2>
          <p className="text-gray-600 leading-relaxed mb-10">
            <span className="font-semibold text-gray-800">Set up your showings.</span>{' '}
            Configure your listing, track buyer visits, and manage everything from one place.
          </p>

          {/* 4 Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {DRAWERS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDrawer(prev => prev === d.id ? null : d.id)}
                className="rounded-xl border px-4 py-3 text-sm font-semibold text-left hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: activeDrawer === d.id ? ACCENT : '#e5e7eb',
                  color: activeDrawer === d.id ? ACCENT : '#374151',
                }}
              >
                <span className="block text-xl mb-1">{d.emoji}</span>
                {d.label}
              </button>
            ))}
          </div>

          {/* Showing Log */}
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
                onClick={() => setFormOpen(o => !o)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                {formOpen ? 'Cancel' : '+ Log New Showing'}
              </button>
            </div>

            {formOpen && (
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                    <input type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                    <input type="time" value={form.time} onChange={e => handleFormChange('time', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer agent name</label>
                    <input type="text" value={form.agent} onChange={e => handleFormChange('agent', e.target.value)} placeholder="e.g. Sarah Johnson" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => handleFormChange('status', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition">
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
                  <input type="text" value={form.notes} onChange={e => handleFormChange('notes', e.target.value)} placeholder="e.g. Very interested, asked about the backyard" className={inputCls} />
                </div>
                <button
                  type="button"
                  onClick={addShowing}
                  disabled={!form.date || !form.time}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ACCENT }}
                >
                  Add showing
                </button>
              </div>
            )}

            {showings.length > 0 && (
              <div className="space-y-3">
                {showings.map(s => {
                  const colors = STATUS_COLORS[s.status] || STATUS_COLORS['Scheduled']
                  return (
                    <div key={s.id} className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' '}at {formatTime(s.time)}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
                            {s.status}
                          </span>
                        </div>
                        {s.agent && <p className="text-xs text-gray-500 mb-1">Agent: {s.agent}</p>}
                        {s.notes && <p className="text-xs text-gray-600 italic">{s.notes}</p>}
                      </div>
                      <button type="button" onClick={() => deleteShowing(s.id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors" aria-label="Delete showing">
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6 2a1 1 0 00-1 1H3a1 1 0 000 2h10a1 1 0 100-2h-2a1 1 0 00-1-1H6zM4 7a1 1 0 011 1v4a1 1 0 002 0V8a1 1 0 012 0v4a1 1 0 002 0V8a1 1 0 011-1 1 1 0 100-2H4a1 1 0 100 2z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {showings.length === 0 && !formOpen && (
              <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
                <p className="text-sm text-gray-400">No showings logged yet.</p>
                <button type="button" onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                  Log your first showing
                </button>
              </div>
            )}
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
                  <button type="button" onClick={() => onComplete(false)} className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors">
                    Undo
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectStep && onSelectStep(6)}
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: ACCENT }}
                >
                  Next up: Review &amp; Negotiate Offers →
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

        {/* RIGHT: sticky panel */}
        <aside className="hidden lg:block w-52 shrink-0 pt-8 pr-6">
          <div className="sticky top-8 space-y-6">

            {/* Safety Protocol */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">🔒 Safety Protocol</p>
              <ol className="space-y-2.5">
                {SAFETY_ITEMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ backgroundColor: ACCENT, fontSize: '10px' }}>
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {/* Quick Setup */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Quick Setup</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <span>📞</span>
                  <span className="text-gray-500">Sign phone:</span>
                  <span className={yardSignPhone ? 'text-gray-800 font-medium' : 'text-gray-300'}>
                    {yardSignPhone || '—'}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>🎥</span>
                  <span className="text-gray-500">Tour:</span>
                  <span className={virtualTourUrl ? 'text-green-600 font-medium' : 'text-gray-300'}>
                    {virtualTourUrl ? '✓ Linked' : '—'}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>🔑</span>
                  <span className="text-gray-500">Method:</span>
                  <span className={showingMethod ? 'text-gray-800 font-medium' : 'text-gray-300'}>
                    {showingMethod ? methodLabel : '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* Slide-over drawers */}
      {activeDrawer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={closeDrawer} />
          <div
            className="fixed right-0 top-0 h-full z-50 bg-white shadow-2xl overflow-y-auto"
            style={{ width: 'min(420px, calc(100vw - 40px))', transition: 'transform 300ms ease' }}
          >

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {DRAWERS.find(d => d.id === activeDrawer)?.emoji}{' '}
                {DRAWERS.find(d => d.id === activeDrawer)?.label}
              </h3>
              <button type="button" onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">

              {/* ===== YARD SIGN ===== */}
              {activeDrawer === 'yardsign' && (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">What goes on your sign</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <p><span className="font-semibold">"For Sale By Owner"</span> — required on every sign</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 font-bold mt-0.5">✓</span>
                        <p>Your phone number — <span className="text-gray-500">your primary lead source</span></p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-300 font-bold mt-0.5">○</span>
                        <p>Price — <span className="text-gray-500">optional. Adding a price gets more serious calls; skipping it gets more curious ones.</span></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your phone number for the sign</label>
                    <input
                      type="tel"
                      value={yardSignPhone}
                      onChange={e => setYardSignPhone(e.target.value)}
                      placeholder="(512) 555-0123"
                      className={inputCls}
                    />
                    <p className="text-xs text-gray-400 mt-1">Updates the Quick Setup panel instantly</p>
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
                      <a href="https://www.amazon.com/s?k=fsbo+yard+sign" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Amazon</p>
                          <p className="text-xs text-gray-500">$20–50, delivered in 2 days</p>
                        </div>
                        <span className="text-gray-400 text-sm">→</span>
                      </a>
                      <a href="https://www.homedepot.com" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Home Depot</p>
                          <p className="text-xs text-gray-500">$30–80, pick up today</p>
                        </div>
                        <span className="text-gray-400 text-sm">→</span>
                      </a>
                      <div className="px-4 py-3 rounded-xl border border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">Local print shop</p>
                        <p className="text-xs text-gray-500">$50–100 for a custom sign with your design — search "sign printing near me"</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ===== VIRTUAL TOUR ===== */}
              {activeDrawer === 'virtualtour' && (
                <>
                  <div className="rounded-xl px-4 py-4 text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                    <p className="text-2xl font-extrabold text-green-700 mb-1">87%</p>
                    <p className="text-sm text-green-700">more views for listings with a virtual tour <span className="text-xs text-green-500">(NAR)</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your tour URL</label>
                    <input
                      type="url"
                      value={virtualTourUrl}
                      onChange={e => setVirtualTourUrl(e.target.value)}
                      placeholder="https://..."
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Tour type</p>
                    <div className="flex flex-wrap gap-2">
                      {TOUR_TYPE_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVirtualTourType(opt.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                          style={pillStyle(virtualTourType === opt.id)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Your options</p>
                    <div className="space-y-3">
                      {TOUR_TYPE_OPTIONS.map(opt => (
                        <div key={opt.id} className="rounded-xl border border-gray-200 px-4 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: opt.costBg, color: opt.costColor }}>
                              {opt.cost}
                            </span>
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
                </>
              )}

              {/* ===== SHOWING METHOD ===== */}
              {activeDrawer === 'method' && (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Choose your method</p>
                    <div className="space-y-3">
                      {SHOWING_METHOD_OPTIONS.map(opt => {
                        const isSelected = showingMethod === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setShowingMethod(opt.id)}
                            className="w-full text-left rounded-xl border px-4 py-4 transition-colors hover:bg-gray-50"
                            style={{ borderColor: isSelected ? ACCENT : '#e5e7eb', backgroundColor: isSelected ? '#f0fdf4' : 'white' }}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                style={{ borderColor: isSelected ? ACCENT : '#d1d5db' }}
                              >
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT }} />
                                )}
                              </span>
                              <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                            </div>
                            <p className="text-xs text-gray-600 ml-6">{opt.description}</p>
                            {opt.link && (
                              <a
                                href={opt.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="ml-6 mt-1.5 inline-block text-xs font-semibold hover:underline"
                                style={{ color: ACCENT }}
                              >
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
                        'Get the buyer\'s name, agent name, and preferred date/time',
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
                </>
              )}

              {/* ===== BUYER CONTACTS ===== */}
              {activeDrawer === 'buyers' && (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Track everyone who&apos;s expressed interest.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Calendar sync coming soon</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContactFormOpen(o => !o)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {contactFormOpen ? 'Cancel' : '+ Add'}
                    </button>
                  </div>

                  {contactFormOpen && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                        <input type="text" value={contactForm.name} onChange={e => handleContactFormChange('name', e.target.value)} placeholder="e.g. John Smith" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                        <input type="tel" value={contactForm.phone} onChange={e => handleContactFormChange('phone', e.target.value)} placeholder="(512) 555-0000" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                        <input type="email" value={contactForm.email} onChange={e => handleContactFormChange('email', e.target.value)} placeholder="john@email.com" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                        <div className="flex flex-wrap gap-2">
                          {CONTACT_STATUS_OPTIONS.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleContactFormChange('status', s)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors"
                              style={pillStyle(contactForm.status === s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addContact}
                        disabled={!contactForm.name.trim()}
                        className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Save contact
                      </button>
                    </div>
                  )}

                  {contacts.length > 0 && (
                    <div className="space-y-3">
                      {contacts.map(c => {
                        const colors = CONTACT_STATUS_COLORS[c.status] || CONTACT_STATUS_COLORS['Interested']
                        return (
                          <div key={c.id} className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                                {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                                {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                              </div>
                              <button type="button" onClick={() => deleteContact(c.id)} className="text-gray-300 hover:text-red-400 transition-colors" aria-label="Delete contact">
                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M6 2a1 1 0 00-1 1H3a1 1 0 000 2h10a1 1 0 100-2h-2a1 1 0 00-1-1H6zM4 7a1 1 0 011 1v4a1 1 0 002 0V8a1 1 0 012 0v4a1 1 0 002 0V8a1 1 0 011-1 1 1 0 100-2H4a1 1 0 100 2z" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {CONTACT_STATUS_OPTIONS.map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => updateContactStatus(c.id, s)}
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors"
                                  style={c.status === s
                                    ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.bg }
                                    : { backgroundColor: 'white', color: '#9ca3af', borderColor: '#e5e7eb' }
                                  }
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {contacts.length === 0 && !contactFormOpen && (
                    <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
                      <p className="text-sm text-gray-400">No contacts yet.</p>
                      <button type="button" onClick={() => setContactFormOpen(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                        Add your first interested buyer
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </>
      )}
    </>
  )
}
