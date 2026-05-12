import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { notifyStepDataChange } from '../../utils/notifyStepData'
import PlatformPreviewCard from './PlatformPreviewCard'
import SetupModal from '../SetupModal'

const ACCENT = '#16a34a'

const PHOTO_TIPS = [
  { emoji: '🌤', text: 'Shoot between 10am–2pm for the best natural light' },
  { emoji: '💡', text: 'Turn on every single light in the house' },
  { emoji: '🪟', text: 'Open all blinds and curtains fully' },
  { emoji: '🧹', text: 'Declutter each room — remove personal items, laundry, dishes' },
  { emoji: '📐', text: 'Shoot from corners with your back against the wall' },
  { emoji: '📱', text: 'Hold phone at chest height, not eye level' },
  { emoji: '🔄', text: 'Get 3–5 shots per room, then pick the best one' },
  { emoji: '☀️', text: 'Exterior shots on sunny days only — never shoot outside on cloudy days' },
]

const BEFORE_STAGES = [
  { id: 'living',    label: 'Living room & common areas 🛋', tip: 'The living room is usually the hero shot — make it count.',                               maxPhotos: 5, nextLabel: 'Next →' },
  { id: 'kitchen',   label: 'Kitchen 🍳',                    tip: 'Clear the counters completely. Buyers want to see the space, not your stuff.',             maxPhotos: 3, nextLabel: 'Next →' },
  { id: 'bathrooms', label: 'Bathrooms 🚿',                  tip: 'Close the toilet lid. Remove personal items. Make it look like a hotel.',                  maxPhotos: 5, nextLabel: 'Next →' },
  { id: 'exterior',  label: 'Outside your home 🏡',          tip: 'Front of house, backyard, and any special features like a pool or patio.',                 maxPhotos: 5, nextLabel: 'Done →' },
]

const AFTER_CONFIGS = {
  living:    { label: 'Living room — final shot 🛋', maxPhotos: 5 },
  kitchen:   { label: 'Kitchen — final shot 🍳',    maxPhotos: 3 },
  bathrooms: { label: 'Bathrooms — final shot 🚿',  maxPhotos: 5 },
  exterior:  { label: 'Outside — final shot 🏡',    maxPhotos: 5 },
}

const VIBE_OPTIONS = [
  { value: 'warm',    label: 'Warm & family-friendly' },
  { value: 'modern',  label: 'Modern & sleek' },
  { value: 'quiet',   label: 'Quiet & peaceful' },
  { value: 'bright',  label: 'Bright & airy' },
]

const FEATURE_PLACEHOLDERS = [
  'e.g. Open floor plan',
  'e.g. Backs to greenbelt',
  'e.g. Updated kitchen',
]

const LISTING_PLATFORMS = [
  { name: 'HAR.com',              cost: 'Free',     description: 'Texas MLS data — the most accurate source for TX buyers. Essential for Houston and Austin markets.',  url: 'https://har.com' },
  { name: 'Zillow',               cost: 'Free',     description: 'Highest buyer traffic nationally. Most buyers start their search here.',                              url: 'https://zillow.com' },
  { name: 'Realtor.com',          cost: 'Free',     description: 'Strong buyer traffic, especially for serious buyers working with agents.',                            url: 'https://realtor.com' },
  { name: 'Facebook Marketplace', cost: 'Free',     description: 'Reach local buyers directly. Great for Round Rock and Austin neighborhoods.',                         url: 'https://facebook.com/marketplace' },
  { name: 'Nextdoor',             cost: 'Free',     description: 'Reach neighbors who know buyers. Word of mouth sells homes in TX suburbs.',                           url: 'https://nextdoor.com' },
  { name: 'FSBO.com',             cost: '$99-399',  description: 'Gets you MLS exposure without a full agent. Worth it for serious FSBO sellers.',                      url: 'https://fsbo.com' },
  { name: 'Flat Fee MLS TX',      cost: '$300-500', description: 'Lists you directly on the TX MLS — the same database agents use. Maximum exposure.',                 url: 'https://texasflatfeemls.com' },
]

const FSBO_PLATFORMS = [
  { key: 'zillow',     label: 'Zillow / MLS', listUrl: 'https://www.zillow.com/post-a-home-for-sale/' },
  { key: 'facebook',   label: 'Facebook',     listUrl: 'https://www.facebook.com/marketplace/create/item' },
  { key: 'instagram',  label: 'Instagram',    listUrl: null },
  { key: 'craigslist', label: 'Craigslist',   listUrl: 'https://geo.craigslist.org/iso/us/tx' },
]

