import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { notifyStepDataChange } from '../../utils/notifyStepData'
import InspectorPanel from '../InspectorPanel'

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

const TREC_FORM_URL = 'https://www.trec.texas.gov/forms/property-inspection-report-rei-7-6'

const CHECKLIST_SECTIONS = [
  {
    id: 'inspection',
    label: 'Inspection Leverage',
    sublabel: 'Items a TREC-licensed inspector will check on REI 7-6 — the standard Texas inspection report. Skipping these gives buyers ammunition during the option period.',
    contributesToShield: true,
    categories: [
      {
        label: 'Structural',
        trecSection: 'I',
        items: [
          { id: 'foundation-tells', name: 'Check for foundation tell-tales (stair-step brick cracks, sticky doors, sloped floors)', priority: 'must', cost: 'Free DIY check / $400 engineer if found', estCost: 0, impact: 'TX foundation issues kill more deals than any other category. Catch it now or face a giant credit demand later.', trecRef: 'I.A' },
          { id: 'drainage-slope', name: 'Confirm grading slopes away from foundation; add splash blocks under downspouts', priority: 'recommended', cost: '$0–30 DIY', estCost: 30, impact: 'Standing water near the foundation is a top-5 TX inspector flag', trecRef: 'I.B' },
          { id: 'gutters', name: 'Clean gutters and check downspouts', priority: 'recommended', cost: '$150–400 hired', estCost: 275, impact: 'Inspectors check for clogs and detached sections', trecRef: 'I.B' },
          { id: 'roof', name: 'Roof inspection (get the report before listing)', priority: 'recommended', cost: '$300–500 hired', estCost: 400, impact: 'Know before they find out at inspection', trecRef: 'I.C/D' },
          { id: 'attic-insulation', name: 'Top up attic insulation to R-30 (Texas code minimum)', priority: 'recommended', cost: '$300–800 hired blow-in', estCost: 550, impact: 'Visible at the attic hatch; thin insulation is auto-flagged on REI 7-6', trecRef: 'I.D' },
          { id: 'patch-walls', name: 'Patch holes in walls', priority: 'recommended', cost: '$20–50 DIY / $200–500 hired', estCost: 35, impact: 'Inspectors note but rarely use as leverage. Cosmetic buyer-deduct.', trecRef: 'I.E' },
          { id: 'exterior-rot', name: 'Repair wood rot at fascia, soffit, and exterior trim', priority: 'recommended', cost: '$50–300 DIY caulk + paint', estCost: 175, impact: 'TX humidity makes wood rot a constant inspector flag', trecRef: 'I.E' },
          { id: 'sticky-windows', name: 'Fix sticky windows or doors', priority: 'recommended', cost: '$50–200 DIY / $200–500 hired', estCost: 125, impact: 'Inspectors operate every window and door', trecRef: 'I.G/H' },
          { id: 'window-seals', name: 'Address fogged or failed window seals (IGUs)', priority: 'optional', cost: '$200–400 per IGU', estCost: 300, impact: 'Flagged but rarely a deal-breaker; budget if you have several', trecRef: 'I.H' },
          { id: 'handrail', name: 'Check handrail stability on stairs', priority: 'must', cost: '$20–100 DIY / $150–300 hired', estCost: 60, impact: 'Always flagged in inspection reports', trecRef: 'I.I' },
        ],
      },
      {
        label: 'Electrical',
        trecSection: 'II',
        items: [
          { id: 'panel-labeling', name: 'Label every breaker; install all panel cover screws', priority: 'must', cost: '$0–30 DIY (label maker)', estCost: 20, impact: 'Missing labels and cover screws are universal inspector flags', trecRef: 'II.A' },
          { id: 'bulbs', name: 'Replace burned out bulbs with warm LED (2700K)', priority: 'recommended', cost: '$30–80 DIY', estCost: 55, impact: 'Inspectors mark "inoperative"; not real leverage but signals neglect in photos', trecRef: 'II.B' },
          { id: 'gfci', name: 'Test GFCI outlets near water (kitchen, baths, garage, exterior)', priority: 'must', cost: '$0–50 DIY', estCost: 25, impact: 'Inspectors check every one', trecRef: 'II.B' },
          { id: 'smoke', name: 'Test smoke detectors (and CO if you have gas appliances)', priority: 'must', cost: '$0–30 DIY', estCost: 15, impact: 'Required by Texas law at closing', trecRef: 'II.B' },
        ],
      },
      {
        label: 'HVAC',
        trecSection: 'III',
        items: [
          { id: 'hvac', name: 'HVAC service + new filter; keep the receipt', priority: 'must', cost: '$150–300 hired', estCost: 225, impact: 'Texas buyers always ask. Receipt prevents the "system needs servicing" credit demand.', trecRef: 'III.A/B/C' },
          { id: 'ac-condensate', name: 'Flush A/C condensate line (vinegar or shop-vac)', priority: 'recommended', cost: 'Free DIY', estCost: 0, impact: 'Clogs cause AC failure mid-showing — a 10-minute fix', trecRef: 'III.B' },
        ],
      },
      {
        label: 'Plumbing',
        trecSection: 'IV',
        items: [
          { id: 'recaulk', name: 'Recaulk tubs, showers, and sinks', priority: 'must', cost: '$20–50 DIY / $200–400 hired', estCost: 35, impact: 'Failed caulk is among the top-3 most-flagged TX items', trecRef: 'IV.A' },
          { id: 'faucets', name: 'Fix dripping faucets; check angle stops under sinks', priority: 'must', cost: '$20–100 DIY / $150–350 hired', estCost: 60, impact: 'Drips make buyers wonder what else is wrong', trecRef: 'IV.A' },
          { id: 'hose-bibs', name: 'Inspect hose bibs; install frost-free valves if missing', priority: 'recommended', cost: '$30–80 DIY per bib', estCost: 50, impact: 'TX freeze-damage history makes this a routine inspector check', trecRef: 'IV.A' },
          { id: 'slow-drains', name: 'Clear slow sink and tub drains', priority: 'recommended', cost: '$10–30 DIY snake', estCost: 20, impact: 'Inspector runs water in every fixture; slow drains are flagged', trecRef: 'IV.B' },
          { id: 'water-heater', name: 'Check water heater age, drip pan, and TPR valve', priority: 'recommended', cost: 'Free check', estCost: 0, impact: 'Over 15 years? Expect a $800–1,500 replace credit ask', trecRef: 'IV.C' },
        ],
      },
      {
        label: 'Appliances',
        trecSection: 'V',
        items: [
          { id: 'appliance-operation', name: 'Test every built-in appliance (dishwasher, disposal, range, oven, microwave, range hood)', priority: 'must', cost: 'Free DIY', estCost: 0, impact: 'TREC inspectors operate every built-in; a dead appliance = immediate credit ask', trecRef: 'V.A–F' },
          { id: 'bath-exhaust', name: 'Test bath exhaust fan operation', priority: 'recommended', cost: 'Free DIY check / $100–200 to replace', estCost: 0, impact: 'TREC-required; often flagged on older homes', trecRef: 'V.F' },
          { id: 'garage-door-reverse', name: 'Test garage door auto-reverse (beam sensors + resistance)', priority: 'must', cost: 'Free DIY adjust / $150–200 hired', estCost: 0, impact: 'Every TREC inspector tests it; failure triggers a re-inspection cost demand', trecRef: 'V.G' },
          { id: 'dryer-vent', name: 'Clean dryer vent; verify exterior termination', priority: 'recommended', cost: '$100–200 hired', estCost: 150, impact: 'Fire hazard; almost always noted in TX reports', trecRef: 'V.H' },
        ],
      },
    ],
  },
  {
    id: 'polish',
    label: 'Pre-listing Polish',
    sublabel: 'Cosmetic prep — not inspector territory, but buyers notice in photos and showings. These don’t add to your negotiation shield, but they help bring more offers in.',
    contributesToShield: false,
    categories: [
      {
        label: 'Curb Appeal',
        items: [
          { id: 'fresh-mulch', name: 'Fresh mulch and trimmed hedges', priority: 'recommended', cost: '$150–600 hired', estCost: 375, impact: 'Sets the tone before buyers even walk in' },
          { id: 'pressure-wash', name: 'Pressure wash driveway', priority: 'recommended', cost: '$150–400 hired', estCost: 275, impact: 'Instantly makes the home look cared for' },
          { id: 'front-door', name: 'Paint front door a bold color (black, navy, red)', priority: 'recommended', cost: '$50–150 DIY / $300–600 hired', estCost: 100, impact: 'One of the highest ROI things you can do' },
          { id: 'mailbox', name: 'Replace broken mailbox', priority: 'optional', cost: '$50–200', estCost: 125, impact: 'Buyers notice the small stuff' },
        ],
      },
      {
        label: 'Interior Refresh',
        items: [
          { id: 'squeaky', name: 'Fix squeaky doors and cabinets', priority: 'recommended', cost: '$10–50 DIY / $150–300 hired', estCost: 30, impact: 'Squeaks feel like neglect' },
          { id: 'interior-paint', name: 'Paint walls white or off-white (Sherwin-Williams Alabaster)', priority: 'recommended', cost: '$300–600 DIY / $600–1,500 hired per room', estCost: 450, impact: 'Neutral walls help buyers picture their own life here', source: 'Zillow Research' },
        ],
      },
      {
        label: 'Kitchen & Bath Cosmetic',
        items: [
          { id: 'vanities', name: 'Paint bathroom vanities navy, black, or forest green', priority: 'recommended', cost: '$100–250 DIY / $400–800 hired', estCost: 175, impact: 'Photographs beautifully and feels renovated', source: 'Zillow Research' },
          { id: 'grout', name: 'Deep clean grout', priority: 'recommended', cost: '$20–60 DIY / $200–500 hired', estCost: 40, impact: 'Clean grout reads as a fresh bathroom in photos' },
          { id: 'hardware', name: 'Update cabinet hardware', priority: 'optional', cost: '$100–400 DIY', estCost: 250, impact: 'New pulls can transform a kitchen' },
        ],
      },
    ],
  },
]

