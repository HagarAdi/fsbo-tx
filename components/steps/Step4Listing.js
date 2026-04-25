import { useState, useEffect, useRef } from 'react'

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

const LISTING_PRO_TIPS = [
  { text: 'Homes with professional photos sell 32% faster',                                        source: 'Zillow Research' },
  { text: 'Listings with 20+ photos get 2× more views than listings with fewer',                   source: 'HAR.com data' },
  { text: 'The first photo determines if buyers click — always lead with the best exterior shot',  source: 'Industry best practice' },
  { text: 'Natural light is everything — never shoot on a cloudy or rainy day',                    source: 'Professional RE photographer standard' },
]

const PHOTO_SERVICES = [
  { name: 'Austin RE Photography', specialty: 'Real estate photography', rating: '4.9', price: '$200-400', url: 'https://thumbtack.com' },
  { name: 'Round Rock Photo Pro',  specialty: 'HDR photography',         rating: '4.8', price: '$150-300', url: 'https://thumbtack.com' },
  { name: 'Texas Listing Photos',  specialty: 'Photos + virtual tour',   rating: '4.7', price: '$300-500', url: 'https://thumbtack.com' },
]

function loadStepData() {
  try { return JSON.parse(localStorage.getItem('fsbo_stepData') || '{}') } catch { return {} }
}

function buildDescription(address, step1, features, neighborhood) {
  const addr = address || '[your address]'
  const sqftNum = parseFloat(step1?.sqft)
  const sqftStr = !isNaN(sqftNum) && sqftNum > 0 ? `${sqftNum.toLocaleString()} sq ft ` : ''
  const beds = step1?.bedrooms
  const baths = step1?.bathrooms
  const bedsBaths =
    beds && baths ? ` offers ${beds} bedroom${beds !== '1' ? 's' : ''} and ${baths} bathroom${baths !== '1' ? 's' : ''}` :
    beds ? ` offers ${beds} bedroom${beds !== '1' ? 's' : ''}` :
    baths ? ` offers ${baths} bathroom${baths !== '1' ? 's' : ''}` : ''
  const f1 = features[0]?.trim() || 'stunning features'
  const f2 = features[1]?.trim() || 'thoughtful design'
  const f3 = features[2]?.trim() || 'exceptional location'
  const hood = neighborhood?.trim() || 'the neighborhood and community will delight you'

  return `Welcome to ${addr}! This beautiful ${sqftStr}home${bedsBaths} in one of Round Rock's most sought-after neighborhoods. ${f1}, ${f2}, and ${f3} make this home truly special. ${hood}. Don't miss this opportunity!`
}