const FLAT_FEE_MLS_PARTNERS = [
  { name: 'List with Freedom',     price: '$129 flat-fee MLS',         url: 'https://listwithfreedom.com',     blurb: 'Free 6-photo MLS listing. Texas coverage.' },
  { name: 'Texas Flat Fee Realty', price: '$295 + 0.25% at closing',   url: 'https://texasflatfeemls.com',     blurb: 'Texas-only broker; full MLS exposure + paperwork support.' },
  { name: 'Houzeo',                price: '$349 flat-fee MLS',         url: 'https://houzeo.com',              blurb: 'Most popular FSBO MLS service nationwide; Texas-licensed.' },
]

const SPEC_FIELDS = [
  { key: 'bedrooms',  label: 'Beds',       type: 'number', step: '1' },
  { key: 'bathrooms', label: 'Baths',      type: 'number', step: '0.5' },
  { key: 'sqft',      label: 'Sqft',       type: 'number', step: '1' },
  { key: 'yearBuilt', label: 'Year built', type: 'number', step: '1' },
]

const EMPTY_PLATFORM_DRAFTS = { zillow: '', facebook: '', instagram: '', craigslist: '' }
const EMPTY_PLATFORM_DIRTY  = { zillow: false, facebook: false, instagram: false, craigslist: false }

function parseCity(addr) {
  if (!addr) return ''
  // Heuristic: "123 Main St, Round Rock, TX 78664" → "Round Rock"
  const parts = String(addr).split(',').map(p => p.trim()).filter(Boolean)
  return parts.length >= 2 ? parts[parts.length - 2] : ''
}

function applyPlatformTemplate(platformKey, inputs) {
  const { specs = {}, vibe = '', features = [], neighborhood = '', description = '', homeAddress = '' } = inputs || {}
  const city = parseCity(homeAddress) || 'your neighborhood'
  const beds = specs.bedrooms || ''
  const baths = specs.bathrooms || ''
  const sqftN = parseFloat(specs.sqft)
  const sqft = !isNaN(sqftN) && sqftN > 0 ? `${sqftN.toLocaleString()} sqft` : ''
  const year = specs.yearBuilt || ''
  const specLine = [beds && `${beds}BR`, baths && `${baths}BA`, sqft, year && `Built ${year}`].filter(Boolean).join(' · ')
  const bodyOrFallback = (description && description.trim()) ||
    `A ${vibe || 'welcoming'} home in ${city} ready for its next chapter.`
  const feats = features.map(f => (f || '').trim()).filter(Boolean)
  const hood = (neighborhood || '').trim()
  const hashtagize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')

  if (platformKey === 'zillow') {
    const lines = []
    if (specLine) lines.push(specLine)
    if (lines.length) lines.push('')
    lines.push(bodyOrFallback)
    if (feats.length) {
      lines.push('')
      lines.push('Features:')
      feats.forEach(f => lines.push(`• ${f}`))
    }
    if (hood) {
      lines.push('')
      lines.push(hood)
    }
    lines.push('')
    lines.push('Contact owner directly to schedule a showing.')
    return lines.join('\n')
  }

  if (platformKey === 'facebook') {
    const lines = []
    const headline = specLine ? `🏡 ${specLine}${city ? ` in ${city}` : ''}` : `🏡 Home for sale${city ? ` in ${city}` : ''}`
    lines.push(headline)
    lines.push('')
    lines.push(bodyOrFallback)
    if (feats.length) {
      lines.push('')
      lines.push('✨ Features:')
      feats.forEach(f => lines.push(`  • ${f}`))
    }
    if (hood) {
      lines.push('')
      lines.push(`📍 ${hood}`)
    }
    lines.push('')
    lines.push('DM to schedule a viewing! 📩')
    return lines.join('\n')
  }

  if (platformKey === 'instagram') {
    const firstSentence = bodyOrFallback.split(/(?<=[.!?])\s+/)[0] || bodyOrFallback
    const tagPool = [
      'fsbo',
      city && `${hashtagize(city)}realestate`,
      'homeforsale',
      vibe && hashtagize(vibe),
      'texasrealestate',
      ...feats.map(hashtagize),
    ].filter(Boolean)
    const seen = new Set()
    const tags = tagPool.filter(t => { if (seen.has(t)) return false; seen.add(t); return true }).slice(0, 10)
    const lines = [firstSentence]
    if (specLine) lines.push(specLine)
    if (tags.length) {
      lines.push('')
      lines.push(tags.map(t => `#${t}`).join(' '))
    }
    return lines.join('\n')
  }

  if (platformKey === 'craigslist') {
    const lines = []
    if (specLine) lines.push(specLine)
    if (lines.length) lines.push('')
    lines.push(bodyOrFallback)
    if (feats.length) {
      lines.push('')
      lines.push('Features:')
      feats.forEach(f => lines.push(`- ${f}`))
    }
    if (hood) {
      lines.push('')
      lines.push(`Neighborhood: ${hood}`)
    }
    lines.push('')
    lines.push('Contact owner. No agents please.')
    return lines.join('\n')
  }

  return bodyOrFallback
}

