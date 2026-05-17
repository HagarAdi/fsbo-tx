import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { notifyStepDataChange } from '../../utils/notifyStepData'
import { saveRoomPhotos, loadRoomPhotos } from '../../utils/photoStorage'
import { canUse, recordUse } from '../../utils/usageLimits'
import MilestoneCelebration from '../MilestoneCelebration'

const ACCENT = '#16a34a'

const SUB_STEPS = [
  { id: 1, label: 'Photo Upload' },
  { id: 2, label: 'Staging Checklist' },
]

const slideVariants = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.16, ease: 'easeIn' } }),
}

const PRO_TIPS = [
  { tip: 'Staged homes sell 73% faster than non-staged homes', source: 'NAR Profile of Home Staging' },
  { tip: 'Buyers decide how they feel about a home within the first 30 seconds', source: 'HomeLight Seller Survey' },
  { tip: "Decluttering is the highest-ROI staging task — and it's free", source: 'Industry best practice' },
  { tip: 'In Texas, buyers preview listings online before visiting — curb appeal drives showings', source: 'HomeLight Agent Survey' },
]

const STAGING_COMPANIES = [
  { name: 'Texas Home Stagers', service: 'Full-service staging', rating: '4.9', url: 'https://thumbtack.com' },
  { name: 'Austin Staging Co.', service: 'Consultation + rental furniture', rating: '4.8', url: 'https://thumbtack.com' },
  { name: 'Round Rock Staging', service: 'Vacant home staging', rating: '4.7', url: 'https://thumbtack.com' },
]

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
      { id: 'mow-lawn', kind: 'show-day', name: 'Mow and edge lawn', priority: 'high', cost: '$50–100 hired', impact: 'Buyers preview photos online — curb appeal drives showings' },
      { id: 'clean-walkway', kind: 'show-day', name: 'Clean walkway and front door area', priority: 'high', cost: '$0–50 DIY', impact: 'First impression matters before they even enter' },
      { id: 'fresh-mulch', kind: 'cosmetic-upgrade', name: 'Fresh mulch and trimmed hedges', priority: 'medium', cost: '$150–600 hired', estCost: 375, impact: 'Sets the tone before buyers even walk in' },
      { id: 'seasonal-flowers', kind: 'show-day', name: 'Add seasonal flowers or potted plants', priority: 'low', cost: '$20–60', impact: 'Adds color and warmth to exterior photos' },
      { id: 'pressure-wash', kind: 'cosmetic-upgrade', name: 'Pressure wash driveway', priority: 'medium', cost: '$150–400 hired', estCost: 275, impact: 'Instantly makes the home look cared for' },
      { id: 'front-door', kind: 'cosmetic-upgrade', name: 'Paint front door a bold color (black, navy, red)', priority: 'medium', cost: '$50–150 DIY / $300–600 hired', estCost: 100, impact: 'One of the highest ROI things you can do' },
      { id: 'mailbox', kind: 'cosmetic-upgrade', name: 'Replace broken mailbox', priority: 'low', cost: '$50–200', estCost: 125, impact: 'Buyers notice the small stuff' },
    ],
  },
  {
    label: 'Declutter & Depersonalize',
    items: [
      { id: 'remove-photos', kind: 'show-day', name: 'Remove family photos and personal items', priority: 'high', cost: 'Free', impact: 'Buyers need to visualize their own life here' },
      { id: 'clear-countertops', kind: 'show-day', name: 'Clear all countertops', priority: 'high', cost: 'Free', impact: 'Clear counters make kitchens look twice as big' },
      { id: 'remove-furniture', kind: 'show-day', name: 'Remove excess furniture to open up space', priority: 'medium', cost: 'Free / $100–200 storage', impact: 'Less furniture = larger-feeling rooms in photos' },
    ],
  },
  {
    label: 'Clean & Repair',
    items: [
      { id: 'deep-clean', kind: 'show-day', name: 'Deep clean all rooms', priority: 'high', cost: '$150–300 hired', impact: 'Buyers smell everything — clean homes feel cared for' },
      { id: 'clean-windows', kind: 'show-day', name: 'Clean windows inside and out', priority: 'high', cost: '$0–50 DIY', impact: 'Natural light is a top buyer priority in Texas' },
      { id: 'touch-up-paint', kind: 'show-day', name: 'Touch up paint scuffs and dings', priority: 'medium', cost: '$20–60 DIY', impact: 'Fresh paint signals a well-maintained home' },
      { id: 'squeaky', kind: 'cosmetic-upgrade', name: 'Fix squeaky doors and cabinets', priority: 'medium', cost: '$10–50 DIY / $150–300 hired', estCost: 30, impact: 'Squeaks feel like neglect' },
      { id: 'interior-paint', kind: 'cosmetic-upgrade', name: 'Paint walls white or off-white (Sherwin-Williams Alabaster)', priority: 'medium', cost: '$300–600 DIY / $600–1,500 hired per room', estCost: 450, impact: 'Neutral walls help buyers picture their own life here' },
    ],
  },
  {
    label: 'Style & Neutralize',
    items: [
      { id: 'neutral-pillows', kind: 'show-day', name: 'Add neutral throw pillows and blankets', priority: 'medium', cost: '$40–100', impact: 'Photographs well and helps buyers see potential' },
      { id: 'remove-bold-art', kind: 'show-day', name: 'Remove bold wall art and decorations', priority: 'medium', cost: 'Free', impact: 'Neutral spaces feel larger and appeal to more buyers' },
      { id: 'white-towels', kind: 'show-day', name: 'Display fresh white towels in bathrooms', priority: 'low', cost: '$20–40', impact: 'The hotel towel trick — makes bathrooms feel spa-like' },
    ],
  },
  {
    label: 'Lighting',
    items: [
      { id: 'maximize-light', kind: 'show-day', name: 'Open all blinds and curtains for photos', priority: 'high', cost: 'Free', impact: 'Bright photos get 3× more online views' },
      { id: 'replace-bulbs', kind: 'show-day', name: 'Replace dim bulbs with warm LED (2700K)', priority: 'medium', cost: '$20–50 DIY', impact: 'Warm lighting makes rooms feel inviting, not institutional' },
      { id: 'add-lamp', kind: 'show-day', name: 'Add floor lamp to any dark corners', priority: 'low', cost: '$30–80', impact: 'Eliminates the "cave effect" in listing photos' },
    ],
  },
  {
    label: 'Kitchen & Bath',
    items: [
      { id: 'vanities', kind: 'cosmetic-upgrade', name: 'Paint bathroom vanities navy, black, or forest green', priority: 'medium', cost: '$100–250 DIY / $400–800 hired', estCost: 175, impact: 'Photographs beautifully and feels renovated' },
      { id: 'grout', kind: 'cosmetic-upgrade', name: 'Deep clean grout', priority: 'medium', cost: '$20–60 DIY / $200–500 hired', estCost: 40, impact: 'Clean grout reads as a fresh bathroom in photos' },
      { id: 'hardware', kind: 'cosmetic-upgrade', name: 'Update cabinet hardware', priority: 'low', cost: '$100–400 DIY', estCost: 250, impact: 'New pulls can transform a kitchen' },
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

export default function Step3Staging({ onSelectStep }) {
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ living: [], kitchen: [], bedroom: [], exterior: [] })
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const findings = data?.step3?.aiSuggestions
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
    if (allFiles.length === 0) {
      setAnalyzeError('Upload a photo first, or skip to the checklist.')
      return
    }
    if (!canUse('analyze-staging')) {
      setAnalyzeError("You've used today's 3 staging analyses. Resets at midnight.")
      return
    }
    setAnalyzing(true)
    setAiSuggestions(null)
    setAnalyzeError(null)
    try {
      const base64Images = await Promise.all(allFiles.map(toBase64Compressed))
      const res = await fetch('/api/analyze-staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images }),
      })
      const data = await res.json()
      const findings = data.findings || []
      recordUse('analyze-staging')
      setAiSuggestions(findings)
      try {
        const saved = localStorage.getItem('fsbo_stepData')
        const existing = saved ? JSON.parse(saved) : {}
        localStorage.setItem('fsbo_stepData', JSON.stringify({
          ...existing,
          step3: { ...existing.step3, aiSuggestions: findings },
        }))
        notifyStepDataChange()
      } catch {}
    } catch {
      setAnalyzeError("Couldn't analyze photos — no worries, use the checklist below.")
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    const ROOMS = ['living', 'kitchen', 'bedroom', 'exterior']
    Promise.all(ROOMS.map(room => loadRoomPhotos('step3', room))).then(results => {
      const loaded = {}
      ROOMS.forEach((room, i) => { loaded[room] = results[i] })
      if (Object.values(loaded).some(arr => arr.length > 0)) {
        setPhotos(loaded)
        setWizardDone(true)
      }
    }).catch(() => {})
  }, [])

  const addPhotos = (stageId, newPhotos) => setPhotos(prev => {
    const updated = { ...prev, [stageId]: [...prev[stageId], ...newPhotos] }
    saveRoomPhotos('step3', stageId, updated[stageId]).catch(() => {})
    return updated
  })
  const advanceWizard = () => { if (wizardStage < WIZARD_STAGES.length - 1) setWizardStage(s => s + 1); else setWizardDone(true) }
  const handleLastStageAnalyze = () => { advanceWizard(); handleAnalyze() }
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
      notifyStepDataChange()
    } catch {}
  }, [checkedItems])

  const allChecklistItems = CHECKLIST_CATEGORIES.flatMap(c => c.items)
  const highItems = allChecklistItems.filter(i => i.priority === 'high')
  const highDone = highItems.filter(i => checkedItems.has(i.id)).length
  const allHighDone = highDone === highItems.length
  const investment = allChecklistItems
    .filter(i => i.kind === 'cosmetic-upgrade' && checkedItems.has(i.id))
    .reduce((sum, i) => sum + (i.estCost ?? 0), 0)

  const motivatingMessage =
    highDone === 0
      ? 'Start with High Impact tasks — polished homes sell faster'
      : allHighDone
      ? '✓ Show-ready — polished homes sell faster and attract more offers'
      : 'Good progress — polished homes sell faster'
  const motivatingColor =
    allHighDone ? '#166534' : highDone > 0 ? '#92400e' : '#1e40af'

  const [activeSubStep, setActiveSubStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const goTo = (step) => {
    setDirection(step > activeSubStep ? 1 : -1)
    setActiveSubStep(step)
  }
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const toggleCategory = (label) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const [showMilestone, setShowMilestone] = useState(false)

  const buildPrepareSummary = () => {
    let priceLabel = '—'
    let repairsLabel = `${highItems.length} high-impact tasks`
    let stagingLabel = `${highDone} of ${highItems.length} high-impact tasks done`
    try {
      const data = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
      const compsCount = Array.isArray(data.step1?.comps) ? data.step1.comps.filter(c => c.price).length : 0
      const est = JSON.parse(localStorage.getItem('fsbo_priceEstimate') || 'null')
      if (est?.currentEstimate) {
        priceLabel = `$${Math.round(est.currentEstimate).toLocaleString()}` + (compsCount ? ` · ${compsCount} comps` : '')
      } else if (compsCount) {
        priceLabel = `${compsCount} comps entered`
      }
      const checked = Array.isArray(data.step2?.checkedItems) ? data.step2.checkedItems.length : 0
      if (checked > 0) repairsLabel = `${checked} repair items checked`
    } catch {}
    return [
      { icon: '💰', label: 'Pricing', value: priceLabel },
      { icon: '🔧', label: 'Repairs', value: repairsLabel },
      { icon: '🛋️', label: 'Staging', value: stagingLabel },
    ]
  }

  return (
    <div className="px-4 py-8 md:px-10 md:py-12">
      {/* Static header */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: '#fef9c3', color: '#a16207' }}>
          Prepare
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Staging &amp; Curb Appeal</h2>
      <p className="text-gray-600 leading-relaxed mb-8">
        <span className="font-semibold text-gray-800">Why it matters:</span> Staged homes sell faster and receive fewer lowball offers. Buyers decide in the first 30 seconds.
      </p>

      {/* Sub-step progress pills */}
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

      {/* Two-column layout */}
      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={activeSubStep} custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit">

              {/* Card 1: Photo Upload */}
              {activeSubStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">What&apos;s worth a Saturday afternoon to spruce up?</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Upload a photo of each room and our AI flags clutter, rearranging, and quick wins with rough time estimates — or skip and use the checklist below.
                  </p>

                  {!wizardDone ? (
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
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
                          <button
                            type="button"
                            onClick={wizardStage === WIZARD_STAGES.length - 1 ? handleLastStageAnalyze : advanceWizard}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {wizardStage === WIZARD_STAGES.length - 1 ? 'Analyze my Photos →' : currentStage.nextLabel}
                          </button>
                          <button type="button" onClick={advanceWizard} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">Skip</button>
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
                      {!aiSuggestions && (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div>
                            <button
                              type="button"
                              onClick={handleAnalyze}
                              disabled={analyzing}
                              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: ACCENT }}
                            >
                              {analyzing ? 'Analyzing your photos... 🔍' : 'Analyze my Photos →'}
                            </button>
                            {analyzeError && <p className="mt-2 text-sm text-gray-500">{analyzeError}</p>}
                          </div>
                          <button type="button" onClick={() => goTo(2)} className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors">
                            Skip — go straight to checklist
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI suggestions */}
                  {aiSuggestions && aiSuggestions.length > 0 && (() => {
                    const ROOM_KEY_MAP = {
                      'Living Room': 'living', 'Kitchen': 'kitchen',
                      'Bedroom': 'bedroom', 'Bathroom': 'bedroom',
                      'Exterior': 'exterior',
                    }
                    const grouped = aiSuggestions.reduce((acc, s) => {
                      const room = s.room || 'Other'
                      if (!acc[room]) acc[room] = []
                      acc[room].push(s)
                      return acc
                    }, {})
                    return (
                      <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">⏱️ Time-cost staging wins:</h3>
                        <div className="space-y-3">
                          {Object.entries(grouped).map(([room, items]) => {
                            const roomKey = ROOM_KEY_MAP[room]
                            const roomPhotos = (roomKey && photos[roomKey]) ? photos[roomKey].slice(0, 3) : []
                            return (
                              <div key={room} className="rounded-lg border border-gray-200 bg-white p-4 flex gap-4 items-start">
                                {roomPhotos.length > 0 && (
                                  <div className="flex-shrink-0 flex flex-col gap-1.5">
                                    {roomPhotos.map((p, pi) => (
                                      <button
                                        key={pi}
                                        type="button"
                                        onClick={() => setLightboxPhoto(p.url)}
                                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity cursor-zoom-in"
                                      >
                                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 mb-2">{room}</div>
                                  <ul className="space-y-2">
                                    {items.map((s, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-gray-400 mt-1 leading-none">•</span>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm text-gray-800">{s.suggestion}</div>
                                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                            {s.effort && (
                                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300">
                                                {s.effort}
                                              </span>
                                            )}
                                            {s.impact && (
                                              <span
                                                className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                                style={{
                                                  backgroundColor: s.impact === 'High' ? '#fef2f2' : s.impact === 'Medium' ? '#fefce8' : '#f9fafb',
                                                  color: s.impact === 'High' ? '#dc2626' : s.impact === 'Medium' ? '#ca8a04' : '#6b7280',
                                                  border: `1px solid ${s.impact === 'High' ? '#fecaca' : s.impact === 'Medium' ? '#fef08a' : '#e5e7eb'}`,
                                                }}
                                              >
                                                {s.impact} Impact
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => goTo(2)} className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                      Continue to Staging Checklist →
                    </button>
                  </div>
                </div>
              )}

              {/* Card 2: Staging Checklist */}
              {activeSubStep === 2 && (
                <div>
                  {/* High-priority progress pill */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold text-gray-900">Staging Checklist</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: allHighDone ? '#dcfce7' : '#fef3c7', color: allHighDone ? '#15803d' : '#92400e' }}>
                      {highDone} of {highItems.length} High-priority checked
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Start with <span className="font-semibold text-red-600">High Impact</span> items — they protect your asking price. Tap a category to expand.
                  </p>

                  {/* Progress summary */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className="text-xl font-bold text-gray-900">${investment.toLocaleString()}</p>
                        <p className="text-xs font-semibold mt-0.5 text-gray-700">Investment</p>
                        <p className="text-xs text-gray-500 mt-0.5">to make it shine</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className="text-xl font-bold text-gray-900">{highDone}<span className="text-sm font-normal text-gray-400">/{highItems.length}</span></p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: '#dc2626' }}>Show-ready progress</p>
                        <p className="text-xs text-gray-500 mt-0.5">polished homes sell faster</p>
                      </div>
                    </div>
                    <p className="text-xs font-medium mt-3" style={{ color: motivatingColor }}>{motivatingMessage}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Staged homes sell 73% faster than non-staged homes — NAR Profile of Home Staging</p>
                  </div>

                  {/* Accordion checklist */}
                  <div className="space-y-2 mb-6">
                    {CHECKLIST_CATEGORIES.map((category) => {
                      const isOpen = expandedCategories.has(category.label)
                      const catHigh = category.items.filter(i => i.priority === 'high')
                      const catHighDone = catHigh.filter(i => checkedItems.has(i.id)).length
                      const catChecked = category.items.filter(i => checkedItems.has(i.id)).length
                      return (
                        <div key={category.label} className="rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.label)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-800">{category.label}</span>
                              {catHigh.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: catHighDone === catHigh.length ? '#dcfce7' : '#fef2f2', color: catHighDone === catHigh.length ? '#15803d' : '#dc2626' }}>
                                  {catHighDone}/{catHigh.length} high
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
                                <label key={item.id} className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={checkedItems.has(item.id)}
                                    onChange={(e) => handleCheck(item.id, e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                                    style={{ accentColor: ACCENT }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                      <span className="text-sm font-medium text-gray-800" style={checkedItems.has(item.id) ? { textDecoration: 'line-through', color: '#9ca3af' } : {}}>
                                        {item.name}
                                      </span>
                                      <PriorityBadge priority={item.priority} />
                                      {item.kind === 'cosmetic-upgrade' && item.estCost > 0 && (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300">
                                          ~${item.estCost} to make ready
                                        </span>
                                      )}
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
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {allHighDone && (
                    <div className="p-4 rounded-lg text-sm font-medium mb-6 bg-green-50 text-green-800 border border-green-200">
                      🎉 Show-ready. Polished homes like this sell faster and attract more offers.
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => goTo(1)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                        ← Back
                      </button>
                      <button type="button" onClick={() => setShowMilestone(true)} className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                        Move to the next step: Photography &amp; Listing →
                      </button>
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
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Need a Pro?</h4>
                <p className="text-xs text-gray-500 mb-3">Trusted stagers — personalized to your address soon.</p>
                <div className="space-y-2">
                  {STAGING_COMPANIES.map(({ name, service, rating, url }) => (
                    <div key={name} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400">{service} · ⭐ {rating}</p>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
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

      <MilestoneCelebration
        isOpen={showMilestone}
        onClose={() => setShowMilestone(false)}
        onContinue={() => { setShowMilestone(false); onSelectStep && onSelectStep(4) }}
        phaseTitle="Prepare phase complete!"
        subtitle="Pricing, repairs, and staging — done. Most sellers spend weeks here. You crushed it. Time to take it to market."
        summaryItems={showMilestone ? buildPrepareSummary() : []}
        continueLabel="Move to the next step: Photography & Listing →"
        badge="Phase 1 of 3 unlocked"
      />

      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
          >
            <motion.img
              src={lightboxPhoto}
              alt="Enlarged photo"
              className="max-w-full max-h-full rounded-lg object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
