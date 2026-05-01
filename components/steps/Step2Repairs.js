import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ACCENT = '#16a34a'

const SUB_STEPS = [
  { id: 1, label: 'Photo Assessment' },
  { id: 2, label: 'Repair Checklist' },
]

const CONTRACTORS = [
  { name: 'Texas Home Services', service: 'General repairs', rating: '4.8', url: 'https://thumbtack.com' },
  { name: 'Round Rock Handyman Pro', service: 'Handyman', rating: '4.7', url: 'https://thumbtack.com' },
  { name: 'Austin Paint & Patch', service: 'Painting', rating: '4.9', url: 'https://thumbtack.com' },
]

const slideVariants = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.16, ease: 'easeIn' } }),
}

const PRO_TIPS = [
  { tip: 'Buyers negotiate 1–3% of purchase price for repairs found at inspection', source: 'HomeLight Agent Survey' },
  { tip: 'Homes with pre-listing inspections sell faster and with fewer surprises', source: 'NAR Profile of Home Buyers' },
  { tip: 'A $20 caulk job can prevent a $500 negotiation', source: 'Industry best practice' },
  { tip: 'Having HVAC service receipts ready increases buyer confidence in Texas', source: 'HomeLight Agent Survey' },
]

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

const AI_PRIORITY_STYLE = {
  'Must Fix':    { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  'Recommended': { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
  'Optional':    { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
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
      file: f,
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

export default function Step2Repairs({ onComplete, isCompleted, onSelectStep, onPriceUpdate, priceEstimate }) {
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ bathrooms: [], kitchen: [], front: [], other: [] })
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [activeSubStep, setActiveSubStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [aiFindings, setAiFindings] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const findings = data?.step2?.aiFindings
        if (Array.isArray(findings) && findings.length > 0) return findings
      }
    } catch {}
    return null
  })

  const toBase64Compressed = (file) => new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const maxW = 800
      const scale = Math.min(1, maxW / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]
      URL.revokeObjectURL(url)
      resolve(base64)
    }
    img.src = url
  })

  const handleAnalyze = async () => {
    const allFiles = Object.values(photos).flat().map(p => p.file).filter(Boolean)
    setAnalyzing(true)
    setAiFindings(null)
    setAnalyzeError(null)
    try {
      const base64Images = await Promise.all(allFiles.map(toBase64Compressed))
      const res = await fetch('/api/analyze-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images }),
      })
      const data = await res.json()
      const findings = data.issues || []
      setAiFindings(findings)
      findings.forEach(finding => {
        const words = finding.issue.toLowerCase().split(/\s+/).filter(w => w.length >= 3)
        CHECKLIST_CATEGORIES.forEach(cat => {
          cat.items.forEach(item => {
            if (words.some(word => item.name.toLowerCase().includes(word))) {
              handleCheck(item.id, true)
            }
          })
        })
      })
      try {
        const saved = localStorage.getItem('fsbo_stepData')
        const existing = saved ? JSON.parse(saved) : {}
        localStorage.setItem('fsbo_stepData', JSON.stringify({
          ...existing,
          step2: { ...existing.step2, aiFindings: findings },
        }))
      } catch {}
    } catch {
      setAnalyzeError("Couldn't analyze photos — no worries, use the checklist below.")
    } finally {
      setAnalyzing(false)
    }
  }

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

  useEffect(() => {
    if (allMustFixDone && protectedValue) {
      const updated = { ...priceEstimate, protectedValue }
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(updated))
      if (onPriceUpdate) onPriceUpdate(updated)
    } else if (!allMustFixDone) {
      const updated = { ...priceEstimate, protectedValue: null }
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(updated))
      if (onPriceUpdate) onPriceUpdate(updated)
    }
  }, [checkedItems]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const allChecklistItems = CHECKLIST_CATEGORIES.flatMap(c => c.items)
  const mustFixItems = allChecklistItems.filter(i => i.priority === 'must')
  const recommendedItems = allChecklistItems.filter(i => i.priority === 'recommended')
  const mustFixDone = mustFixItems.filter(i => checkedItems.has(i.id)).length
  const recommendedDone = recommendedItems.filter(i => checkedItems.has(i.id)).length
  const parseLowCost = (s) => {
    if (!s || s.toLowerCase() === 'free') return 0
    const m = s.match(/\$(\d+)/)
    return m ? parseInt(m[1], 10) : 0
  }
  const estimatedCost = allChecklistItems
    .filter(i => checkedItems.has(i.id))
    .reduce((sum, i) => sum + parseLowCost(i.cost), 0)
  const motivatingMessage =
    mustFixDone === 0
      ? 'Start with Must Fix items — they protect your asking price'
      : mustFixDone === mustFixItems.length
      ? '✓ All critical items done! Your home is inspection-ready'
      : 'Good progress! Keep going on the Must Fix items'
  const motivatingColor =
    mustFixDone === mustFixItems.length ? '#166534' : mustFixDone > 0 ? '#92400e' : '#1e40af'
  const allMustFixDone = mustFixDone === mustFixItems.length
  const protectedValue = priceEstimate?.currentEstimate
    ? Math.round(priceEstimate.currentEstimate * 0.01)
    : null

  const goTo = (step) => {
    setDirection(step > activeSubStep ? 1 : -1)
    setActiveSubStep(step)
  }
  const toggleCategory = (label) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className="px-4 py-8 md:px-10 md:py-12">
      {/* Static header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#fef9c3', color: '#a16207' }}
        >
          Prepare
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Repairs &amp; Pre-Listing Fixes</h2>
      <p className="text-gray-600 leading-relaxed mb-8">
        <span className="font-semibold text-gray-800">Why it matters:</span> Small fixes = big
        protection. Every unfixed item gives buyers a reason to negotiate your price down.
      </p>

      {/* Sub-step progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {SUB_STEPS.map((step, i) => {
          const done = step.id < activeSubStep
          const active = step.id === activeSubStep
          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(step.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: active ? ACCENT : done ? '#dcfce7' : '#f3f4f6',
                  color: active ? '#fff' : done ? '#166534' : '#6b7280',
                }}
              >
                {done ? '✓ ' : ''}{step.label}
              </button>
              {i < SUB_STEPS.length - 1 && (
                <div className="h-px w-4 bg-gray-200 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8 items-start">
        {/* Wizard cards */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeSubStep}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Card 1: Photo Assessment */}
              {activeSubStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Let&apos;s see what your home needs</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    We&apos;ll guide you room by room. Upload a photo or skip — your choice.
                  </p>

                  {!wizardDone ? (
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
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
                    <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-5">
                        {totalPhotos > 0
                          ? `You uploaded ${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} across ${roomsWithPhotos} room${roomsWithPhotos !== 1 ? 's' : ''}`
                          : "No photos uploaded — that's okay, you can still use the checklist."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div>
                          <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {analyzing ? 'Analyzing your photos... 🔍' : 'Analyze my photos →'}
                          </button>
                          {analyzeError && (
                            <p className="mt-2 text-sm text-gray-500">{analyzeError}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => goTo(2)}
                          className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
                        >
                          Skip — go straight to checklist
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI findings */}
                  {aiFindings && aiFindings.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">📷 AI spotted these in your photos:</h3>
                      <div className="space-y-3">
                        {aiFindings.map((finding, i) => {
                          const style = AI_PRIORITY_STYLE[finding.priority] || AI_PRIORITY_STYLE['Optional']
                          return (
                            <div key={i} className="rounded-lg border p-4" style={{ borderColor: style.border, backgroundColor: style.bg }}>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900">{finding.issue}</span>
                                <span
                                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                                >
                                  {finding.priority}
                                </span>
                                <span className="text-xs text-gray-400 ml-auto">{finding.room}</span>
                              </div>
                              <p className="text-xs font-medium text-gray-600 mb-0.5">{finding.costRange}</p>
                              <p className="text-xs text-gray-500 italic">&ldquo;{finding.whyItMatters}&rdquo;</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => goTo(2)}
                      className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Continue to Repair Checklist →
                    </button>
                  </div>
                </div>
              )}

              {/* Card 2: Repair Checklist */}
              {activeSubStep === 2 && (
                <div>
                  {/* Must-Fix progress pill */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold text-gray-900">Your pre-listing checklist</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: allMustFixDone ? '#dcfce7' : '#fef3c7',
                        color: allMustFixDone ? '#15803d' : '#92400e',
                      }}
                    >
                      {mustFixDone} of {mustFixItems.length} Must-Fixes checked
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Focus on <span className="font-semibold text-red-600">Must Fix</span> items first — they protect your asking price. Tap a category to expand.
                  </p>

                  {/* Accordion checklist */}
                  <div className="space-y-2 mb-6">
                    {CHECKLIST_CATEGORIES.map((category) => {
                      const isOpen = expandedCategories.has(category.label)
                      const catMustFix = category.items.filter(i => i.priority === 'must')
                      const catChecked = category.items.filter(i => checkedItems.has(i.id)).length
                      const catMustDone = catMustFix.filter(i => checkedItems.has(i.id)).length
                      return (
                        <div key={category.label} className="rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.label)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-800">{category.label}</span>
                              {catMustFix.length > 0 && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: catMustDone === catMustFix.length ? '#dcfce7' : '#fef2f2',
                                    color: catMustDone === catMustFix.length ? '#15803d' : '#dc2626',
                                  }}
                                >
                                  {catMustDone}/{catMustFix.length} must-fix
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">{catChecked}/{category.items.length} checked</span>
                              <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="border-t border-gray-100 divide-y divide-gray-50">
                              {category.items.map((item) => (
                                <label
                                  key={item.id}
                                  className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checkedItems.has(item.id)}
                                    onChange={(e) => handleCheck(item.id, e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                                    style={{ accentColor: ACCENT }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
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
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Progress summary */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className="text-xl font-bold text-gray-900">
                          {mustFixDone}<span className="text-sm font-normal text-gray-400">/{mustFixItems.length}</span>
                        </p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: '#dc2626' }}>Must Fix</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className="text-xl font-bold text-gray-900">
                          {recommendedDone}<span className="text-sm font-normal text-gray-400">/{recommendedItems.length}</span>
                        </p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: '#ca8a04' }}>Recommended</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className="text-xl font-bold text-gray-900">${estimatedCost.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Est. DIY cost</p>
                      </div>
                    </div>
                    <p className="text-xs font-medium mt-3" style={{ color: motivatingColor }}>{motivatingMessage}</p>
                  </div>

                  {/* Price protection alert */}
                  {protectedValue && (
                    <div className={`p-4 rounded-lg text-sm font-medium mb-6 ${
                      allMustFixDone
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {allMustFixDone ? (
                        <span>🎉 You&apos;ve protected <strong>${protectedValue.toLocaleString()}</strong> of your asking price from buyer negotiation.</span>
                      ) : (
                        <span>🛡️ Complete all Must Fix items to protect an estimated <strong>${protectedValue.toLocaleString()}</strong> of your asking price.
                          <span className="ml-1 cursor-pointer group relative inline-block">
                            ⓘ
                            <span className="hidden group-hover:block absolute bottom-full left-0 w-64 p-2 bg-gray-800 text-white text-xs rounded z-10">
                              Buyers negotiate an average of $7,200 off asking price using inspection findings. Completing Must Fix repairs removes their leverage. Source: NAR Home Buyer &amp; Seller Report.
                            </span>
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mark complete */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => goTo(1)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        ← Back
                      </button>
                      {isCompleted ? (
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="7" fill={ACCENT} />
                              <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Done!
                          </span>
                          <button type="button" onClick={() => onComplete(false)} className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors">Undo</button>
                          <button
                            type="button"
                            onClick={() => onSelectStep && onSelectStep(3)}
                            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: ACCENT }}
                          >
                            Next up: Staging &amp; Curb Appeal →
                          </button>
                        </div>
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
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky right panel — context-aware */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-4 space-y-4">
          {activeSubStep === 1 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pro Tips</h4>
              <div className="space-y-3">
                {PRO_TIPS.map(({ tip, source }, i) => (
                  <div key={i} className="border-l-2 pl-3" style={{ borderColor: ACCENT }}>
                    <p className="text-xs text-gray-700 leading-relaxed mb-1">{tip}</p>
                    <p className="text-xs text-gray-400">— {source}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Need Help?</h4>
                <p className="text-xs text-gray-500 mb-3">Trusted contractors — personalized to your address soon.</p>
                <div className="space-y-2">
                  {CONTRACTORS.map(({ name, service, rating, url }) => (
                    <div key={name} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400">{service} · ⭐ {rating}</p>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Quote
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pro Tips</h4>
                <div className="space-y-3">
                  {PRO_TIPS.slice(0, 2).map(({ tip, source }, i) => (
                    <div key={i} className="border-l-2 pl-3" style={{ borderColor: ACCENT }}>
                      <p className="text-xs text-gray-700 leading-relaxed mb-1">{tip}</p>
                      <p className="text-xs text-gray-400">— {source}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
