import { useState, useEffect, useRef } from 'react'

const ACCENT = '#16a34a'

const WIZARD_STAGES = [
  {
    id: 'bathrooms',
    emoji: '🚿',
    label: 'Start with your bathrooms',
    tip: 'Buyers judge bathrooms immediately. Upload one photo per bathroom if you have multiple.',
    maxPhotos: 5,
    nextLabel: 'Next →',
  },
  {
    id: 'kitchen',
    emoji: '🍳',
    label: 'How about your kitchen?',
    tip: 'Check under the sink, faucets, and cabinet hardware. These are inspection favorites.',
    maxPhotos: 3,
    nextLabel: 'Next →',
  },
  {
    id: 'front',
    emoji: '🏡',
    label: 'The first impression',
    tip: 'Buyers form an opinion before they walk in. Curb appeal matters more than most sellers realize.',
    maxPhotos: 3,
    nextLabel: 'Next →',
  },
  {
    id: 'other',
    emoji: '🔍',
    label: 'Any areas you\'re worried about?',
    tip: 'Cracks, stains, damage — anything that\'s been bothering you. Better to know now.',
    maxPhotos: 5,
    nextLabel: 'Done →',
  },
]

const CHECKLIST_CATEGORIES = [
  {
    label: 'Curb Appeal',
    items: [
      { id: 'fresh-mulch', name: 'Fresh mulch and trimmed hedges', priority: 'recommended', cost: '$150–600 hired', impact: 'Sets the tone before buyers even walk in' },
      { id: 'pressure-wash', name: 'Pressure wash driveway', priority: 'recommended', cost: '$150–400 hired', impact: 'Instantly makes the home look cared for' },
      { id: 'front-door', name: 'Paint front door a bold color (black, navy, red)', priority: 'recommended', cost: '$50–150 DIY / $300–600 hired', impact: 'One of the highest ROI things you can do' },
      { id: 'mailbox', name: 'Replace broken mailbox', priority: 'optional', cost: '$50–200', impact: 'Buyers notice the small stuff' },
      { id: 'gutters', name: 'Clean gutters', priority: 'recommended', cost: '$150–400 hired', impact: 'Tells buyers the home has been maintained' },
    ],
  },
  {
    label: 'Interior',
    items: [
      { id: 'patch-walls', name: 'Patch holes in walls', priority: 'must', cost: '$20–50 DIY / $200–500 hired', impact: 'Buyers mentally deduct $500+ per hole' },
      { id: 'bulbs', name: 'Replace burned out bulbs with warm LED (2700K)', priority: 'must', cost: '$30–80 DIY', impact: 'Good lighting makes every room look better in photos' },
      { id: 'squeaky', name: 'Fix squeaky doors and cabinets', priority: 'recommended', cost: '$10–50 DIY / $150–300 hired', impact: 'Squeaks feel like neglect' },
      { id: 'interior-paint', name: 'Paint walls white or off-white (Sherwin-Williams Alabaster)', priority: 'recommended', cost: '$300–600 DIY / $600–1,500 hired per room', impact: 'Neutral walls help buyers picture their own life here', source: 'Zillow Research' },
      { id: 'sticky-windows', name: 'Fix sticky windows or doors', priority: 'recommended', cost: '$50–200 DIY / $200–500 hired', impact: 'Buyers test everything' },
    ],
  },
  {
    label: 'Kitchen & Bathrooms',
    items: [
      { id: 'recaulk', name: 'Recaulk tubs, showers, and sinks', priority: 'must', cost: '$20–50 DIY / $200–400 hired', impact: 'A small fix that looks like a renovation' },
      { id: 'faucets', name: 'Fix dripping faucets', priority: 'must', cost: '$20–100 DIY / $150–350 hired', impact: 'Drips make buyers wonder what else is wrong' },
      { id: 'vanities', name: 'Paint bathroom vanities navy, black, or forest green', priority: 'recommended', cost: '$100–250 DIY / $400–800 hired', impact: 'Photographs beautifully and feels renovated', source: 'Zillow Research' },
      { id: 'grout', name: 'Deep clean grout', priority: 'recommended', cost: '$20–60 DIY / $200–500 hired', impact: 'Clean grout = fresh bathroom' },
      { id: 'hardware', name: 'Update cabinet hardware', priority: 'optional', cost: '$100–400 DIY', impact: 'New pulls can transform a kitchen' },
    ],
  },
  {
    label: 'Big Ticket Items',
    items: [
      { id: 'hvac', name: 'HVAC service and new filter', priority: 'must', cost: '$150–300 hired', impact: 'Texas buyers always ask. Have the receipt ready.' },
      { id: 'roof', name: 'Roof inspection', priority: 'recommended', cost: '$300–500 hired', impact: 'Know before they find out at inspection' },
      { id: 'water-heater', name: 'Check water heater age', priority: 'recommended', cost: 'Free', impact: 'Over 15 years? Budget $800–1,500 to replace or be ready to negotiate' },
    ],
  },
  {
    label: 'Safety',
    items: [
      { id: 'smoke', name: 'Test smoke detectors', priority: 'must', cost: '$0–30 DIY', impact: 'Required by Texas law at closing' },
      { id: 'gfci', name: 'Test GFCI outlets near water', priority: 'must', cost: '$0–50 DIY', impact: 'Inspectors check every one' },
      { id: 'handrail', name: 'Check handrail stability', priority: 'must', cost: '$20–100 DIY / $150–300 hired', impact: 'Always flagged in inspection reports' },
    ],
  },
]

