import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'

const WIDGETS = [
  { id: 'yardsign',     emoji: '🪧', title: 'Yard Sign' },
  { id: 'virtualtour',  emoji: '🎥', title: 'Virtual Tour' },
  { id: 'safety',       emoji: '🔒', title: 'Safety Check' },
  { id: 'showingrules', emoji: '📋', title: 'Showing Rules' },
]

const SAFETY_ITEMS = [
  { id: 'never-alone',      label: 'Never show alone — have someone present' },
  { id: 'verify-agent',     label: 'Verify buyer is working with a licensed agent' },
  { id: 'remove-valuables', label: 'Remove valuables, meds, and personal documents' },
  { id: 'no-personal',      label: "Don't share personal reasons why you're selling" },
  { id: 'trust-instincts',  label: "Trust your instincts — it's okay to decline a showing" },
]

const SHOWING_METHOD_OPTIONS = [
  { id: 'self',    label: 'Show it yourself' },
  { id: 'lockbox', label: 'Lockbox' },
  { id: 'service', label: 'Showing service' },
]

const TOUR_TYPE_OPTIONS = [
  { id: 'matterport', label: 'Matterport' },
  { id: 'zillow3d',   label: 'Zillow 3D' },
  { id: 'youtube',    label: 'YouTube' },
]

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No Show']

const STATUS_COLORS = {
  Scheduled:  { bg: '#dbeafe', text: '#1d4ed8' },
  Completed:  { bg: '#dcfce7', text: '#15803d' },
  Cancelled:  { bg: '#fee2e2', text: '#dc2626' },
  'No Show':  { bg: '#fef3c7', text: '#92400e' },
}

const EMPTY_RULES = { noticeHours: '', availableHours: '', method: '', specialInstructions: '' }

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

function Chevron({ open }) {
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

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

export default function Step5Showings({ onComplete, isCompleted, onSelectStep }) {
  const [openWidget, setOpenWidget] = useState(null)

  const [yardSignPhone, setYardSignPhone] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStep5().yardSignPhone || ''
  })

  const [virtualTourUrl, setVirtualTourUrl] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStep5().virtualTourUrl || ''
  })

  const [virtualTourType, setVirtualTourType] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStep5().virtualTourType || ''
  })

  const [safetyChecked, setSafetyChecked] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep5().safetyChecked || []
  })

  const [showingRules, setShowingRules] = useState(() => {
    if (typeof window === 'undefined') return EMPTY_RULES
    return loadStep5().showingRules || EMPTY_RULES
  })

  const [showings, setShowings] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep5().showings || []
  })

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ date: '', time: '', agent: '', status: 'Scheduled', notes: '' })

  useEffect(() => {
    saveStep5({ yardSignPhone, virtualTourUrl, virtualTourType, safetyChecked, showingRules, showings })
  }, [yardSignPhone, virtualTourUrl, virtualTourType, safetyChecked, showingRules, showings])

  const toggleWidget = (id) => setOpenWidget(prev => prev === id ? null : id)

  const toggleSafetyItem = (id) =>
    setSafetyChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addShowing = () => {
    if (!form.date || !form.time) return
    setShowings(prev => [{ id: Date.now(), ...form }, ...prev])
    setForm({ date: '', time: '', agent: '', status: 'Scheduled', notes: '' })
  }

  const deleteShowing = (id) => setShowings(prev => prev.filter(s => s.id !== id))

  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':')
    const hr = parseInt(h, 10)
    return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
  }

  const pillStyle = (active) =>
    active
      ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 max-w-3xl">

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
        <span className="font-semibold text-gray-800">Configure your showings setup.</span>{' '}
        Set your rules, track visits, and manage everything from one place.
      </p>

      {/* Widget Grid */}
      <section className="mb-10">
        <div className="grid grid-cols-2 gap-4 items-start">
          {WIDGETS.map(widget => {
            const isOpen = openWidget === widget.id
            return (
              <div
                key={widget.id}
                className="rounded-xl border bg-white overflow-hidden transition-colors"
                style={{ borderColor: isOpen ? ACCENT : '#e5e7eb' }}
              >
                <button
                  type="button"
                  onClick={() => toggleWidget(widget.id)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{widget.emoji}</span>
                    <span className="text-sm font-semibold text-gray-900">{widget.title}</span>
                  </div>
                  <Chevron open={isOpen} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3">

                    {widget.id === 'yardsign' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Your phone number</label>
                          <input
                            type="tel"
                            value={yardSignPhone}
                            onChange={e => setYardSignPhone(e.target.value)}
                            placeholder="(512) 555-0123"
                            className={inputCls}
                          />
                          <p className="text-xs text-gray-400 mt-1">This goes on your yard sign</p>
                        </div>
                        <a
                          href="https://amazon.com/s?k=fsbo+yard+sign"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Buy on Amazon →
                        </a>
                      </>
                    )}

                    {widget.id === 'virtualtour' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Tour URL</label>
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
                      </>
                    )}

                    {widget.id === 'safety' && (
                      <div className="space-y-2.5">
                        {SAFETY_ITEMS.map(item => (
                          <label key={item.id} className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={safetyChecked.includes(item.id)}
                              onChange={() => toggleSafetyItem(item.id)}
                              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300"
                              style={{ accentColor: ACCENT }}
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {widget.id === 'showingrules' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Notice required</label>
                          <input
                            type="text"
                            value={showingRules.noticeHours}
                            onChange={e => setShowingRules(p => ({ ...p, noticeHours: e.target.value }))}
                            placeholder="e.g. 2 hours"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Available hours</label>
                          <input
                            type="text"
                            value={showingRules.availableHours}
                            onChange={e => setShowingRules(p => ({ ...p, availableHours: e.target.value }))}
                            placeholder="e.g. 9am–8pm daily"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">Showing method</p>
                          <div className="flex flex-wrap gap-2">
                            {SHOWING_METHOD_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setShowingRules(p => ({ ...p, method: opt.id }))}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                                style={pillStyle(showingRules.method === opt.id)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Special instructions</label>
                          <textarea
                            value={showingRules.specialInstructions}
                            onChange={e => setShowingRules(p => ({ ...p, specialInstructions: e.target.value }))}
                            placeholder="e.g. Ring doorbell, dog in backyard"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                          />
                        </div>
                      </>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

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

        {/* Inline form */}
        {formOpen && (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => handleFormChange('date', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => handleFormChange('time', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer agent name</label>
                <input
                  type="text"
                  value={form.agent}
                  onChange={e => handleFormChange('agent', e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => handleFormChange('notes', e.target.value)}
                placeholder="e.g. Very interested, asked about the backyard"
                className={inputCls}
              />
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

        {/* Showing list */}
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
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {s.status}
                      </span>
                    </div>
                    {s.agent && <p className="text-xs text-gray-500 mb-1">Agent: {s.agent}</p>}
                    {s.notes && <p className="text-xs text-gray-600 italic">{s.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteShowing(s.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Delete showing"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 2a1 1 0 00-1 1H3a1 1 0 000 2h10a1 1 0 100-2h-2a1 1 0 00-1-1H6zM4 7a1 1 0 011 1v4a1 1 0 002 0V8a1 1 0 012 0v4a1 1 0 002 0V8a1 1 0 011-1 1 1 0 100-2H4a1 1 0 100 2z" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {showings.length === 0 && !formOpen && (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-400">No showings logged yet.</p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Log your first showing
            </button>
          </div>
        )}
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
  )
}
