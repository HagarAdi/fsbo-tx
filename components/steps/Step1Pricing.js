import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HelpTip from '../Tooltip'
import AppraiserPanel from '../AppraiserPanel'
import { notifyStepDataChange } from '../../utils/notifyStepData'

const ACCENT = '#16a34a'
const EMPTY_COMP = {
  address: '', price: '', sqft: '', yearBuilt: '', dom: '',
  bedrooms: '', bathrooms: '', lotAcres: '',
  pool: null, garageCars: '', stories: '', condition: '', propertyType: '',
}

const CONDITION_PCT = { Excellent: 0.04, Good: 0, Average: -0.03, Fair: -0.06 }

// Per-comp adjustments: dollars (or multipliers) applied to the comp price to
// estimate what the comp would have sold for if it matched the subject home.
const POOL_ADJUSTMENT = 20000
const PER_GARAGE_SPACE = 5000
const ONE_STORY_PREMIUM = 0.02
// In TX suburbs, land typically represents ~20% of total home value.
const LOT_VALUE_PCT = 0.20
const SQFT_PER_ACRE = 43560

const PROPERTY_TYPE_OPTIONS = [
  { value: 'single', label: 'Single family' },
  { value: 'town', label: 'Townhouse' },
  { value: 'condo', label: 'Condo' },
  { value: 'multi', label: 'Multi-family' },
]
const PROPERTY_TYPE_LABELS = Object.fromEntries(PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.label]))

function adjustCompPrice(comp, subject) {
  const price = parseFloat(comp.price)
  if (!(price > 0)) return { adjustedPrice: null, deltas: [] }
  let p = price
  const deltas = []

  if (subject.pool !== null && comp.pool !== null && subject.pool !== comp.pool) {
    const delta = subject.pool ? POOL_ADJUSTMENT : -POOL_ADJUSTMENT
    p += delta
    deltas.push({ category: 'pool', label: subject.pool ? 'Subject has pool, comp does not' : 'Comp has pool, subject does not', amount: delta })
  }

  const subjCars = subject.garageCars === '' || subject.garageCars == null ? null : parseInt(subject.garageCars)
  const compCars = comp.garageCars === '' || comp.garageCars == null ? null : parseInt(comp.garageCars)
  if (subjCars !== null && compCars !== null && !isNaN(subjCars) && !isNaN(compCars) && subjCars !== compCars) {
    const diff = subjCars - compCars
    const delta = diff * PER_GARAGE_SPACE
    p += delta
    deltas.push({ category: 'garage', label: `Garage: subject ${subjCars}-car vs comp ${compCars}-car`, amount: delta })
  }

  if (subject.stories && comp.stories && subject.stories !== comp.stories) {
    if (comp.stories === 'one' && subject.stories === 'two') {
      const before = p
      p = p / (1 + ONE_STORY_PREMIUM)
      deltas.push({ category: 'stories', label: 'Comp is one-story (premium), subject is two-story', amount: Math.round(p - before) })
    } else if (comp.stories === 'two' && subject.stories === 'one') {
      const before = p
      p = p * (1 + ONE_STORY_PREMIUM)
      deltas.push({ category: 'stories', label: 'Subject is one-story (premium), comp is two-story', amount: Math.round(p - before) })
    }
  }

  if (subject.condition && comp.condition && subject.condition !== comp.condition) {
    const compPct = CONDITION_PCT[comp.condition] ?? 0
    const subjPct = CONDITION_PCT[subject.condition] ?? 0
    const before = p
    p = (p / (1 + compPct)) * (1 + subjPct)
    deltas.push({ category: 'condition', label: `Condition: comp ${comp.condition} → subject ${subject.condition}`, amount: Math.round(p - before) })
  }

  const subjLotAcres = parseFloat(subject.lotAcres)
  const compLotAcres = parseFloat(comp.lotAcres)
  if (subjLotAcres > 0 && compLotAcres > 0 && subjLotAcres !== compLotAcres) {
    const compLotSqft = compLotAcres * SQFT_PER_ACRE
    const subjLotSqft = subjLotAcres * SQFT_PER_ACRE
    const lotValuePerSqft = (LOT_VALUE_PCT * price) / compLotSqft
    const delta = Math.round(lotValuePerSqft * (subjLotSqft - compLotSqft))
    p += delta
    deltas.push({ category: 'lot', label: `Lot: subject ${subjLotAcres} ac vs comp ${compLotAcres} ac`, amount: delta })
  }

  return { adjustedPrice: p, deltas }
}