const PRO_TIPS = [
  { text: 'Homes with professional photos sell 32% faster',                                        source: 'Zillow Research' },
  { text: 'Listings with 20+ photos get 2× more views than listings with fewer',                   source: 'HAR.com data' },
  { text: 'The first photo determines if buyers click — always lead with the best exterior shot',  source: 'Industry best practice' },
  { text: 'Natural light is everything — never shoot on a cloudy or rainy day',                    source: 'Professional RE photographer standard' },
]

const YARD_SIGN_PROVIDERS = [
  { name: 'Amazon',           priceRange: '$20–50',  url: 'https://www.amazon.com/s?k=fsbo+yard+sign', blurb: 'Pre-printed FSBO signs, delivered in 2 days.' },
  { name: 'Home Depot',       priceRange: '$30–80',  url: 'https://www.homedepot.com',                 blurb: 'Pick up the same day in most TX metros.' },
  { name: 'Local print shop', priceRange: '$50–100', url: 'https://www.google.com/search?q=sign+printing+near+me', blurb: 'Custom design with your wording — search "sign printing near me".' },
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

const EMPTY_MEDIA = { yardSignOrdered: false, virtualTourUrl: '', virtualTourType: '' }

const SUB_STEPS = [
  { id: 1, label: 'Photography' },
  { id: 2, label: 'Your Listing' },
]

const slideVariants = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.16, ease: 'easeIn' } }),
}

const PHOTO_SERVICES = [
  { name: 'Austin RE Photography', specialty: 'Real estate photography', rating: '4.9', price: '$200-400', url: 'https://thumbtack.com' },
  { name: 'Round Rock Photo Pro',  specialty: 'HDR photography',         rating: '4.8', price: '$150-300', url: 'https://thumbtack.com' },
  { name: 'Texas Listing Photos',  specialty: 'Photos + virtual tour',   rating: '4.7', price: '$300-500', url: 'https://thumbtack.com' },
]

function loadStepData() {
  try { return JSON.parse(localStorage.getItem('fsbo_stepData') || '{}') } catch { return {} }
}

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
          onChange={e => handleFiles(e.target.files)}
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

