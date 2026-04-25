import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'
const BLUE = '#1d4ed8'

const PREP_CHECKLIST = [
  { id: 'ac',      label: 'Set AC to 74°F',                             priority: 'must',        note: 'Texas buyers notice immediately if it\'s stuffy' },
  { id: 'lights',  label: 'Turn on every light',                        priority: 'must',        note: 'Bright homes feel larger and more welcoming' },
  { id: 'blinds',  label: 'Open all blinds and curtains',               priority: 'must',        note: 'Natural light is a top buyer priority' },
  { id: 'pets',    label: 'Remove pets and all pet items',              priority: 'must',        note: 'Not all buyers are pet lovers — don\'t risk it' },
  { id: 'trash',   label: 'Empty all trash cans',                       priority: 'must',        note: 'Smells kill deals' },
  { id: 'leave',   label: 'Give buyers space during showings',           priority: 'must',        note: 'Buyers need to feel comfortable exploring and talking openly — don\'t hover' },
  { id: 'scent',   label: 'Add subtle scent — vanilla or citrus',      priority: 'recommended', note: 'Scent triggers emotional memory' },
  { id: 'flowers', label: 'Fresh flowers on kitchen counter',           priority: 'recommended', note: 'Small touch, big impact on photos and visits' },
  { id: 'sheet',   label: 'Leave a printed home facts sheet',           priority: 'recommended', note: 'Roof age, HVAC age, utility averages — buyers always ask' },
]

const SHOWING_METHODS = [
  {
    id: 'self',
    label: 'You show it yourself',
    description: 'Most FSBO sellers do this. Be present but not hovering — let buyers explore freely. Best for getting direct feedback.',
    note: null,
  },
  {
    id: 'lockbox',
    label: 'Lockbox',
    description: 'Buyers\' agents show your home themselves using a combo lockbox. More showings, less scheduling. Recommended for busy sellers.',
    note: 'Buy a quality lockbox at Home Depot for $40–80',
  },
  {
    id: 'service',
    label: 'Showing service',
    description: 'Companies like ShowingTime manage scheduling and access for ~$30–50/month. Most professional option.',
    note: null,
    link: { label: 'showingtime.com', url: 'https://showingtime.com' },
  },
]

const SAFETY_TIPS = [
  'Never show alone if possible — have a friend or family member present',
  'Always verify the buyer is working with a licensed agent before showing',
  'Remove valuables, medications, and personal documents before every showing',
  'Don\'t share personal reasons why you\'re selling',
  'Trust your instincts — it\'s okay to decline a showing request',
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
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step5: data }))
  } catch {}
}