function getCompsStrength(validCount) {
  if (validCount >= 5) return { tier: 'excellent', label: 'Excellent (defensible)', emoji: '🟢', color: '#16a34a' }
  if (validCount >= 3) return { tier: 'good', label: 'Good (standard)', emoji: '🟡', color: '#d97706' }
  return { tier: 'weak', label: 'Weak (inaccurate)', emoji: '🔴', color: '#dc2626' }
}

const PRO_TIPS = [
  { tip: 'Homes priced correctly sell 50% faster than overpriced ones', source: 'Zillow Research 2023' },
  { tip: 'After 21 days on market, buyers assume something is wrong with the home', source: 'NAR Profile of Home Buyers' },
  { tip: 'A $400 pre-listing appraisal gives you a defensible price to show buyers', source: 'HomeLight Agent Survey' },
  { tip: 'Price reductions signal desperation — better to price right the first time', source: 'Industry best practice' },
]

const COMPS_TIPS = [
  { tip: 'Use 3–5 sold comps from the last 90 days, within 0.5 miles, for the strongest baseline', source: 'NAR Comp Selection Guidelines' },
  { tip: 'Same-subdivision comps are 10× more reliable than nearby ones — buyers compare against the closest match', source: 'Industry best practice' },
  { tip: 'Skip comps that sat 60+ days — they were overpriced and will skew your average', source: 'HomeLight Agent Survey' },
  { tip: 'Adjust ±$50–100 per sqft for differences in condition, lot size, or recent upgrades', source: 'Texas appraisal guidelines' },
]

const SUB_STEPS = [
  { id: 1, label: 'Property Details' },
  { id: 2, label: 'Market Comps' },
]

const slideVariants = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.16, ease: 'easeIn' } }),
}

function getDomNote(domNum) {
  if (domNum > 60) return { text: '⚠ Sat a long time — may have had pricing, condition, or location issues. Consider a different comp', color: '#dc2626' }
  if (domNum > 30) return { text: '⚠ Took some time to sell — verify condition and location before using', color: '#d97706' }
  return null
}

function formatDollars(n) {
  return Math.round(n).toLocaleString()
}