function UploadZone({ photos, onAdd, maxPhotos }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
    const remaining = maxPhotos - photos.length
    const toAdd = valid.slice(0, remaining).map(f => ({ name: f.name, url: URL.createObjectURL(f) }))
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

export default function Step4Listing({ onComplete, isCompleted, onSelectStep }) {
  // Before wizard
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ living: [], kitchen: [], bathrooms: [], exterior: [] })
  const [showAiTooltip, setShowAiTooltip] = useState(false)

  const [beforeWizardComplete, setBeforeWizardComplete] = useState(false)

  // After wizard
  const [savedUploadedRooms, setSavedUploadedRooms] = useState([])
  const [afterWizardStage, setAfterWizardStage] = useState(0)
  const [afterWizardDone, setAfterWizardDone] = useState(false)
  const [afterPhotos, setAfterPhotos] = useState({ living: [], kitchen: [], bathrooms: [], exterior: [] })
  const [showCompareTooltip, setShowCompareTooltip] = useState(false)

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
    return loadStepData().step4?.listingDetails?.description ||
      buildDescription('', null, ['', '', ''], '')
  })
  const [copied, setCopied] = useState(false)

  const completeRef = useRef(null)
  const beforeSectionRef = useRef(null)
  const descriptionInitialized = useRef(false)

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
    } catch {}
  }, [afterWizardDone]) // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate description from inputs (skip first render so saved descriptions are preserved)
  useEffect(() => {
    if (!descriptionInitialized.current) { descriptionInitialized.current = true; return }
    setDescription(buildDescription(homeAddress, step1Data, features, neighborhood))
  }, [features, neighborhood]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist listing details
  useEffect(() => {
    try {
      const existing = loadStepData()
      localStorage.setItem('fsbo_stepData', JSON.stringify({
        ...existing,
        step4: { ...existing.step4, listingDetails: { features, neighborhood, vibe, description } },
      }))
    } catch {}
  }, [features, neighborhood, vibe, description])

  const addBeforePhotos = (id, newPhotos) => {
    setPhotos(prev => ({ ...prev, [id]: [...prev[id], ...newPhotos] }))
    try {
      const existing = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
      existing.step4 = existing.step4 || {}
      existing.step4.uploadedRooms = [...new Set([...(existing.step4.uploadedRooms || []), id])]
      localStorage.setItem('fsbo_stepData', JSON.stringify(existing))
      setSavedUploadedRooms(existing.step4.uploadedRooms)
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
      navigator.clipboard.writeText(description).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } catch {}
  }

  const updateFeature = (i, val) =>
    setFeatures(prev => { const next = [...prev]; next[i] = val; return next })

  // Listing description pills
  const pills = []
  if (step1Data?.bedrooms) pills.push(`${step1Data.bedrooms} bed`)
  if (step1Data?.bathrooms) pills.push(`${step1Data.bathrooms} bath`)
  if (step1Data?.sqft) pills.push(`${Number(step1Data.sqft).toLocaleString()} sqft`)
  if (step1Data?.yearBuilt) pills.push(`Built ${step1Data.yearBuilt}`)

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 max-w-3xl">

      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
        >
          Market
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Photography &amp; Listing</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        95% of buyers start their search online. Your photos are your first showing — bad photos
        cost you offers before buyers ever walk through the door.
      </p>

      {/* Photography guidelines */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Before you pick up your phone 📸</h3>
        <p className="text-sm text-gray-500 mb-6">
          These make the difference between photos that get clicks and photos that get skipped.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {PHOTO_TIPS.map(({ emoji, text }) => (
            <div key={text} className="flex items-start gap-4 px-5 py-4">
              <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before photo wizard */}
      <section ref={beforeSectionRef} className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload your practice shots</h3>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ll give you feedback on what to fix before the real shoot.
        </p>

        {!wizardDone ? (
          <PhotoWizard
            stages={BEFORE_STAGES}
            stageIndex={wizardStage}
            photos={photos}
            onAdd={addBeforePhotos}
            onAdvance={advanceBeforeWizard}
            label="Room"
          />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-700 mb-5">
              {totalBeforePhotos > 0
                ? `You uploaded ${totalBeforePhotos} photo${totalBeforePhotos !== 1 ? 's' : ''} across ${uploadedRooms.length} room${uploadedRooms.length !== 1 ? 's' : ''}`
                : "No photos uploaded — that's okay, you can still move forward."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative">
                <button
                  type="button"
                  disabled
                  onMouseEnter={() => setShowAiTooltip(true)}
                  onMouseLeave={() => setShowAiTooltip(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-not-allowed opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  Get AI feedback →
                </button>
                {showAiTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg z-10 pointer-events-none">
                    AI feedback coming soon
                    <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => completeRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Skip AI feedback — continue
              </button>
            </div>
          </div>
        )}
      </section>

      {/* After photo wizard — only visible after before wizard is complete */}
      {beforeWizardComplete && (
        <section className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Now let&apos;s see the real thing 📸</h3>
          <p className="text-sm text-gray-500 mb-6">
            Upload your final listing photos — same rooms as before so we can compare.
          </p>

          {savedUploadedRooms.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Upload your before photos first to enable room-by-room comparison
              </p>
              <button
                type="button"
                onClick={() => beforeSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-white transition-colors"
              >
                Go back to before photos
              </button>
            </div>
          ) : !afterWizardDone ? (
            <PhotoWizard
              stages={afterStages}
              stageIndex={afterWizardStage}
              photos={afterPhotos}
              onAdd={addAfterPhotos}
              onAdvance={advanceAfterWizard}
              label="Room"
            />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-medium text-gray-700 mb-5">
                {totalAfterPhotos > 0
                  ? `You uploaded ${totalAfterPhotos} final photo${totalAfterPhotos !== 1 ? 's' : ''} across ${afterUploadedRooms.length} room${afterUploadedRooms.length !== 1 ? 's' : ''}`
                  : "No final photos uploaded — that's okay, you can still move forward."}
              </p>
              <div className="relative inline-block">
                <button
                  type="button"
                  disabled
                  onMouseEnter={() => setShowCompareTooltip(true)}
                  onMouseLeave={() => setShowCompareTooltip(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-not-allowed opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  Compare before &amp; after →
                </button>
                {showCompareTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg z-10 pointer-events-none">
                    AI comparison coming soon
                    <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Listing description wizard */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Write your listing description ✍️</h3>
        <p className="text-sm text-gray-500 mb-6">
          A great description sells the lifestyle, not just the specs.
        </p>

        {/* Home details pills / step1 gate */}
        {step1Data ? (
          pills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {pills.map(pill => (
                <span
                  key={pill}
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
                >
                  {pill}
                </span>
              ))}
            </div>
          )
        ) : (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800">
              Complete Step 1 first to auto-fill your home details
            </p>
            <button
              type="button"
              onClick={() => onSelectStep && onSelectStep(1)}
              className="flex-shrink-0 text-sm font-semibold underline underline-offset-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              Go to Step 1 →
            </button>
          </div>
        )}

        <div className="space-y-5">
          {/* Top 3 features */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Top 3 features</label>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  type="text"
                  value={features[i]}
                  onChange={e => updateFeature(i, e.target.value)}
                  placeholder={FEATURE_PLACEHOLDERS[i]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': ACCENT }}
                />
              ))}
            </div>
          </div>

          {/* Neighborhood highlight */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Neighborhood highlight</label>
            <input
              type="text"
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              placeholder="e.g. Walking distance to Round Rock ISD"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            />
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Vibe</label>
            <select
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
            >
              {VIBE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Description textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Your listing description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${description.length > 1900 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {description.length} / 2,000 characters
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: copied ? '#6b7280' : ACCENT }}
              >
                {copied ? '✓ Copied!' : 'Copy description'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Where to list */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Where to list your home</h3>
        <p className="text-sm text-gray-500 mb-6">
          List on as many free platforms as possible — more exposure = more offers.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {LISTING_PLATFORMS.map(({ name, cost, description, url }) => (
            <div key={name} className="flex items-start gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={cost === 'Free'
                      ? { backgroundColor: '#dcfce7', color: '#15803d' }
                      : { backgroundColor: '#fef3c7', color: '#92400e' }}
                  >
                    {cost}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-sm font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
                style={{ color: ACCENT }}
              >
                Get started →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Pro tips */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LISTING_PRO_TIPS.map(({ text, source }) => (
            <div key={source} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-sm font-medium text-gray-800 mb-2">&ldquo;{text}&rdquo;</p>
              <p className="text-xs text-gray-400">{source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Photography services */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Want professional photos? Get a quote</h3>
        <p className="text-sm text-gray-500 mb-6">
          Professional photos typically cost $200-500 and pay for themselves many times over.
        </p>
        <div className="space-y-3">
          {PHOTO_SERVICES.map(({ name, specialty, rating, price, url }) => (
            <div key={name} className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{name}</p>
                <p className="text-xs text-gray-500">{specialty}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-500">⭐ {rating}</span>
                  <span className="text-xs font-medium text-gray-700">{price}</span>
                </div>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Get quote →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Mark complete */}
      <div ref={completeRef} className="pt-6 border-t border-gray-100">
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
              onClick={() => onSelectStep && onSelectStep(5)}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: ACCENT }}
            >
              Next up: Showings &amp; Open Houses →
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