export default function Step5Showings({ onComplete, isCompleted, onSelectStep }) {
  const [checkedItems, setCheckedItems] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep5().showingPrepChecked || []
  })

  const [showingMethod, setShowingMethod] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStep5().showingMethod || ''
  })

  const [showings, setShowings] = useState(() => {
    if (typeof window === 'undefined') return []
    return loadStep5().showings || []
  })

  const [safetyOpen, setSafetyOpen] = useState(false)
  const [openHouseOpen, setOpenHouseOpen] = useState(false)

  const [form, setForm] = useState({ date: '', time: '', agent: '', status: 'Scheduled', notes: '' })

  useEffect(() => {
    saveStep5({ showingPrepChecked: checkedItems, showingMethod, showings })
  }, [checkedItems, showingMethod, showings])

  const toggleCheck = (id) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleMethodSelect = (id) => setShowingMethod(id)

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addShowing = () => {
    if (!form.date || !form.time) return
    setShowings(prev => [
      ...prev,
      { id: Date.now(), date: form.date, time: form.time, agent: form.agent, status: form.status, notes: form.notes },
    ])
    setForm({ date: '', time: '', agent: '', status: 'Scheduled', notes: '' })
  }

  const deleteShowing = (id) => setShowings(prev => prev.filter(s => s.id !== id))

  const mustCount = PREP_CHECKLIST.filter(i => i.priority === 'must').length
  const mustDone  = PREP_CHECKLIST.filter(i => i.priority === 'must' && checkedItems.includes(i.id)).length

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 max-w-3xl">

      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#dbeafe', color: BLUE }}
        >
          Market
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Showings &amp; Open Houses</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        Showings are your home&apos;s audition. Every detail matters — from the temperature when buyers
        walk in to how easy it is to schedule a visit.
      </p>

      {/* Prep checklist */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your showing prep checklist</h3>
        <p className="text-sm text-gray-500 mb-6">
          Do these before every single showing — buyers notice everything.
        </p>

        {mustDone === mustCount && mustCount > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
            style={{ backgroundColor: '#f0fdf4', color: ACCENT }}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill={ACCENT} />
              <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All must-do items checked — you&apos;re ready to show!
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {PREP_CHECKLIST.map(({ id, label, priority, note }) => {
            const checked = checkedItems.includes(id)
            return (
              <label
                key={id}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 flex-shrink-0"
                  style={{ accentColor: ACCENT }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-sm font-medium ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {label}
                    </span>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                      style={priority === 'must'
                        ? { backgroundColor: '#fee2e2', color: '#dc2626' }
                        : { backgroundColor: '#fef3c7', color: '#92400e' }}
                    >
                      {priority === 'must' ? 'Must Do' : 'Recommended'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{note}</p>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {/* Yard sign */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Get your yard sign up 🪧</h3>
        <p className="text-sm text-gray-500 mb-6">
          A yard sign generates calls from neighbors, drive-by buyers, and people who weren&apos;t even looking.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">What to include</p>
            <p className="text-sm text-gray-600">&ldquo;For Sale By Owner&rdquo; + your phone number. Price is optional.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Where to buy</p>
            <p className="text-sm text-gray-600">Amazon ($20–50), Home Depot ($30–80), or local print shop ($50–100) for custom signs</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Placement</p>
            <p className="text-sm text-gray-600">Street-facing AND corner of your block if possible</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">HOA warning</p>
            <p className="text-sm text-amber-700">⚠️ Check your HOA rules — some Texas HOAs restrict yard sign size or placement</p>
          </div>
        </div>
      </section>

      {/* Who conducts the showing */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">How will you handle showings?</h3>
        <p className="text-sm text-gray-500 mb-6">Pick the approach that works best for you.</p>
        <div className="space-y-3">
          {SHOWING_METHODS.map(({ id, label, description, note, link }) => {
            const selected = showingMethod === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleMethodSelect(id)}
                className="w-full text-left rounded-xl border-2 px-5 py-4 transition-colors"
                style={{
                  borderColor: selected ? ACCENT : '#e5e7eb',
                  backgroundColor: selected ? '#f0fdf4' : '#fff',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: selected ? ACCENT : '#d1d5db' }}
                  >
                    {selected && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                    {note && (
                      <p className="mt-2 text-xs text-gray-500 font-medium">{note}</p>
                    )}
                    {link && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="mt-2 inline-block text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ color: BLUE }}
                      >
                        {link.label} →
                      </a>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Safety tips */}
      <section className="mb-12">
        <button
          type="button"
          onClick={() => setSafetyOpen(o => !o)}
          className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Stay safe during showings 🔒</h3>
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform"
            style={{ transform: safetyOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {safetyOpen && (
          <div className="mt-1 rounded-xl border border-gray-200 bg-white px-5 py-4 divide-y divide-gray-100">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 text-base flex-shrink-0">🛡️</span>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Showing tracker */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Track your showings</h3>
        <p className="text-sm text-gray-500 mb-6">Keep a log of who visited and when.</p>

        {/* Add form */}
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleFormChange('date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => handleFormChange('time', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer agent name</label>
              <input
                type="text"
                value={form.agent}
                onChange={e => handleFormChange('agent', e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
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
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
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

        {/* Showings list */}
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
                        {' '}at{' '}
                        {s.time ? (() => {
                          const [h, m] = s.time.split(':')
                          const hr = parseInt(h, 10)
                          return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
                        })() : ''}
                      </span>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {s.status}
                      </span>
                    </div>
                    {s.agent && (
                      <p className="text-xs text-gray-500 mb-1">Agent: {s.agent}</p>
                    )}
                    {s.notes && (
                      <p className="text-xs text-gray-600 italic">{s.notes}</p>
                    )}
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

        {showings.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No showings logged yet.</p>
        )}
      </section>

      {/* Virtual tour */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add a virtual tour 🎥</h3>
        <p className="text-sm text-gray-500 mb-6">
          Buyers who take a virtual tour are 60% more likely to make an offer.
        </p>
        <div className="space-y-3">
          {[
            {
              label: 'Matterport 3D Tour',
              cost: '$150–300 hired',
              costPaid: true,
              description: 'The gold standard. Professional 3D walkthrough buyers can explore online.',
              link: { label: 'Get quote →', url: 'https://thumbtack.com' },
            },
            {
              label: 'Zillow 3D Home App',
              cost: 'Free',
              costPaid: false,
              description: 'Shoot it yourself with Zillow\'s free app. Good enough for most listings.',
              link: { label: 'Get the app →', url: 'https://zillow.com/z3d' },
            },
            {
              label: 'Simple video walkthrough',
              cost: 'Free',
              costPaid: false,
              description: 'Walk through your home on video, post to YouTube, add link to your listing. Takes 30 minutes.',
              link: null,
            },
          ].map(({ label, cost, costPaid, description, link }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={costPaid
                      ? { backgroundColor: '#fef3c7', color: '#92400e' }
                      : { backgroundColor: '#dcfce7', color: '#15803d' }}
                  >
                    {cost}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              {link && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-80"
                  style={{ color: ACCENT }}
                >
                  {link.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Open house planner */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Hosting an open house? 🏠</h3>
        <p className="text-sm text-gray-500 mb-6">
          Open houses work best on Sunday 1–4pm. Here&apos;s how to make yours count.
        </p>
        <button
          type="button"
          onClick={() => setOpenHouseOpen(o => !o)}
          className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-900">Open house day checklist</span>
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform"
            style={{ transform: openHouseOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {openHouseOpen && (
          <div className="mt-1 rounded-xl border border-gray-200 bg-white px-5 py-4 divide-y divide-gray-100">
            {[
              { text: 'Follow your full showing prep checklist', isLink: true },
              { text: 'Print 20+ flyers with photos, price, and your contact info' },
              { text: 'Post on Facebook Marketplace, Nextdoor, and HAR.com 3 days before' },
              { text: 'Put directional signs at nearby intersections' },
              { text: 'Have a sign-in sheet for visitor names and emails' },
              { text: 'Prepare a home facts sheet with: sqft, beds/baths, year built, roof age, HVAC age, utility averages' },
              { text: 'Have your disclosure documents ready to show' },
              { text: 'Follow up with every visitor within 24 hours' },
            ].map(({ text, isLink }, i) => (
              <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 text-base flex-shrink-0">✓</span>
                {isLink ? (
                  <p className="text-sm text-gray-700">
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="font-medium underline underline-offset-2 transition-colors hover:text-gray-900"
                      style={{ color: BLUE }}
                    >
                      Follow your full showing prep checklist
                    </button>
                    {' '}(see top of page)
                  </p>
                ) : (
                  <p className="text-sm text-gray-700">{text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pro tips */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { text: 'Homes that are easy to show sell faster — accept as many showing requests as possible', source: 'HomeLight Agent Survey' },
            { text: 'Buyers spend an average of 30 minutes at showings — make every minute count', source: 'NAR Profile of Home Buyers' },
            { text: 'A printed home facts sheet reduces buyer objections by answering questions before they\'re asked', source: 'Industry best practice' },
            { text: 'In Texas, weekend showings (Saturday and Sunday) account for 60% of all offers', source: 'HAR.com data' },
          ].map(({ text, source }) => (
            <div key={source} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-sm font-medium text-gray-800 mb-2">&ldquo;{text}&rdquo;</p>
              <p className="text-xs text-gray-400">{source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vendor chips */}
      <section className="mb-12">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'ShowingTime', url: 'https://showingtime.com' },
            { label: 'Matterport', url: 'https://matterport.com' },
            { label: 'Zillow 3D Home', url: 'https://zillow.com/z3d' },
            { label: 'Amazon yard signs', url: 'https://amazon.com/s?k=fsbo+yard+sign' },
            { label: 'Home Depot lockbox', url: 'https://homedepot.com' },
          ].map(({ label, url }) => (
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