export default function Step1Pricing({ homeAddress, onPriceUpdate, onSelectStep }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const [sqft, setSqft] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [yearBuilt, setYearBuilt] = useState('')
  const [condition, setCondition] = useState('')
  const [stories, setStories] = useState(null)
  const [pool, setPool] = useState(null)
  const [garageCars, setGarageCars] = useState('')
  const [lotAcres, setLotAcres] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [lotUnit, setLotUnit] = useState('acres')
  const [comps, setComps] = useState([
    { ...EMPTY_COMP },
    { ...EMPTY_COMP },
    { ...EMPTY_COMP },
  ])
  const [showMath, setShowMath] = useState(false)
  const [activeSubStep, setActiveSubStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [appraiserPanelOpen, setAppraiserPanelOpen] = useState(false)

  const goTo = (step) => {
    setDirection(step > activeSubStep ? 1 : -1)
    setActiveSubStep(step)
  }

  const fieldInput = "border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
  const fieldLabel = "block text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1"

  const displayLotValue = lotUnit === 'sqft'
    ? (lotAcres ? Math.round(parseFloat(lotAcres) * SQFT_PER_ACRE).toString() : '')
    : lotAcres
  const handleLotChange = (raw) => {
    if (lotUnit === 'sqft') {
      const sqft = parseFloat(raw)
      setLotAcres(Number.isFinite(sqft) ? (sqft / SQFT_PER_ACRE).toFixed(6) : '')
    } else {
      setLotAcres(raw)
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const s1 = data.step1
        if (s1) {
          if (s1.sqft !== undefined) setSqft(s1.sqft)
          if (s1.bedrooms !== undefined) setBedrooms(s1.bedrooms)
          if (s1.bathrooms !== undefined) setBathrooms(s1.bathrooms)
          if (s1.yearBuilt !== undefined) setYearBuilt(s1.yearBuilt)
          if (s1.condition !== undefined) setCondition(s1.condition)
          if (s1.stories !== undefined) setStories(s1.stories)
          if (s1.pool !== undefined) setPool(s1.pool)
          if (s1.garageCars !== undefined) setGarageCars(s1.garageCars)
          if (s1.lotAcres !== undefined) setLotAcres(s1.lotAcres)
          if (s1.propertyType !== undefined) setPropertyType(s1.propertyType)
          if (s1.lotUnit !== undefined) setLotUnit(s1.lotUnit)
          if (s1.comps && s1.comps.length > 0) {
            setComps(s1.comps.map((c) => ({ ...EMPTY_COMP, ...c })))
          }
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      const existing = saved ? JSON.parse(saved) : {}
      localStorage.setItem(
        'fsbo_stepData',
        JSON.stringify({ ...existing, step1: { sqft, bedrooms, bathrooms, yearBuilt, condition, stories, pool, garageCars, lotAcres, propertyType, lotUnit, comps } })
      )
      notifyStepDataChange()
    } catch {}
  }, [sqft, bedrooms, bathrooms, yearBuilt, condition, stories, pool, garageCars, lotAcres, propertyType, lotUnit, comps])

  const updateComp = (index, field, value) => {
    setComps((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addComp = () => {
    if (comps.length < 5) setComps((prev) => [...prev, { ...EMPTY_COMP }])
  }

  const subject = { pool, garageCars, stories, condition, lotAcres, propertyType }

  const compStats = comps.map((comp) => {
    const rawPrice = parseFloat(comp.price)
    const sf = parseFloat(comp.sqft)
    if (!(rawPrice > 0) || !(sf > 0)) {
      return { rawPpsf: null, adjustedPpsf: null, deltas: [], adjustedPrice: null }
    }
    const rawPpsf = rawPrice / sf
    if (comp.propertyType && subject.propertyType && comp.propertyType !== subject.propertyType) {
      return { rawPpsf, adjustedPpsf: null, deltas: [], adjustedPrice: null }
    }
    const { adjustedPrice, deltas } = adjustCompPrice(comp, subject)
    const finalPrice = adjustedPrice ?? rawPrice
    return {
      rawPpsf,
      adjustedPpsf: finalPrice / sf,
      adjustedPrice: finalPrice,
      deltas,
    }
  })

  const validStats = compStats.filter((s) => s.adjustedPpsf !== null)
  const validCount = validStats.length
  const compsStrength = getCompsStrength(validCount)

  const adjustedAvgPpsf = validCount
    ? validStats.reduce((acc, s) => acc + s.adjustedPpsf, 0) / validCount
    : null

  const compTooltips = {
    comp_address: 'Find on Redfin or HAR.com under Recently Sold',
    comp_price: 'In Texas, sold prices are private. Use the public List Price from Redfin / HAR / Zillow as the most reliable benchmark.',
    comp_sqft: 'Heated area only. On the listing or CAD record',
    comp_yr: 'Year the home was built. Find on the listing or CAD record',
    comp_dom: 'Under 14 days = sold fast. 14–30 = normal. 31–60 = took a while. Over 60 = may have had issues',
    comp_features: 'Differences in pool, garage, stories, condition, and lot size are auto-adjusted to match your home before averaging $/sqft.',
  }

  const sqftNum = parseFloat(sqft)
  const hasComps = adjustedAvgPpsf !== null
  const baseValue = hasComps && sqftNum > 0 ? adjustedAvgPpsf * sqftNum : null

  const rangeMin = baseValue ? baseValue * 0.95 : null
  const rangeMax = baseValue ? baseValue * 1.05 : null
  // Filter-aware list price: round up to next $25k bucket, then knock $100 under
  // (e.g. $624,000 → $625,000 → $624,900) to land just under common Zillow/Redfin filters.
  const suggestedListPrice = baseValue
    ? Math.ceil(baseValue / 25000) * 25000 - 100
    : null

  useEffect(() => {
    if (!baseValue) return
    const estimate = {
      currentEstimate: Math.round(baseValue),
      suggestedListPrice,
    }
    try {
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(estimate))
    } catch {}
    if (onPriceUpdate) onPriceUpdate(estimate)
  }, [baseValue, suggestedListPrice, onPriceUpdate])

  return (
    <div className="px-4 py-8 md:px-10 md:py-12">
      <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0">
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
        >
          Prepare
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Price Your Home Correctly</h2>
      <p className="text-gray-600 leading-relaxed mb-8">
        <span className="font-semibold text-gray-800">Why it matters:</span> Pricing is the single
        most important decision you&apos;ll make. Homes priced right sell in days — overpriced homes
        sit and get stigmatized. Texas buyers are data-savvy and know the comps.
      </p>

      {/* Sub-step tabs */}
      <div className="flex items-center mb-8">
        {SUB_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() => goTo(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                s.id === activeSubStep
                  ? 'text-white'
                  : s.id < activeSubStep
                  ? 'text-green-700 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              style={s.id === activeSubStep ? { backgroundColor: ACCENT } : {}}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  s.id < activeSubStep
                    ? 'bg-green-500 text-white'
                    : s.id === activeSubStep
                    ? 'bg-white/30 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s.id < activeSubStep ? '✓' : s.id}
              </span>
              {s.label}
            </button>
            {i < SUB_STEPS.length - 1 && (
              <div className={`w-5 h-px mx-1 ${activeSubStep > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeSubStep}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >

      {/* ── CARD 1: Property Details ── */}
      {activeSubStep === 1 && (
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Your home details</h3>

        {homeAddress ? (
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm text-gray-800">🏠 {homeAddress}</span>
            <button
              type="button"
              onClick={() => onSelectStep && onSelectStep(null)}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-5">
            Add your address on the home screen first.{' '}
            <button
              type="button"
              onClick={() => onSelectStep && onSelectStep(null)}
              className="underline underline-offset-2 hover:text-gray-700 transition-colors"
            >
              Go back
            </button>
          </p>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={fieldLabel + " flex items-center"}>
                Square footage
                <HelpTip id="sqft" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Heated/cooled area only. Find on Williamson CAD (wcad.org)
                </HelpTip>
              </label>
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="e.g. 2100"
                className={"w-full " + fieldInput}
              />
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Bedrooms
                <HelpTip id="bedrooms" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Number of bedrooms. Buyers filter by this — comps should match your bedroom count
                </HelpTip>
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="e.g. 4"
                step="1"
                min="0"
                className={"w-full " + fieldInput}
              />
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Bathrooms
                <HelpTip id="bathrooms" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Full baths count as 1, half baths (no shower) count as 0.5
                </HelpTip>
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="e.g. 2.5"
                step="0.5"
                min="0"
                className={"w-full " + fieldInput}
              />
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Property type
                <HelpTip id="propertyType" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Buyers filter by type. Comps should match — a townhouse doesn&apos;t compare to a single-family home.
                </HelpTip>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={"w-full " + fieldInput}
              >
                <option value="">Select type</option>
                {PROPERTY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Year built
                <HelpTip id="yearBuilt" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  On your CAD record. Homes 10+ years older than comps price 3–5% lower unless updated
                </HelpTip>
              </label>
              <input
                type="number"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                placeholder="e.g. 2005"
                className={"w-full " + fieldInput}
              />
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Condition
                <HelpTip id="condition" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Be honest — buyers find out at inspection
                </HelpTip>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={"w-full " + fieldInput}
              >
                <option value="">Select condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Stories
                <HelpTip id="stories" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  In Texas, single-story homes typically sell faster and for more per sqft, especially for buyers over 50
                </HelpTip>
              </label>
              <select
                value={stories ?? ''}
                onChange={(e) => setStories(e.target.value || null)}
                className={"w-full " + fieldInput}
              >
                <option value="">Select</option>
                <option value="one">One-story</option>
                <option value="two">Two-story</option>
              </select>
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Pool
                <HelpTip id="pool" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} align="start">
                  In Texas, a pool adds $15,000–$30,000 depending on neighborhood
                </HelpTip>
              </label>
              <select
                value={pool === null ? '' : String(pool)}
                onChange={(e) => {
                  const v = e.target.value
                  setPool(v === '' ? null : v === 'true')
                }}
                className={"w-full " + fieldInput}
              >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Garage (car spaces)
                <HelpTip id="garageCars" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Each garage space is worth roughly $5,000 in Texas. We use this to normalize comps that have a different number of spaces.
                </HelpTip>
              </label>
              <select
                value={garageCars}
                onChange={(e) => setGarageCars(e.target.value)}
                className={"w-full " + fieldInput}
              >
                <option value="">Select</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3+</option>
              </select>
            </div>

            <div>
              <label className={fieldLabel + " flex items-center"}>
                Lot size
                <HelpTip id="lotAcres" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                  Find on Zillow under Property Details, or Redfin&apos;s Home facts. 1 acre = 43,560 sqft.
                </HelpTip>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={displayLotValue}
                  onChange={(e) => handleLotChange(e.target.value)}
                  placeholder={lotUnit === 'sqft' ? 'e.g. 6500' : 'e.g. 0.15'}
                  step={lotUnit === 'sqft' ? '1' : '0.01'}
                  min="0"
                  className={"flex-1 " + fieldInput}
                />
                <button
                  type="button"
                  onClick={() => setLotUnit('acres')}
                  className="px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                  style={
                    lotUnit === 'acres'
                      ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                  }
                >
                  acres
                </button>
                <button
                  type="button"
                  onClick={() => setLotUnit('sqft')}
                  className="px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                  style={
                    lotUnit === 'sqft'
                      ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                  }
                >
                  sqft
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => goTo(2)}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Continue: Market Comps →
          </button>
        </div>
      </section>
      )}

      {/* ── CARD 2: Market Comps ── */}
      {activeSubStep === 2 && (
      <div>
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to find your comps</h3>
        <ol className="space-y-3">
          {[
            <>
              Go to{' '}
              <span className="font-medium text-gray-800">Redfin.com</span> → search your address →
              click &quot;Recently Sold&quot; → filter: last 90 days, within 0.5 miles, similar sqft
              (±20%)
            </>,
            <>
              Go to{' '}
              <span className="font-medium text-gray-800">HAR.com</span> → search sold homes with
              same filters — more accurate for Texas
            </>,
            'Pick 3–5 comps: same subdivision, similar sqft, low days on market (under 21), sold within 90 days',
            'Avoid comps that sat 60+ days — they were overpriced and will skew your data',
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center mt-0.5"
                style={{ backgroundColor: ACCENT }}
              >
                {i + 1}
              </span>
              <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Comparable sales</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter 3–5 recent nearby listings to establish your price baseline. Each comp&apos;s features are normalized to match your home before averaging.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { label: 'Redfin', href: 'https://redfin.com' },
            { label: 'HAR.com', href: 'https://har.com' },
            { label: 'Zillow', href: 'https://zillow.com' },
            { label: 'Williamson CAD', href: 'https://wcad.org' },
            { label: 'Travis CAD', href: 'https://traviscad.org' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {label} ↗
            </a>
          ))}
        </div>

        <p className="mb-4 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          ℹ️ Texas is a non-disclosure state. Sold prices are private — use the public <span className="font-semibold">List Price</span> from Redfin, HAR, or Zillow as the most reliable benchmark. Avoid Zestimate.
        </p>

        <div
          className="mb-4 flex items-center justify-between rounded-lg border px-4 py-3"
          style={{ borderColor: compsStrength.color + '55', backgroundColor: compsStrength.color + '0d' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden>{compsStrength.emoji}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: compsStrength.color }}>
                Comp strength: {compsStrength.label}
              </p>
              <p className="text-xs text-gray-600">
                {validCount === 0 && 'Enter at least 3 valid comps (price + sqft) for a defensible baseline.'}
                {validCount === 1 && '1 comp entered — add 2 more to reach Good.'}
                {validCount === 2 && '2 comps entered — add 1 more to reach Good.'}
                {validCount === 3 && '3 comps — enough for a defensible price. A 4th adds extra confidence if you can find a close match.'}
                {validCount === 4 && '4 comps — strong baseline. A 5th is optional and only worth adding if it\'s a clean match.'}
                {validCount >= 5 && '5 comps — excellent spread. Drop weak ones rather than adding more.'}
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            {validCount}/5
          </div>
        </div>

        <div className="space-y-3">
          {comps.map((comp, i) => {
            const stats = compStats[i]
            const rawPpsf = stats.rawPpsf
            const adjPpsf = stats.adjustedPpsf

            const compSqftNum = comp.sqft !== '' ? parseFloat(comp.sqft) : NaN
            const sqftOutlier = sqftNum > 0 && !isNaN(compSqftNum)
              && Math.abs(compSqftNum / sqftNum - 1) > 0.25

            const compYearBuiltNum = (comp.yearBuilt || '') !== '' ? parseInt(comp.yearBuilt) : NaN
            const homeYearBuiltNum = yearBuilt !== '' ? parseInt(yearBuilt) : NaN
            const yearBuiltNewer = !isNaN(compYearBuiltNum) && !isNaN(homeYearBuiltNum)
              && compYearBuiltNum > homeYearBuiltNum + 15
            const yearBuiltOlder = !isNaN(compYearBuiltNum) && !isNaN(homeYearBuiltNum)
              && compYearBuiltNum < homeYearBuiltNum - 15

            const compBedrooms = (comp.bedrooms || '') !== '' ? parseInt(comp.bedrooms) : NaN
            const subjBedrooms = bedrooms !== '' ? parseInt(bedrooms) : NaN
            const bedroomsMismatch = !isNaN(compBedrooms) && !isNaN(subjBedrooms)
              && Math.abs(compBedrooms - subjBedrooms) >= 1

            const compBathrooms = (comp.bathrooms || '') !== '' ? parseFloat(comp.bathrooms) : NaN
            const subjBathrooms = bathrooms !== '' ? parseFloat(bathrooms) : NaN
            const bathroomsMismatch = !isNaN(compBathrooms) && !isNaN(subjBathrooms)
              && Math.abs(compBathrooms - subjBathrooms) >= 1

            const compLotAcres = (comp.lotAcres || '') !== '' ? parseFloat(comp.lotAcres) : NaN
            const subjLotAcres = lotAcres !== '' ? parseFloat(lotAcres) : NaN
            const lotMismatch = !isNaN(compLotAcres) && !isNaN(subjLotAcres)
              && subjLotAcres > 0 && compLotAcres > 0
              && Math.abs(compLotAcres / subjLotAcres - 1) > 0.5

            const priceNum = parseFloat(comp.price)
            const domNum = parseFloat(comp.dom)
            const domNote = priceNum > 0 && domNum > 0 ? getDomNote(domNum) : null

            const propertyTypeMismatch = !!comp.propertyType && !!propertyType && comp.propertyType !== propertyType
            const hasAnyNote = propertyTypeMismatch || !!domNote || sqftOutlier || yearBuiltNewer || yearBuiltOlder || bedroomsMismatch || bathroomsMismatch || lotMismatch
            const showFeatureRow = priceNum > 0 && parseFloat(comp.sqft) > 0
            const ppsfDiffers = rawPpsf !== null && adjPpsf !== null
              && Math.abs(adjPpsf - rawPpsf) / rawPpsf > 0.005
            const adjustedDirection = adjPpsf !== null && rawPpsf !== null && adjPpsf < rawPpsf ? 'down' : 'up'

            return (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Comp {i + 1} of {comps.length}
                  </span>
                  {showMath && adjPpsf !== null && (
                    <div className="text-right leading-tight">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Adj $/sqft
                      </div>
                      <div className="text-sm font-semibold" style={{ color: ppsfDiffers ? (adjustedDirection === 'up' ? ACCENT : '#dc2626') : '#374151' }}>
                        ${adjPpsf.toFixed(2)}
                      </div>
                      {ppsfDiffers && (
                        <div className="text-[10px] font-normal text-gray-400">
                          raw ${rawPpsf.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className={fieldLabel + " flex items-center"}>
                    Address
                    <HelpTip id={`comp_address_${i}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} align="start">
                      {compTooltips.comp_address}
                    </HelpTip>
                  </label>
                  <input
                    type="text"
                    value={comp.address}
                    onChange={(e) => updateComp(i, 'address', e.target.value)}
                    placeholder="456 Oak St, Round Rock TX"
                    className={"w-full " + fieldInput}
                  />
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-3 mb-4">
                  <div>
                    <label className={fieldLabel + " flex items-center"}>
                      List Price
                      <HelpTip id={`comp_price_${i}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                        {compTooltips.comp_price}
                      </HelpTip>
                    </label>
                    <input
                      type="number"
                      value={comp.price}
                      onChange={(e) => updateComp(i, 'price', e.target.value)}
                      placeholder="485000"
                      className={"w-32 " + fieldInput}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel + " flex items-center"}>
                      Sqft
                      <HelpTip id={`comp_sqft_${i}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                        {compTooltips.comp_sqft}
                      </HelpTip>
                    </label>
                    <input
                      type="number"
                      value={comp.sqft}
                      onChange={(e) => updateComp(i, 'sqft', e.target.value)}
                      placeholder="2050"
                      className={"w-24 " + fieldInput}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel + " flex items-center"}>
                      Yr Built
                      <HelpTip id={`comp_yr_${i}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                        {compTooltips.comp_yr}
                      </HelpTip>
                    </label>
                    <input
                      type="number"
                      value={comp.yearBuilt || ''}
                      onChange={(e) => updateComp(i, 'yearBuilt', e.target.value)}
                      placeholder="2005"
                      className={"w-24 " + fieldInput}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel + " flex items-center"}>
                      DOM
                      <HelpTip id={`comp_dom_${i}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                        {compTooltips.comp_dom}
                      </HelpTip>
                    </label>
                    <input
                      type="number"
                      value={comp.dom}
                      onChange={(e) => updateComp(i, 'dom', e.target.value)}
                      placeholder="12"
                      className={"w-20 " + fieldInput}
                    />
                  </div>
                </div>

                {showFeatureRow && (
                  <div>
                    <p className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                      Comp features
                      <HelpTip id={`comp_features_${i}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} align="start">
                        {compTooltips.comp_features}
                      </HelpTip>
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      <div>
                        <label className={fieldLabel}>Property type</label>
                        <select
                          value={comp.propertyType ?? ''}
                          onChange={(e) => updateComp(i, 'propertyType', e.target.value)}
                          className={"w-36 " + fieldInput}
                        >
                          <option value="">—</option>
                          {PROPERTY_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={fieldLabel}>Bedrooms</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={comp.bedrooms}
                          onChange={(e) => updateComp(i, 'bedrooms', e.target.value)}
                          className={"w-16 " + fieldInput}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Bathrooms</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={comp.bathrooms}
                          onChange={(e) => updateComp(i, 'bathrooms', e.target.value)}
                          className={"w-16 " + fieldInput}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Lot (acres)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={comp.lotAcres}
                          onChange={(e) => updateComp(i, 'lotAcres', e.target.value)}
                          placeholder="0.15"
                          className={"w-20 " + fieldInput}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Pool</label>
                        <select
                          value={comp.pool === null ? '' : String(comp.pool)}
                          onChange={(e) => {
                            const v = e.target.value
                            updateComp(i, 'pool', v === '' ? null : v === 'true')
                          }}
                          className={"w-20 " + fieldInput}
                        >
                          <option value="">—</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div>
                        <label className={fieldLabel}>Garage</label>
                        <select
                          value={comp.garageCars ?? ''}
                          onChange={(e) => updateComp(i, 'garageCars', e.target.value)}
                          className={"w-20 " + fieldInput}
                        >
                          {[{ v: '', l: '—' }, { v: '0', l: '0' }, { v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3+' }].map((opt) => (
                            <option key={String(opt.v)} value={opt.v}>{opt.l}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={fieldLabel}>Stories</label>
                        <select
                          value={comp.stories ?? ''}
                          onChange={(e) => updateComp(i, 'stories', e.target.value)}
                          className={"w-24 " + fieldInput}
                        >
                          <option value="">—</option>
                          <option value="one">1</option>
                          <option value="two">2</option>
                        </select>
                      </div>
                      <div>
                        <label className={fieldLabel}>Condition</label>
                        <select
                          value={comp.condition ?? ''}
                          onChange={(e) => updateComp(i, 'condition', e.target.value)}
                          className={"w-32 " + fieldInput}
                        >
                          {[{ v: '', l: '—' }, { v: 'Excellent', l: 'Excellent' }, { v: 'Good', l: 'Good' }, { v: 'Average', l: 'Average' }, { v: 'Fair', l: 'Fair' }].map((opt) => (
                            <option key={String(opt.v)} value={opt.v}>{opt.l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {hasAnyNote && (
                  <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5">
                    <ul className="space-y-1 text-[12px] text-orange-700">
                      {propertyTypeMismatch ? (
                        <li>🚨 Property type mismatch ({PROPERTY_TYPE_LABELS[comp.propertyType]} vs your {PROPERTY_TYPE_LABELS[propertyType]}) — excluded from price calculation</li>
                      ) : (
                        <>
                          {domNote && (
                            <li style={{ color: domNote.color }}>{domNote.text}</li>
                          )}
                          {sqftOutlier && (
                            <li>⚠ This comp is significantly different in size from your home — may not be a reliable benchmark</li>
                          )}
                          {yearBuiltNewer && (
                            <li>⚠ Built 15+ years newer than your home — find a closer-year comp</li>
                          )}
                          {yearBuiltOlder && (
                            <li>⚠ Built 15+ years older than your home — find a closer-year comp</li>
                          )}
                          {bedroomsMismatch && (
                            <li>⚠ This comp has {compBedrooms} bedroom{compBedrooms === 1 ? '' : 's'} vs your home&apos;s {subjBedrooms} — bedroom count is a major buyer filter; find a closer match</li>
                          )}
                          {bathroomsMismatch && (
                            <li>⚠ This comp has {compBathrooms} bathroom{compBathrooms === 1 ? '' : 's'} vs your home&apos;s {subjBathrooms} — find a closer match</li>
                          )}
                          {lotMismatch && (
                            <li>⚠ This comp&apos;s lot is {compLotAcres} acres vs your home&apos;s {subjLotAcres} — find a closer match for accurate pricing</li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                )}

                {showMath && stats.deltas.length > 0 && (
                  <p className="mt-3 inline-flex flex-wrap items-center gap-x-1 text-[11px] text-gray-500 italic">
                    <span>Comp price normalized to match your home</span>
                    <HelpTip
                      id={`comp_deltas_${i}`}
                      activeTooltip={activeTooltip}
                      setActiveTooltip={setActiveTooltip}
                      align="start"
                    >
                      +$ means the comp lacked a feature your home has, so we bump it up. −$ means the comp had something your home doesn&apos;t, so we strip its value out. The average $/sqft below is computed from these normalized prices.
                    </HelpTip>
                    <span>:</span>
                    {stats.deltas.map((d, di) => (
                      <span key={d.category} title={d.label}>
                        {d.category} {d.amount >= 0 ? '+' : '−'}${formatDollars(Math.abs(d.amount))}{di < stats.deltas.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {showMath && adjustedAvgPpsf !== null && (
          <div className="mt-4 flex items-center justify-end gap-3 text-sm">
            <span className="text-gray-500">Average adjusted $/sqft</span>
            <span className="font-bold" style={{ color: ACCENT }}>${adjustedAvgPpsf.toFixed(2)}</span>
          </div>
        )}

        {comps.length < 5 && (
          <button
            type="button"
            onClick={addComp}
            className="mt-3 text-sm font-medium underline underline-offset-2 transition-colors"
            style={{ color: ACCENT }}
          >
            {validCount >= 3 ? '+ Add another (optional)' : '+ Add comp'}
          </button>
        )}
      </section>

        {hasComps && baseValue && (
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Suggested List Price</h3>

            <div
              className="rounded-xl border-2 px-6 py-6 mb-4"
              style={{ borderColor: ACCENT, backgroundColor: '#f0fdf4' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#166534' }}>
                Recommended list price
              </p>
              <p className="text-4xl font-bold mb-2" style={{ color: '#14532d' }}>
                ${formatDollars(suggestedListPrice)}
              </p>
              <p className="text-sm" style={{ color: '#166534' }}>
                Calculated range: <span className="font-semibold">${formatDollars(rangeMin)} — ${formatDollars(rangeMax)}</span>
              </p>
              <p className="mt-3 text-xs" style={{ color: '#166534' }}>
                💡 Priced just under the next $25k bucket to land inside Zillow and Redfin search filters (e.g. buyers searching &quot;under $625k&quot; will see a $624,900 listing).
              </p>
            </div>

            <div className="mb-4 rounded-lg px-4 py-3" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">Reality check:</span> comps anchor your baseline, but they&apos;re a snapshot of past sales. Interest-rate moves, new construction nearby, school-rating shifts, and neighborhood inventory can move the actual clearing price ±5–10% beyond this estimate.
              </p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                💡 Want more certainty before listing? A{' '}
                <button
                  type="button"
                  onClick={() => setAppraiserPanelOpen(true)}
                  className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: ACCENT }}
                >
                  pre-listing appraisal ($300–400)
                </button>{' '}
                gives you a defensible third-party number you can show buyers and lean on during negotiation.
              </p>
            </div>

            {validCount < 3 && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
                ⚠ This estimate is based on only {validCount} comp{validCount === 1 ? '' : 's'}. We recommend at least 3 to defend the price against buyer pushback.
              </div>
            )}

            <p className="mt-3 text-xs text-gray-500">
              📊 This is an AI-generated calculation based on the data you entered. It is not an appraisal and should not be used as the basis for any loan or legal transaction.
            </p>

            <button
              type="button"
              onClick={() => setShowMath((v) => !v)}
              className="mt-3 text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors"
            >
              {showMath ? 'Hide how this was calculated ▴' : 'Show how this was calculated ▾'}
            </button>

            {showMath && (
              <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">
                    Adjusted comp average: ${adjustedAvgPpsf.toFixed(2)}/sqft × {Number(sqft).toLocaleString()} sqft
                  </span>
                  <span className="text-sm font-semibold text-gray-900">${formatDollars(baseValue)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">Round up to the next $25k bucket</span>
                  <span className="text-sm font-semibold text-gray-900">${formatDollars(Math.ceil(baseValue / 25000) * 25000)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">Subtract $100 to land under the filter</span>
                  <span className="text-sm font-semibold" style={{ color: '#dc2626' }}>−$100</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-700">Recommended list price</span>
                  <span className="text-sm font-bold" style={{ color: ACCENT }}>${formatDollars(suggestedListPrice)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">Calculated range (Adjusted comp value ± 5%, accounting for market noise)</span>
                  <span className="text-sm font-semibold text-gray-900">${formatDollars(rangeMin)} — ${formatDollars(rangeMax)}</span>
                </div>
              </div>
            )}
          </section>
        )}

        <div className="pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onSelectStep && onSelectStep(2)}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            Next: Step 2 — Repairs &amp; Pre-Listing Fixes →
          </button>
        </div>
      </div>
      )}

        </motion.div>
      </AnimatePresence>
      </div>{/* end left column */}

      {/* Right: context-aware sticky panel */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-4 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pro Tips</h4>
          <div className="space-y-3">
            {(activeSubStep === 2 ? COMPS_TIPS : PRO_TIPS).map(({ tip, source }, i) => (
              <div key={i} className="border-l-2 pl-3" style={{ borderColor: ACCENT }}>
                <p className="text-xs text-gray-700 leading-relaxed mb-1">{tip}</p>
                <p className="text-xs text-gray-400">— {source}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      </div>{/* end flex row */}

      <AppraiserPanel
        open={appraiserPanelOpen}
        onClose={() => setAppraiserPanelOpen(false)}
        homeAddress={homeAddress}
      />
    </div>
  )
}