const PRIORITY_CONFIG = {
  must: { label: 'Must fix', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  recommended: { label: 'Recommended', bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
  optional: { label: 'Optional', bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  )
}

function UploadZone({ photos, onAdd, maxPhotos }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    const remaining = maxPhotos - photos.length
    const toAdd = valid.slice(0, remaining).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }))
    if (toAdd.length > 0) onAdd(toAdd)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const isFull = photos.length >= maxPhotos

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isFull && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!isFull) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors"
        style={{
          borderColor: dragging ? ACCENT : '#d1d5db',
          backgroundColor: dragging ? '#f0fdf4' : '#fafafa',
          cursor: isFull ? 'default' : 'pointer',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">📷</div>
        {isFull ? (
          <p className="text-sm text-gray-500">Max {maxPhotos} photos uploaded</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Drag photos here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — up to {maxPhotos} photos</p>
          </>
        )}
      </div>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative group">
              <img
                src={p.url}
                alt={p.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                <span className="text-white text-xs font-medium">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Step2Repairs({ onComplete, isCompleted, onSelectStep }) {
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ bathrooms: [], kitchen: [], front: [], other: [] })
  const [showAnalysisTip, setShowAnalysisTip] = useState(false)

  const [checkedItems, setCheckedItems] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const items = data?.step2?.checkedItems
        if (Array.isArray(items)) return new Set(items)
      }
    } catch {}
    return new Set()
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      const existing = saved ? JSON.parse(saved) : {}
      localStorage.setItem(
        'fsbo_stepData',
        JSON.stringify({ ...existing, step2: { checkedItems: [...checkedItems] } })
      )
    } catch {}
  }, [checkedItems])

  const handleCheck = (id, checked) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const addPhotos = (stageId, newPhotos) => {
    setPhotos((prev) => ({
      ...prev,
      [stageId]: [...prev[stageId], ...newPhotos],
    }))
  }

  const advanceWizard = () => {
    if (wizardStage < WIZARD_STAGES.length - 1) {
      setWizardStage((s) => s + 1)
    } else {
      setWizardDone(true)
    }
  }

  const totalPhotos = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0)
  const roomsWithPhotos = Object.values(photos).filter((arr) => arr.length > 0).length

  const currentStage = WIZARD_STAGES[wizardStage]

  return (
    <div className="px-10 py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#fef9c3', color: '#a16207' }}
        >
          Prepare
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Repairs &amp; Pre-Listing Fixes</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span> Small fixes = big
        protection. Every unfixed item gives buyers a reason to negotiate your price down. The good
        news? Most of these are quick and cheap.
      </p>

      {/* Photo wizard */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Let&apos;s see what your home needs</h3>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ll guide you room by room. Upload a photo or skip — your choice.
        </p>

        {!wizardDone ? (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Progress bar */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Room {wizardStage + 1} of {WIZARD_STAGES.length}
                </span>
                <div className="flex gap-1.5">
                  {WIZARD_STAGES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-8 rounded-full transition-colors"
                      style={{ backgroundColor: i <= wizardStage ? ACCENT : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentStage.emoji}</span>
                <h4 className="text-base font-semibold text-gray-900">{currentStage.label}</h4>
              </div>
              <p className="mt-1.5 text-sm text-gray-500">{currentStage.tip}</p>
            </div>

            <div className="px-6 py-5">
              <UploadZone
                photos={photos[currentStage.id]}
                onAdd={(newPhotos) => addPhotos(currentStage.id, newPhotos)}
                maxPhotos={currentStage.maxPhotos}
              />

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={advanceWizard}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  {currentStage.nextLabel}
                </button>
                <button
                  type="button"
                  onClick={advanceWizard}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-700 mb-5">
              {totalPhotos > 0
                ? `You uploaded ${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} across ${roomsWithPhotos} room${roomsWithPhotos !== 1 ? 's' : ''}`
                : 'No photos uploaded — that\'s okay, you can still use the checklist below.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative">
                <button
                  type="button"
                  disabled
                  onMouseEnter={() => setShowAnalysisTip(true)}
                  onMouseLeave={() => setShowAnalysisTip(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: ACCENT }}
                >
                  Analyze my photos →
                </button>
                {showAnalysisTip && (
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    AI analysis coming soon
                    <div className="absolute top-full left-4 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #1f2937' }} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('repair-checklist')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Skip photo analysis — go straight to checklist
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Repair checklist */}
      <section id="repair-checklist" className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your pre-listing checklist</h3>
        <p className="text-sm text-gray-500 mb-8">
          Focus on <span className="font-semibold text-red-600">Must Fix</span> items first — they protect your asking price.
        </p>

        <div className="space-y-8">
          {CHECKLIST_CATEGORIES.map((category) => (
            <div key={category.label}>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category.label}
              </h4>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.has(item.id)}
                      onChange={(e) => handleCheck(item.id, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                      style={{ accentColor: ACCENT }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="text-sm font-medium text-gray-800"
                          style={checkedItems.has(item.id) ? { textDecoration: 'line-through', color: '#9ca3af' } : {}}
                        >
                          {item.name}
                        </span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span className="text-xs text-gray-500 font-medium">{item.cost}</span>
                        <span className="text-xs text-gray-400">—</span>
                        <span className="text-xs text-gray-500 italic">
                          &ldquo;{item.impact}&rdquo;
                          {item.source && (
                            <span className="not-italic text-gray-400"> — {item.source}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {checkedItems.size > 0 && (
          <div
            className="mt-6 rounded-lg px-4 py-3"
            style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            <p className="text-sm" style={{ color: '#166534' }}>
              <span className="font-semibold">{checkedItems.size} item{checkedItems.size !== 1 ? 's' : ''} checked.</span>{' '}
              Great work — every completed item strengthens your asking price.
            </p>
          </div>
        )}
      </section>

      {/* Mark complete */}
      <div className="pt-6 border-t border-gray-100">
        {isCompleted ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: ACCENT }}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill={ACCENT} />
                  <path
                    d="M5 8l2.5 2.5L11 5.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
              onClick={() => onSelectStep && onSelectStep(3)}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: ACCENT }}
            >
              Next up: Staging &amp; Curb Appeal →
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