function PhotoWizard({ stages, stageIndex, photos, onAdd, onAdvance, label }) {
  const current = stages[stageIndex]
  if (!current) return null
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label} {stageIndex + 1} of {stages.length}
          </span>
          <div className="flex gap-1.5">
            {stages.map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-8 rounded-full transition-colors"
                style={{ backgroundColor: i <= stageIndex ? ACCENT : '#e5e7eb' }}
              />
            ))}
          </div>
        </div>
        <h4 className="text-base font-semibold text-gray-900">{current.label}</h4>
        {current.tip && <p className="mt-1 text-sm text-gray-500">{current.tip}</p>}
      </div>
      <div className="px-6 py-5">
        <UploadZone
          photos={photos[current.id] || []}
          onAdd={newPhotos => onAdd(current.id, newPhotos)}
          maxPhotos={current.maxPhotos}
        />
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onAdvance}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            {current.nextLabel}
          </button>
          <button
            type="button"
            onClick={onAdvance}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Step4Listing({ onSelectStep }) {
  const [activeSubStep, setActiveSubStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const goTo = (step) => {
    setDirection(step > activeSubStep ? 1 : -1)
    setActiveSubStep(step)
  }

  // Before wizard
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ living: [], kitchen: [], bathrooms: [], exterior: [] })
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [beforeWizardComplete, setBeforeWizardComplete] = useState(false)

  // After wizard
  const [savedUploadedRooms, setSavedUploadedRooms] = useState([])
  const [afterWizardStage, setAfterWizardStage] = useState(0)
  const [afterWizardDone, setAfterWizardDone] = useState(false)
  const [afterPhotos, setAfterPhotos] = useState({ living: [], kitchen: [], bathrooms: [], exterior: [] })
  const [comparing, setComparing] = useState(false)
  const [compareError, setCompareError] = useState(null)
  const [compareResults, setCompareResults] = useState(null)

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

  const handleAnalyzePhotos = async () => {
    const allFiles = Object.values(photos).flat().map(p => p.file).filter(Boolean)
    if (allFiles.length === 0) {
      setAnalyzeError('Upload a practice shot first, or skip to Your Listing.')
      return
    }
    setAnalyzing(true)
    setAiFeedback(null)
    setAnalyzeError(null)
    try {
      const base64Images = await Promise.all(allFiles.map(toBase64Compressed))
      const res = await fetch('/api/analyze-photography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images }),
      })
      const data = await res.json()
      setAiFeedback(data.findings || [])
    } catch {
      setAnalyzeError("Couldn't analyze photos — try again, or skip ahead.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCompare = async () => {
    const beforeFiles = Object.values(photos).flat().map(p => p.file).filter(Boolean)
    const afterFiles = Object.values(afterPhotos).flat().map(p => p.file).filter(Boolean)
    if (beforeFiles.length === 0 || afterFiles.length === 0) {
      setCompareError('Upload both practice and final shots to compare.')
      return
    }
    setComparing(true)
    setCompareResults(null)
    setCompareError(null)
    try {
      const allFiles = [...beforeFiles, ...afterFiles]
      const base64Images = await Promise.all(allFiles.map(toBase64Compressed))
      const res = await fetch('/api/analyze-photography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images, mode: 'compare' }),
      })
      const data = await res.json()
      setCompareResults(data.findings || [])
    } catch {
      setCompareError("Couldn't compare photos — try again, or skip ahead.")
    } finally {
      setComparing(false)
    }
  }

  // Listing description
  const [step1Data] = useState(() => {
    if (typeof window === 'undefined') return null
    const d = loadStepData().step1
    if (!d) return null
    return (d.sqft || d.bedrooms || d.bathrooms || d.yearBuilt) ? d : null
  })
  const [homeAddress] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('fsbo_homeAddress') || ''
  })
  const [features, setFeatures] = useState(() => {
    if (typeof window === 'undefined') return ['', '', '']
    return loadStepData().step4?.listingDetails?.features || ['', '', '']
  })
  const [neighborhood, setNeighborhood] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStepData().step4?.listingDetails?.neighborhood || ''
  })
  const [vibe, setVibe] = useState(() => {
    if (typeof window === 'undefined') return 'warm'
    return loadStepData().step4?.listingDetails?.vibe || 'warm'
  })
  const [description, setDescription] = useState(() => {
    if (typeof window === 'undefined') return ''
    return loadStepData().step4?.listingDetails?.description || ''
  })
  const [copied, setCopied] = useState(false)

  const [specs, setSpecs] = useState(() => {
    if (typeof window === 'undefined') return { sqft: '', bedrooms: '', bathrooms: '', yearBuilt: '' }
    const saved = loadStepData().step4?.listingDetails?.specs
    if (saved) return saved
    const s1 = loadStepData().step1 || {}
    return {
      sqft: s1.sqft || '',
      bedrooms: s1.bedrooms || '',
      bathrooms: s1.bathrooms || '',
      yearBuilt: s1.yearBuilt || '',
    }
  })

  const [activePlatform, setActivePlatform] = useState(() => {
    if (typeof window === 'undefined') return 'zillow'
    return loadStepData().step4?.listingDetails?.activePlatform || 'zillow'
  })
  const [platformDrafts, setPlatformDrafts] = useState(() => {
    if (typeof window === 'undefined') return EMPTY_PLATFORM_DRAFTS
    return loadStepData().step4?.listingDetails?.platformDrafts || EMPTY_PLATFORM_DRAFTS
  })
  const [platformDraftsDirty, setPlatformDraftsDirty] = useState(() => {
    if (typeof window === 'undefined') return EMPTY_PLATFORM_DIRTY
    return loadStepData().step4?.listingDetails?.platformDraftsDirty || EMPTY_PLATFORM_DIRTY
  })
  const [listNowMenuOpen, setListNowMenuOpen] = useState(false)
  const [mlsExpanded, setMlsExpanded] = useState(false)
  const [selectedMls, setSelectedMls] = useState(() => {
    if (typeof window === 'undefined') return null
    return loadStepData().step4?.selectedMls || null
  })
  const [media, setMedia] = useState(() => {
    if (typeof window === 'undefined') return EMPTY_MEDIA
    return { ...EMPTY_MEDIA, ...(loadStepData().step4?.media || {}) }
  })
  const [activeMediaModal, setActiveMediaModal] = useState(null)
  const listNowMenuRef = useRef(null)

  // Derived — before wizard
  const totalBeforePhotos = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0)
  const uploadedRooms = BEFORE_STAGES.filter(s => photos[s.id].length > 0).map(s => s.id)

  // Derived — after wizard
  const afterStages = savedUploadedRooms
    .filter(id => AFTER_CONFIGS[id])
    .map((id, idx, arr) => ({
      id,
      ...AFTER_CONFIGS[id],
      nextLabel: idx === arr.length - 1 ? 'Done →' : 'Next →',
    }))
  const totalAfterPhotos = afterStages.reduce((sum, s) => sum + (afterPhotos[s.id]?.length || 0), 0)
  const afterUploadedRooms = afterStages.filter(s => (afterPhotos[s.id]?.length || 0) > 0).map(s => s.id)

  // Save before uploadedRooms when before wizard finishes
  useEffect(() => {
    if (!wizardDone) return
    try {
      const existing = loadStepData()
      localStorage.setItem('fsbo_stepData', JSON.stringify({
        ...existing,
        step4: { ...existing.step4, uploadedRooms },
      }))
      notifyStepDataChange()
    } catch {}
  }, [wizardDone]) // eslint-disable-line react-hooks/exhaustive-deps

  // Read uploadedRooms from localStorage when after wizard becomes visible
  useEffect(() => {
    if (!beforeWizardComplete) return
    setSavedUploadedRooms(loadStepData().step4?.uploadedRooms || [])
  }, [beforeWizardComplete])

  // Save after photos when after wizard finishes
  useEffect(() => {
    if (!afterWizardDone) return
    const afterPhotoData = {}
    afterUploadedRooms.forEach(id => {
      afterPhotoData[id] = afterPhotos[id].map(p => p.name)
    })
    try {
      const existing = loadStepData()
      localStorage.setItem('fsbo_stepData', JSON.stringify({
        ...existing,
        step4: { ...existing.step4, afterPhotos: afterPhotoData },
      }))
      notifyStepDataChange()
    } catch {}
  }, [afterWizardDone]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-template undirty platforms whenever the upstream inputs change
  useEffect(() => {
    setPlatformDrafts(prev => {
      const next = { ...prev }
      let changed = false
      FSBO_PLATFORMS.forEach(({ key }) => {
        if (platformDraftsDirty[key]) return
        const fresh = applyPlatformTemplate(key, { specs, vibe, features, neighborhood, description, homeAddress })
        if (next[key] !== fresh) { next[key] = fresh; changed = true }
      })
      return changed ? next : prev
    })
  }, [specs, vibe, features, neighborhood, description, homeAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close the List Now menu on outside click
  useEffect(() => {
    if (!listNowMenuOpen) return
    const onMouseDown = (e) => {
      if (listNowMenuRef.current && !listNowMenuRef.current.contains(e.target)) {
        setListNowMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [listNowMenuOpen])

  // Persist listing details + MLS selection + media
  useEffect(() => {
    try {
      const existing = loadStepData()
      localStorage.setItem('fsbo_stepData', JSON.stringify({
        ...existing,
        step4: {
          ...existing.step4,
          listingDetails: { features, neighborhood, vibe, description, specs, platformDrafts, platformDraftsDirty, activePlatform },
          selectedMls,
          media,
        },
      }))
      notifyStepDataChange()
    } catch {}
  }, [features, neighborhood, vibe, description, specs, platformDrafts, platformDraftsDirty, activePlatform, selectedMls, media])

  const addBeforePhotos = (id, newPhotos) => {
    setPhotos(prev => ({ ...prev, [id]: [...prev[id], ...newPhotos] }))
    try {
      const existing = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
      existing.step4 = existing.step4 || {}
      existing.step4.uploadedRooms = [...new Set([...(existing.step4.uploadedRooms || []), id])]
      localStorage.setItem('fsbo_stepData', JSON.stringify(existing))
      setSavedUploadedRooms(existing.step4.uploadedRooms)
      notifyStepDataChange()
    } catch {}
  }

  const advanceBeforeWizard = () => {
    if (wizardStage < BEFORE_STAGES.length - 1) setWizardStage(s => s + 1)
    else { setWizardDone(true); setBeforeWizardComplete(true) }
  }

  const addAfterPhotos = (id, newPhotos) =>
    setAfterPhotos(prev => ({ ...prev, [id]: [...(prev[id] || []), ...newPhotos] }))

  const advanceAfterWizard = () => {
    if (afterWizardStage < afterStages.length - 1) setAfterWizardStage(s => s + 1)
    else setAfterWizardDone(true)
  }

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(platformDrafts[activePlatform] || '').then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } catch {}
  }

  const handlePlatformChange = (key) => setActivePlatform(key)
  const handlePlatformDraftChange = (key, value) => {
    setPlatformDrafts(p => ({ ...p, [key]: value }))
    setPlatformDraftsDirty(d => ({ ...d, [key]: true }))
  }
  const handleResetPlatform = (key) => {
    const fresh = applyPlatformTemplate(key, { specs, vibe, features, neighborhood, description, homeAddress })
    setPlatformDrafts(p => ({ ...p, [key]: fresh }))
    setPlatformDraftsDirty(d => ({ ...d, [key]: false }))
  }
  const handleSpecChange = (field, value) =>
    setSpecs(prev => ({ ...prev, [field]: value }))
  const handleResetSpecsFromStep1 = () => {
    if (!step1Data) return
    setSpecs({
      sqft: step1Data.sqft || '',
      bedrooms: step1Data.bedrooms || '',
      bathrooms: step1Data.bathrooms || '',
      yearBuilt: step1Data.yearBuilt || '',
    })
  }
  const handleSelectMls = (partnerName) => {
    setSelectedMls(partnerName)
    setMlsExpanded(false)
  }
  const handleToggleListNow = () => setListNowMenuOpen(o => !o)
  const handleToggleMlsExpanded = () => setMlsExpanded(o => !o)

  const specsDifferFromStep1 = !!step1Data && (
    String(specs.sqft || '') !== String(step1Data.sqft || '') ||
    String(specs.bedrooms || '') !== String(step1Data.bedrooms || '') ||
    String(specs.bathrooms || '') !== String(step1Data.bathrooms || '') ||
    String(specs.yearBuilt || '') !== String(step1Data.yearBuilt || '')
  )

  const updateFeature = (i, val) =>
    setFeatures(prev => { const next = [...prev]; next[i] = val; return next })

  return (
    <div className="px-4 py-8 md:px-10 md:py-12">
      {/* Static header */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
          Market
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Photography &amp; Listing</h2>
      <p className="text-gray-600 leading-relaxed mb-8">
        <span className="font-semibold text-gray-800">Why it matters:</span> 95% of buyers start their search online. Your photos are your first showing — bad photos cost you offers before buyers ever walk through the door.
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

              {/* Card 1: Photography */}
              {activeSubStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload your practice shots</h3>
                  <p className="text-sm text-gray-500 mb-6">We&apos;ll give you feedback on what to fix before the real shoot.</p>

                  {!wizardDone ? (
                    <div className="mb-8">
                      <PhotoWizard stages={BEFORE_STAGES} stageIndex={wizardStage} photos={photos} onAdd={addBeforePhotos} onAdvance={advanceBeforeWizard} label="Room" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
                      <p className="text-sm font-medium text-gray-700 mb-5">
                        {totalBeforePhotos > 0
                          ? `You uploaded ${totalBeforePhotos} photo${totalBeforePhotos !== 1 ? 's' : ''} across ${uploadedRooms.length} room${uploadedRooms.length !== 1 ? 's' : ''}`
                          : "No photos uploaded — that's okay, you can still move forward."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div>
                          <button
                            type="button"
                            onClick={handleAnalyzePhotos}
                            disabled={analyzing}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {analyzing ? 'Analyzing your shots... 🔍' : 'Get AI feedback →'}
                          </button>
                          {analyzeError && <p className="mt-2 text-sm text-gray-500">{analyzeError}</p>}
                        </div>
                        <button type="button" onClick={() => goTo(2)} className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors">
                          Skip — go to Your Listing
                        </button>
                      </div>

                      {aiFeedback && aiFeedback.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">📸 Technique feedback:</h4>
                          <div className="space-y-3">
                            {aiFeedback.map((f, i) => {
                              const sev = f.severity || 'Improve'
                              const sevStyle =
                                sev === 'Reshoot' ? { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' } :
                                sev === 'Looks Good' ? { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' } :
                                { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' }
                              return (
                                <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="text-sm font-semibold text-gray-900">{f.shot}</span>
                                    <span
                                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                      style={{ backgroundColor: sevStyle.bg, color: sevStyle.text, border: `1px solid ${sevStyle.border}` }}
                                    >
                                      {sev}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">{f.feedback}</p>
                                  {f.fix && <p className="mt-1 text-xs text-gray-500 italic">Fix: {f.fix}</p>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* After photo wizard — visible once before wizard complete */}
                  {beforeWizardComplete && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Now let&apos;s see the real thing 📸</h3>
                      <p className="text-sm text-gray-500 mb-6">Upload your final listing photos — same rooms as before so we can compare.</p>

                      {savedUploadedRooms.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 text-center">
                          <p className="text-sm text-gray-600">Upload before photos above to enable room-by-room comparison</p>
                        </div>
                      ) : !afterWizardDone ? (
                        <PhotoWizard stages={afterStages} stageIndex={afterWizardStage} photos={afterPhotos} onAdd={addAfterPhotos} onAdvance={advanceAfterWizard} label="Room" />
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                          <p className="text-sm font-medium text-gray-700 mb-5">
                            {totalAfterPhotos > 0
                              ? `You uploaded ${totalAfterPhotos} final photo${totalAfterPhotos !== 1 ? 's' : ''} across ${afterUploadedRooms.length} room${afterUploadedRooms.length !== 1 ? 's' : ''}`
                              : "No final photos uploaded — that's okay, you can still move forward."}
                          </p>
                          <div>
                            <button
                              type="button"
                              onClick={handleCompare}
                              disabled={comparing}
                              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: ACCENT }}
                            >
                              {comparing ? 'Comparing your shots... 🔍' : 'Compare before & after →'}
                            </button>
                            {compareError && <p className="mt-2 text-sm text-gray-500">{compareError}</p>}
                          </div>

                          {compareResults && compareResults.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">📊 Before vs. after:</h4>
                              <div className="space-y-3">
                                {compareResults.map((r, i) => {
                                  const v = r.verdict || 'Similar'
                                  const vStyle =
                                    v === 'Much Better' || v === 'Better' ? { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' } :
                                    v === 'Worse' ? { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' } :
                                    { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' }
                                  return (
                                    <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="text-sm font-semibold text-gray-900">{r.room}</span>
                                        <span
                                          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                          style={{ backgroundColor: vStyle.bg, color: vStyle.text, border: `1px solid ${vStyle.border}` }}
                                        >
                                          {v}
                                        </span>
                                      </div>
                                      {r.whatImproved && <p className="text-xs text-gray-600">✓ {r.whatImproved}</p>}
                                      {r.stillNeedsWork && <p className="mt-1 text-xs text-gray-500 italic">Still needs work: {r.stillNeedsWork}</p>}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => goTo(2)} className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                      Continue to Your Listing →
                    </button>
                  </div>
                </div>
              )}

              {/* Card 2: Your Listing */}
              {activeSubStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Write your listing — preview every platform ✍️</h3>
                  <p className="text-sm text-gray-500 mb-6">A great description sells the lifestyle. Switch platforms to see how it reads on each one.</p>

                  {!step1Data && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
                      <p className="text-sm text-amber-800">Complete Step 1 first to auto-fill your home specs</p>
                      <button type="button" onClick={() => onSelectStep && onSelectStep(1)} className="flex-shrink-0 text-sm font-semibold underline underline-offset-2 text-amber-700 hover:text-amber-900 transition-colors">
                        Go to Step 1 →
                      </button>
                    </div>
                  )}

                  {/* Two-column inputs + preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Left: inputs */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Vibe</label>
                        <select value={vibe} onChange={e => setVibe(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition">
                          {VIBE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-800">Specs</label>
                          {specsDifferFromStep1 && (
                            <button type="button" onClick={handleResetSpecsFromStep1} className="text-xs font-semibold underline underline-offset-2 text-gray-500 hover:text-gray-800 transition-colors">
                              ↻ Reset from Step 1
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {SPEC_FIELDS.map(f => (
                            <div key={f.key}>
                              <input
                                type={f.type}
                                step={f.step}
                                value={specs[f.key] ?? ''}
                                onChange={e => handleSpecChange(f.key, e.target.value)}
                                placeholder={f.label}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                              />
                              <p className="text-xs text-gray-400 mt-0.5">{f.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Top 3 features</label>
                        <div className="space-y-2">
                          {[0, 1, 2].map(i => (
                            <input key={i} type="text" value={features[i]} onChange={e => updateFeature(i, e.target.value)} placeholder={FEATURE_PLACEHOLDERS[i]} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Neighborhood highlight</label>
                        <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="e.g. Walking distance to Round Rock ISD" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition" />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Core description (seeds all platforms)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} maxLength={2000} placeholder="A short body paragraph describing the home in your own voice. Each platform's preview is generated from this plus your inputs above." className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:border-transparent transition resize-none" />
                        <p className={`text-xs mt-1 ${description.length > 1900 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{description.length} / 2,000 characters</p>
                      </div>
                    </div>

                    {/* Right: preview */}
                    <PlatformPreviewCard
                      platforms={FSBO_PLATFORMS}
                      activePlatform={activePlatform}
                      onPlatformChange={handlePlatformChange}
                      drafts={platformDrafts}
                      dirty={platformDraftsDirty}
                      onDraftChange={handlePlatformDraftChange}
                      onReset={handleResetPlatform}
                      onCopy={handleCopy}
                      copied={copied}
                      onToggleListNow={handleToggleListNow}
                      listNowMenuOpen={listNowMenuOpen}
                      listNowMenuRef={listNowMenuRef}
                    />
                  </div>

                  {/* MLS Shortcut nudge — only when no MLS partner has been marked */}
                  {!selectedMls && (
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-blue-900">🤝 Want us to handle the listing for you?</p>
                          <p className="text-xs text-blue-800 mt-1">Check out our Flat-Fee MLS partners — list on the MLS for a one-time fee without a full agent.</p>
                        </div>
                        <button type="button" onClick={handleToggleMlsExpanded} className="flex-shrink-0 text-sm font-semibold underline underline-offset-2 text-blue-700 hover:text-blue-900 transition-colors">
                          {mlsExpanded ? 'Hide partners ▴' : 'Show partners ▾'}
                        </button>
                      </div>
                      {mlsExpanded && (
                        <div className="mt-4 space-y-2">
                          {FLAT_FEE_MLS_PARTNERS.map(p => (
                            <div key={p.name} className="rounded-lg border border-blue-200 bg-white px-4 py-3 flex items-start justify-between gap-3 flex-wrap">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{p.price}</p>
                                <p className="text-xs text-gray-600 mt-1">{p.blurb}</p>
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <a href={p.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-800 bg-white hover:bg-gray-50 transition-colors text-center">
                                  Visit →
                                </a>
                                <button type="button" onClick={() => handleSelectMls(p.name)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                                  Mark as selected
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Marketing assets — virtual tour + yard sign */}
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Marketing assets</p>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">🎥 Virtual Tour</p>
                            <p className="text-xs text-gray-500 mt-0.5">Optional — boosts engagement on Zillow / Realtor.com (NAR: 87% more views).</p>
                          </div>
                          <button type="button" onClick={() => setActiveMediaModal('virtualtour')} className="flex-shrink-0 text-xs font-semibold underline underline-offset-2 text-gray-500 hover:text-gray-800 transition-colors">
                            See your options →
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2">
                          <input
                            type="url"
                            value={media.virtualTourUrl}
                            onChange={e => setMedia(prev => ({ ...prev, virtualTourUrl: e.target.value }))}
                            placeholder="https://my.matterport.com/show/?m=..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                          />
                          <select
                            value={media.virtualTourType}
                            onChange={e => setMedia(prev => ({ ...prev, virtualTourType: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                          >
                            <option value="">Type…</option>
                            {VIRTUAL_TOUR_PROVIDERS.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">🪧 Yard Sign</p>
                            <p className="text-xs text-gray-500 mt-0.5">Most drive-by buyers find the home from the sign — and they&apos;re often the neighbors&apos; friends.</p>
                          </div>
                          <button type="button" onClick={() => setActiveMediaModal('yardsign')} className="flex-shrink-0 text-xs font-semibold underline underline-offset-2 text-gray-500 hover:text-gray-800 transition-colors">
                            Where to buy →
                          </button>
                        </div>
                        <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={media.yardSignOrdered}
                            onChange={e => setMedia(prev => ({ ...prev, yardSignOrdered: e.target.checked }))}
                            className="w-4 h-4 accent-green-600"
                          />
                          <span className="text-sm text-gray-700">Sign ordered</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => goTo(1)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                        ← Back
                      </button>
                      <button type="button" onClick={() => onSelectStep && onSelectStep(5)} className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                        Next up: Showings &amp; Open Houses →
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Context-aware sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-4 space-y-4">
          {activeSubStep === 1 ? (
            <>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Before You Shoot 📸</h4>
                <div className="space-y-2">
                  {PHOTO_TIPS.map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-2">
                      <span className="text-sm flex-shrink-0">{emoji}</span>
                      <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pro Tips</h4>
                <div className="space-y-3">
                  {PRO_TIPS.slice(0, 2).map(({ text, source }, i) => (
                    <div key={i} className="border-l-2 pl-3" style={{ borderColor: ACCENT }}>
                      <p className="text-xs text-gray-700 leading-relaxed mb-1">{text}</p>
                      <p className="text-xs text-gray-400">— {source}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Where to List</h4>
                <div className="space-y-2">
                  {LISTING_PLATFORMS.map(({ name, cost, url }) => (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors gap-2">
                      <span className="text-xs font-medium text-gray-800 truncate">{name}</span>
                      <span className="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full" style={cost === 'Free' ? { backgroundColor: '#dcfce7', color: '#15803d' } : { backgroundColor: '#fef3c7', color: '#92400e' }}>{cost}</span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Need a Pro?</h4>
                <p className="text-xs text-gray-500 mb-3">Professional photos pay for themselves many times over.</p>
                <div className="space-y-2">
                  {PHOTO_SERVICES.map(({ name, specialty, rating, price, url }) => (
                    <div key={name} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400">{specialty} · ⭐ {rating} · {price}</p>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                        Quote
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Setup modals */}
      <SetupModal open={activeMediaModal === 'yardsign'} onClose={() => setActiveMediaModal(null)} title="🪧 Yard Sign">
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

      <SetupModal open={activeMediaModal === 'virtualtour'} onClose={() => setActiveMediaModal(null)} title="🎥 Virtual Tour">
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
    </div>
  )
}