const PRIORITY_CONFIG = {
  must: { label: 'Must fix', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  recommended: { label: 'Recommended', bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
  optional: { label: 'Optional', bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
}

const RISK_MULTIPLIER = 8
const MUST_FIX_RISK_FLOOR = 500

function negotiationRisk(item) {
  const base = (item.estCost ?? 0) * RISK_MULTIPLIER
  if (item.priority === 'must') return Math.max(MUST_FIX_RISK_FLOOR, base)
  return base
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

export default function Step2Repairs({ onSelectStep }) {
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ bathrooms: [], kitchen: [], front: [], other: [] })
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [inspectorPanelOpen, setInspectorPanelOpen] = useState(false)
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
      const matchedIds = new Set()
      const polishItemsForMatch = CHECKLIST_SECTIONS
        .find(s => s.id === 'polish')
        .categories.flatMap(c => c.items)
      findings.forEach(finding => {
        const words = finding.issue.toLowerCase().split(/\s+/).filter(w => w.length >= 3)
        polishItemsForMatch.forEach(item => {
          if (words.some(word => item.name.toLowerCase().includes(word))) {
            matchedIds.add(item.id)
            handleCheck(item.id, true)
          }
        })
      })
      setAiFlaggedItemIds(prev => {
        const next = new Set(prev)
        matchedIds.forEach(id => next.add(id))
        return next
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

  const [aiFlaggedItemIds, setAiFlaggedItemIds] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const ids = data?.step2?.aiFlaggedItemIds
        if (Array.isArray(ids)) return new Set(ids)
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
        JSON.stringify({
          ...existing,
          step2: {
            ...(existing.step2 || {}),
            checkedItems: [...checkedItems],
            aiFlaggedItemIds: [...aiFlaggedItemIds],
          },
        })
      )
      notifyStepDataChange()
    } catch {}
  }, [checkedItems, aiFlaggedItemIds])

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

  const inspectionSection = CHECKLIST_SECTIONS.find(s => s.id === 'inspection')
  const polishSection = CHECKLIST_SECTIONS.find(s => s.id === 'polish')
  const inspectionItems = inspectionSection.categories.flatMap(c => c.items)
  const polishItems = polishSection.categories.flatMap(c => c.items)
  const mustFixItems = inspectionItems.filter(i => i.priority === 'must')
  const mustFixDone = mustFixItems.filter(i => checkedItems.has(i.id)).length
  const shieldedEquity = inspectionItems
    .filter(i => checkedItems.has(i.id))
    .reduce((sum, i) => sum + negotiationRisk(i), 0)
  const riskRemaining = mustFixItems
    .filter(i => !checkedItems.has(i.id))
    .reduce((sum, i) => sum + negotiationRisk(i), 0)
  const mustFixProgress = mustFixItems.length === 0 ? 0 : mustFixDone / mustFixItems.length
  const motivatingMessage =
    mustFixDone === 0
      ? 'Start with Must Fix items — every unchecked one is leverage for the buyer’s inspector'
      : mustFixDone === mustFixItems.length
      ? '🛡 Market Fortified: major negotiation traps eliminated'
      : 'Good progress! Keep going on the Must Fix items'
  const motivatingColor =
    mustFixDone === mustFixItems.length ? '#166534' : mustFixDone > 0 ? '#92400e' : '#1e40af'
  const allMustFixDone = mustFixDone === mustFixItems.length

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
    <>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">What&apos;s worth a checkbook to upgrade before listing?</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    We&apos;ll guide you room by room. Upload a photo and our AI flags dated or worn cosmetic items with rough $ estimates — or skip and use the checklist below.
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
                      <h3 className="text-base font-semibold text-gray-900 mb-4">💰 Cosmetic upgrades worth a checkbook:</h3>
                      <div className="space-y-3">
                        {aiFindings.map((finding, i) => {
                          const style = AI_PRIORITY_STYLE[finding.priority] || AI_PRIORITY_STYLE['Optional']
                          return (
                            <div key={i} className="rounded-lg border p-4" style={{ borderColor: style.border, backgroundColor: style.bg }}>
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-sm font-semibold text-gray-900">{finding.issue}</span>
                                {finding.costRange && (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300"
                                  >
                                    {finding.costRange}
                                  </span>
                                )}
                                <span
                                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                                >
                                  {finding.priority}
                                </span>
                                <span className="text-xs text-gray-400 ml-auto">{finding.room}</span>
                              </div>
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
                  <div className="mb-6 rounded-lg px-4 py-3" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <p className="text-base font-semibold text-gray-900">
                      Fix it now → keep your price. Fix it later → negotiate it.
                    </p>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      Visible issues scare off buyers before they ever make an offer. Hidden ones become negotiation leverage after the buyer&apos;s inspector finds them — fixing them now keeps that leverage off the table.
                    </p>
                  </div>

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
                    Focus on <span className="font-semibold text-red-600">Must Fix</span> items first — every one you skip becomes leverage for the buyer&apos;s inspector. Tap a category to expand.
                  </p>

                  {/* Negotiation Defense summary */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#15803d' }}>🛡 Shielded Equity</p>
                        <p className="text-2xl font-bold" style={{ color: '#15803d' }}>${shieldedEquity.toLocaleString()}</p>
                        <p className="text-xs mt-1" style={{ color: '#166534' }}>Leverage you&apos;ve neutralized</p>
                      </div>
                      <div className="rounded-lg px-4 py-3 relative" style={{ backgroundColor: riskRemaining === 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${riskRemaining === 0 ? '#bbf7d0' : '#fecaca'}` }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1 flex items-center gap-1" style={{ color: riskRemaining === 0 ? '#15803d' : '#dc2626' }}>
                          ⚠ Risk Remaining
                          <span className="cursor-pointer group relative inline-block ml-0.5">
                            <span className="text-gray-400">ⓘ</span>
                            <span className="hidden group-hover:block absolute top-full left-0 mt-1 w-72 p-2 bg-gray-800 text-white text-xs font-normal normal-case tracking-normal rounded z-10">
                              Buyers often extract 5–10× the literal repair cost as a closing credit during the option period. Fixing a $50 leak now prevents the buyer&apos;s inspector flagging it as a $500 ask against your equity.
                            </span>
                          </span>
                        </p>
                        <p className="text-2xl font-bold" style={{ color: riskRemaining === 0 ? '#15803d' : '#dc2626' }}>${riskRemaining.toLocaleString()}</p>
                        <p className="text-xs mt-1" style={{ color: riskRemaining === 0 ? '#166534' : '#991b1b' }}>{mustFixItems.length - mustFixDone} Must Fix item{mustFixItems.length - mustFixDone === 1 ? '' : 's'} unchecked</p>
                      </div>
                    </div>

                    {/* Shield-fill bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">🛡 {mustFixDone} of {mustFixItems.length} Must Fix items shielded</span>
                        <span className="font-semibold" style={{ color: '#15803d' }}>{Math.round(mustFixProgress * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                        <div
                          className="h-full transition-all duration-300"
                          style={{ width: `${mustFixProgress * 100}%`, backgroundColor: '#16a34a' }}
                        />
                      </div>
                    </div>

                    <p className="text-xs font-medium mt-3" style={{ color: motivatingColor }}>{motivatingMessage}</p>
                  </div>

                  {/* Two-section accordion: Inspection Leverage (TREC) then Pre-listing Polish */}
                  {CHECKLIST_SECTIONS.map((section) => (
                    <div key={section.id} className="mb-6">
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-gray-900">{section.label}</h4>
                          {section.id === 'inspection' && (
                            <a
                              href={TREC_FORM_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium underline"
                              style={{ color: '#2563eb' }}
                            >
                              Based on TREC REI 7-6 ↗
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{section.sublabel}</p>
                      </div>

                      <div className="space-y-2">
                        {section.categories.map((category) => {
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
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-sm font-semibold text-gray-800">{category.label}</span>
                                  {category.trecSection && (
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                                      style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                                    >
                                      TREC {category.trecSection}
                                    </span>
                                  )}
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
                                  {category.items.map((item) => {
                                    const isChecked = checkedItems.has(item.id)
                                    const risk = negotiationRisk(item)
                                    const showRiskPill = section.contributesToShield && risk > 0
                                    return (
                                      <label
                                        key={item.id}
                                        className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 cursor-pointer transition-colors"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => handleCheck(item.id, e.target.checked)}
                                          className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                                          style={{ accentColor: ACCENT }}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span
                                              className="text-sm font-medium text-gray-800"
                                              style={isChecked ? { textDecoration: 'line-through', color: '#9ca3af' } : {}}
                                            >
                                              {item.name}
                                            </span>
                                            <PriorityBadge priority={item.priority} />
                                            {item.trecRef && (
                                              <span
                                                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                                                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                                              >
                                                TREC {item.trecRef}
                                              </span>
                                            )}
                                            {aiFlaggedItemIds.has(item.id) && (
                                              <span
                                                className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}
                                              >
                                                AI flagged
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            {showRiskPill && (
                                              <span
                                                className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                                                style={{
                                                  backgroundColor: isChecked ? '#f0fdf4' : '#fef2f2',
                                                  color: isChecked ? '#15803d' : '#dc2626',
                                                  border: `1px solid ${isChecked ? '#bbf7d0' : '#fecaca'}`,
                                                }}
                                              >
                                                {isChecked ? '✓' : '−'}${risk.toLocaleString()} {isChecked ? 'shielded' : 'at risk'}
                                              </span>
                                            )}
                                            <span className="text-xs text-gray-400">~{item.cost} to fix</span>
                                          </div>
                                        </div>
                                      </label>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="mb-6 rounded-lg px-4 py-3" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <p className="text-base font-semibold text-gray-900">
                      AI can&apos;t see leaks, wiring, or HVAC.
                    </p>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      A pre-listing inspection is usually the highest-leverage spend in this step — it surfaces the negotiation-leverage items a buyer&apos;s inspector would find later, while you still control the timing.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <button
                        type="button"
                        onClick={() => setInspectorPanelOpen(true)}
                        className="inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Find a pre-listing inspector
                        <span aria-hidden="true">→</span>
                      </button>
                      <span className="text-xs text-gray-500">$350–500</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => goTo(1)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectStep && onSelectStep(3)}
                        className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Next up: Staging &amp; Curb Appeal →
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
    <InspectorPanel
      open={inspectorPanelOpen}
      onClose={() => setInspectorPanelOpen(false)}
      homeAddress={null}
    />
    </>
  )
}
