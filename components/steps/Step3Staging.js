import { useState, useEffect, useRef } from 'react'

const ACCENT = '#16a34a'

const WIZARD_STAGES = [
  { id: 'living', emoji: '🛋️', label: 'Living Room / Main Space', tip: 'The living room is where buyers spend the most time imagining their life. Clear, bright, and minimal wins.', maxPhotos: 3, nextLabel: 'Next →' },
  { id: 'kitchen', emoji: '🍳', label: 'Kitchen & Dining', tip: 'Clear countertops photograph 10× better than a lived-in kitchen.', maxPhotos: 3, nextLabel: 'Next →' },
  { id: 'bedroom', emoji: '🛏️', label: 'Primary Bedroom', tip: 'Neutral bedding and open curtains are the two easiest wins here.', maxPhotos: 3, nextLabel: 'Next →' },
  { id: 'exterior', emoji: '🏡', label: 'Front Exterior / Curb', tip: 'In Texas, buyers preview listings on their phones before scheduling. This photo decides if they visit.', maxPhotos: 3, nextLabel: 'Done →' },
]

function UploadZone({ photos, onAdd, maxPhotos }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
    const remaining = maxPhotos - photos.length
    const toAdd = valid.slice(0, remaining).map(f => ({ name: f.name, url: URL.createObjectURL(f), file: f }))
    if (toAdd.length > 0) onAdd(toAdd)
  }
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }
  const isFull = photos.length >= maxPhotos
  return (
    <div className="space-y-3">
      <div
        onClick={() => !isFull && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!isFull) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors"
        style={{ borderColor: dragging ? ACCENT : '#d1d5db', backgroundColor: dragging ? '#f0fdf4' : '#fafafa', cursor: isFull ? 'default' : 'pointer' }}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        <div className="text-3xl mb-2">📷</div>
        {isFull ? <p className="text-sm text-gray-500">Max {maxPhotos} photos uploaded</p> : (
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
              <img src={p.url} alt={p.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
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

const CHECKLIST_CATEGORIES = [
  {
    label: 'Curb Appeal',
    items: [
      { id: 'mow-lawn', name: 'Mow and edge lawn', priority: 'high', cost: '$50–100 hired', impact: 'Buyers preview photos online — curb appeal drives showings' },
      { id: 'clean-walkway', name: 'Clean walkway and front door area', priority: 'high', cost: '$0–50 DIY', impact: 'First impression matters before they even enter' },
      { id: 'fresh-mulch', name: 'Add fresh mulch to flower beds', priority: 'medium', cost: '$50–150', impact: 'Instantly makes landscaping look intentional' },
      { id: 'seasonal-flowers', name: 'Add seasonal flowers or potted plants', priority: 'low', cost: '$20–60', impact: 'Adds color and warmth to exterior photos' },
    ],
  },
  {
    label: 'Declutter & Depersonalize',
    items: [
      { id: 'remove-photos', name: 'Remove family photos and personal items', priority: 'high', cost: 'Free', impact: 'Buyers need to visualize their own life here' },
      { id: 'clear-countertops', name: 'Clear all countertops', priority: 'high', cost: 'Free', impact: 'Clear counters make kitchens look twice as big' },
      { id: 'remove-furniture', name: 'Remove excess furniture to open up space', priority: 'medium', cost: 'Free / $100–200 storage', impact: 'Less furniture = larger-feeling rooms in photos' },
    ],
  },
  {
    label: 'Clean & Repair',
    items: [
      { id: 'deep-clean', name: 'Deep clean all rooms', priority: 'high', cost: '$150–300 hired', impact: 'Buyers smell everything — clean homes feel cared for' },
      { id: 'clean-windows', name: 'Clean windows inside and out', priority: 'high', cost: '$0–50 DIY', impact: 'Natural light is a top buyer priority in Texas' },
      { id: 'touch-up-paint', name: 'Touch up paint scuffs and dings', priority: 'medium', cost: '$20–60 DIY', impact: 'Fresh paint signals a well-maintained home' },
    ],
  },
  {
    label: 'Style & Neutralize',
    items: [
      { id: 'neutral-pillows', name: 'Add neutral throw pillows and blankets', priority: 'medium', cost: '$40–100', impact: 'Photographs well and helps buyers see potential' },
      { id: 'remove-bold-art', name: 'Remove bold wall art and decorations', priority: 'medium', cost: 'Free', impact: 'Neutral spaces feel larger and appeal to more buyers' },
      { id: 'white-towels', name: 'Display fresh white towels in bathrooms', priority: 'low', cost: '$20–40', impact: 'The hotel towel trick — makes bathrooms feel spa-like' },
    ],
  },
  {
    label: 'Lighting',
    items: [
      { id: 'maximize-light', name: 'Open all blinds and curtains for photos', priority: 'high', cost: 'Free', impact: 'Bright photos get 3× more online views' },
      { id: 'replace-bulbs', name: 'Replace dim bulbs with warm LED (2700K)', priority: 'medium', cost: '$20–50 DIY', impact: 'Warm lighting makes rooms feel inviting, not institutional' },
      { id: 'add-lamp', name: 'Add floor lamp to any dark corners', priority: 'low', cost: '$30–80', impact: 'Eliminates the "cave effect" in listing photos' },
    ],
  },
]

const PRIORITY_CONFIG = {
  high:   { label: 'High Impact', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  medium: { label: 'Medium', bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
  low:    { label: 'Low', bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
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

export default function Step3Staging({ onComplete, isCompleted, onSelectStep, onPriceUpdate, priceEstimate }) {
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ living: [], kitchen: [], bedroom: [], exterior: [] })
  const [analyzeNote, setAnalyzeNote] = useState(null)

  const addPhotos = (stageId, newPhotos) => setPhotos(prev => ({ ...prev, [stageId]: [...prev[stageId], ...newPhotos] }))
  const advanceWizard = () => { if (wizardStage < WIZARD_STAGES.length - 1) setWizardStage(s => s + 1); else setWizardDone(true) }
  const totalPhotos = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0)
  const roomsWithPhotos = Object.values(photos).filter(arr => arr.length > 0).length
  const currentStage = WIZARD_STAGES[wizardStage]

  const [checkedItems, setCheckedItems] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const items = data?.step3?.checkedItems
        if (Array.isArray(items)) return new Set(items)
      }
    } catch {}
    return new Set()
  })

  const handleCheck = (id, checked) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      const existing = saved ? JSON.parse(saved) : {}
      localStorage.setItem('fsbo_stepData', JSON.stringify({
        ...existing,
        step3: { ...existing.step3, checkedItems: [...checkedItems] },
      }))
    } catch {}
  }, [checkedItems])

  const allChecklistItems = CHECKLIST_CATEGORIES.flatMap(c => c.items)
  const highItems = allChecklistItems.filter(i => i.priority === 'high')
  const mediumItems = allChecklistItems.filter(i => i.priority === 'medium')
  const highDone = highItems.filter(i => checkedItems.has(i.id)).length
  const mediumDone = mediumItems.filter(i => checkedItems.has(i.id)).length
  const allHighDone = highDone === highItems.length
  const stagingValue = priceEstimate?.currentEstimate
    ? Math.round(priceEstimate.currentEstimate * 0.01)
    : null

  useEffect(() => {
    if (allHighDone && stagingValue) {
      const updated = { ...priceEstimate, stagingValue }
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(updated))
      if (onPriceUpdate) onPriceUpdate(updated)
    } else if (!allHighDone) {
      const updated = { ...priceEstimate, stagingValue: null }
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(updated))
      if (onPriceUpdate) onPriceUpdate(updated)
    }
  }, [checkedItems]) // eslint-disable-line react-hooks/exhaustive-deps

  const motivatingMessage =
    highDone === 0
      ? 'Start with High Impact tasks — buyers decide in the first 30 seconds'
      : allHighDone
      ? '✓ Your home is staged to impress'
      : 'Good progress! Your home is getting show-ready'
  const motivatingColor =
    allHighDone ? '#166534' : highDone > 0 ? '#92400e' : '#1e40af'

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#fef9c3', color: '#a16207' }}
        >
          Prepare
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Staging &amp; Curb Appeal</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span> Staged homes sell faster
        and receive fewer lowball offers. You&apos;re not decorating — you&apos;re protecting your
        asking price. Buyers decide how they feel about a home in the first 30 seconds.
      </p>

      {/* Photo wizard */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Let&apos;s see your home&apos;s current look</h3>
        <p className="text-sm text-gray-500 mb-6">Upload a photo of each room for AI staging suggestions, or skip and use the checklist.</p>
        {!wizardDone ? (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Room {wizardStage + 1} of {WIZARD_STAGES.length}</span>
                <div className="flex gap-1.5">
                  {WIZARD_STAGES.map((_, i) => (
                    <div key={i} className="h-1.5 w-8 rounded-full transition-colors" style={{ backgroundColor: i <= wizardStage ? ACCENT : '#e5e7eb' }} />
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
              <UploadZone photos={photos[currentStage.id]} onAdd={newPhotos => addPhotos(currentStage.id, newPhotos)} maxPhotos={currentStage.maxPhotos} />
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={advanceWizard} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>{currentStage.nextLabel}</button>
                <button type="button" onClick={advanceWizard} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">Skip</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-700 mb-5">
              {totalPhotos > 0
                ? `You uploaded ${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} across ${roomsWithPhotos} room${roomsWithPhotos !== 1 ? 's' : ''}`
                : "No photos uploaded — that's okay, you can still use the checklist below."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div>
                <button
                  type="button"
                  onClick={() => setAnalyzeNote('AI staging analysis coming soon — we\'ll wire this up once the API key is ready.')}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  Analyze my photos →
                </button>
                {analyzeNote && <p className="mt-2 text-sm text-gray-500">{analyzeNote}</p>}
              </div>
              <button
                type="button"
                onClick={() => { const el = document.getElementById('staging-checklist'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
                className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Skip — go straight to checklist
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Staging checklist */}
      <section id="staging-checklist" className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your staging checklist</h3>
        <p className="text-sm text-gray-500 mb-8">
          Start with <span className="font-semibold text-red-600">High Impact</span> items — they protect your asking price from lowball offers.
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
                        <span className="text-xs text-gray-500 italic">&ldquo;{item.impact}&rdquo;</span>
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
              Every completed item makes your home more show-ready.
            </p>
          </div>
        )}
      </section>

      {/* Staging progress card */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Your staging progress</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-2xl font-bold text-gray-900">
              {highDone} <span className="text-base font-normal text-gray-400">of {highItems.length}</span>
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#dc2626' }}>High Impact done</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-2xl font-bold text-gray-900">
              {mediumDone} <span className="text-base font-normal text-gray-400">of {mediumItems.length}</span>
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#ca8a04' }}>Medium done</p>
          </div>
        </div>
        {stagingValue && (
          <div className="rounded-lg bg-gray-50 px-4 py-3 mb-4">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Value protected when all High Impact items done</p>
            <p className="text-xl font-bold text-gray-900">${stagingValue.toLocaleString()}</p>
          </div>
        )}
        <p className="text-sm font-medium" style={{ color: motivatingColor }}>{motivatingMessage}</p>
      </div>

      {/* Pro tips */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Pro tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { tip: 'Staged homes sell 73% faster than non-staged homes', source: 'NAR Profile of Home Staging' },
            { tip: 'Buyers decide how they feel about a home within the first 30 seconds', source: 'HomeLight Seller Survey' },
            { tip: "Decluttering is the highest-ROI staging task — and it's free", source: 'Industry best practice' },
            { tip: 'In Texas heat, curb appeal photos matter more because buyers preview online before visiting', source: 'HomeLight Agent Survey' },
          ].map(({ tip, source }) => (
            <div key={tip} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-4">
              <p className="text-sm text-gray-800 mb-2">&ldquo;{tip}&rdquo;</p>
              <p className="text-xs text-gray-400">{source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Staging company cards */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Need a pro? Get a quote</h3>
        <p className="text-sm text-gray-400 mb-4">
          We&apos;ll personalize these to your address soon. For now, these are trusted starting points.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Texas Home Stagers', service: 'Full-service staging', rating: '4.9', url: 'https://thumbtack.com' },
            { name: 'Austin Staging Co.', service: 'Consultation + rental furniture', rating: '4.8', url: 'https://thumbtack.com' },
            { name: 'Round Rock Staging', service: 'Vacant home staging', rating: '4.7', url: 'https://thumbtack.com' },
          ].map(({ name, service, rating, url }) => (
            <div key={name} className="rounded-lg border border-gray-200 bg-white px-4 py-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{service}</p>
              <p className="text-xs text-gray-500">⭐ {rating}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-block text-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Get quote
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Status banner */}
      {stagingValue && (
        <div className={`p-4 rounded-lg text-sm font-medium mb-4 ${
          allHighDone
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {allHighDone ? (
            <span>🎉 Your home is show-ready. You&apos;ve protected <strong>${stagingValue.toLocaleString()}</strong> from lowball offers.</span>
          ) : (
            <span>
              🏠 Complete all High Impact tasks to protect an estimated <strong>${stagingValue.toLocaleString()}</strong> of your asking price.
              <span className="ml-1 cursor-pointer group relative inline-block">
                ⓘ
                <span className="hidden group-hover:block absolute bottom-full left-0 w-64 p-2 bg-gray-800 text-white text-xs rounded z-10">
                  Staged homes receive offers 1–5% higher than non-staged homes. We use the conservative floor of 1%. Source: NAR Profile of Home Staging.
                </span>
              </span>
            </span>
          )}
        </div>
      )}

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
              onClick={() => onSelectStep && onSelectStep(4)}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: ACCENT }}
            >
              Next up: Photography &amp; Listing →
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
