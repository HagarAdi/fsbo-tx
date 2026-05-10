import { useState, useEffect, Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SourceDrawer from '../SourceDrawer'
import HelpTip from '../Tooltip'
import { notifyStepDataChange } from '../../utils/notifyStepData'

const ACCENT = '#16a34a'
const EMPTY_COMP = {
  address: '', price: '', sqft: '', yearBuilt: '', dom: '',
  pool: null, garageCars: '', stories: '', condition: '',
}

const SOURCE_DATA = {
  'NAR Remodeling Impact Report': {
    title: 'NAR Remodeling Impact Report',
    year: '2023',
    keyFinding: 'Homeowners recover an average of 100% of the cost of a new roof at resale. Kitchen upgrades recover 67% and bathroom renovations recover 71% on average.',
    whyItMatters: 'In the Texas market, roof condition is one of the top buyer concerns — especially with hail season. A new roof removes a major negotiating point.',
    fullReportUrl: 'https://www.nar.realtor/research-and-statistics/research-reports/remodeling-impact',
  },
  'Zillow Research': {
    title: 'Zillow Paint Color Analysis',
    year: '2023',
    keyFinding: 'Homes with specific paint colors sell for more than expected. Fresh interior paint in neutral tones consistently ranks as one of the highest-ROI pre-listing improvements.',
    whyItMatters: 'Texas buyers touring multiple homes respond strongly to fresh, neutral paint — it signals a well-maintained home and helps buyers visualize themselves in the space.',
    fullReportUrl: 'https://www.zillow.com/research',
  },
  'HomeLight Agent Survey': {
    title: 'HomeLight Top Agent Insights',
    year: '2024',
    keyFinding: 'Agents report that HVAC condition is one of the top buyer concerns, especially in hot climates. Homes with documented HVAC service sell faster and with fewer inspection concessions.',
    whyItMatters: 'In Texas where AC runs 8+ months a year, HVAC age and condition is the #1 question buyers ask. A service receipt costs $150 and removes a major objection.',
    fullReportUrl: 'https://www.homelight.com/blog/top-agent-insights',
  },
  'Texas appraisal guidelines': {
    title: 'Texas Appraisal Practice — Foundation & Soil',
    year: '2024',
    keyFinding: 'In Central Texas expansive-clay regions, documented foundation work with a transferable warranty typically restores 80–100% of value vs. an undocumented home with visible movement, which sees 1–3% buyer-driven discounts.',
    whyItMatters: 'Foundation is the #1 inspection objection in Texas. Documented repair receipts and transferable warranties remove the negotiation entirely.',
    fullReportUrl: 'https://www.trec.texas.gov',
  },
}

const RENOVATION_GROUPS = [
  {
    label: 'Big-ticket upgrades',
    items: [
      { key: 'newRoof', label: 'New roof (last 5 years)', pct: 0.015, source: 'NAR Remodeling Impact Report' },
      { key: 'updatedKitchen', label: 'Updated kitchen', pct: 0.03, source: 'NAR Remodeling Impact Report' },
      { key: 'updatedBathrooms', label: 'Updated bathrooms', pct: 0.02, source: 'NAR Remodeling Impact Report' },
      { key: 'newWindows', label: 'New windows (energy-efficient)', pct: 0.0075, source: 'NAR Remodeling Impact Report' },
      { key: 'newFlooring', label: 'New flooring', pct: 0.015, source: 'NAR Remodeling Impact Report' },
      { key: 'freshPaint', label: 'Fresh interior paint', pct: 0.0075, source: 'Zillow Research' },
    ],
  },
  {
    label: 'Mechanical, electrical & plumbing',
    items: [
      { key: 'newHvac', label: 'New HVAC (last 5 years)', pct: 0.015, source: 'HomeLight Agent Survey' },
      { key: 'tanklessWaterHeater', label: 'Tankless water heater', pct: 0.005, source: 'Industry best practice' },
      { key: 'updatedElectricalPanel', label: 'Updated electrical panel (200 amp)', pct: 0.0075, source: 'Industry best practice' },
      { key: 'replumbed', label: 'Replumbed (no polybutylene / galvanized)', pct: 0.01, source: 'Industry best practice' },
      { key: 'waterSoftener', label: 'Water softener installed', pct: 0.0025, source: 'Industry best practice' },
    ],
  },
  {
    label: 'Texas-specific value adds',
    items: [
      { key: 'solarPanelsOwned', label: 'Solar panels (owned, not leased)', pct: 0.015, source: 'Industry best practice' },
      { key: 'wholeHomeGenerator', label: 'Whole-home generator (post-2021 freeze)', pct: 0.01, source: 'Industry best practice' },
      { key: 'foundationDocumented', label: 'Foundation work documented (transferable warranty)', pct: 0.01, source: 'Texas appraisal guidelines' },
      { key: 'radiantBarrier', label: 'Radiant barrier or spray-foam attic insulation', pct: 0.005, source: 'Industry best practice' },
      { key: 'sprinklerSystem', label: 'Sprinkler / irrigation system', pct: 0.005, source: 'Industry best practice' },
      { key: 'evCharger', label: 'EV charger (240V) installed', pct: 0.005, source: 'Industry best practice' },
      { key: 'smartHome', label: 'Smart home features (Nest, Ring, etc.)', pct: 0.0025, source: 'Industry best practice' },
    ],
  },
  {
    label: 'Concerns buyers will discount for',
    items: [
      { key: 'hvacOld', label: 'HVAC over 15 years old', pct: -0.015, source: 'HomeLight Agent Survey' },
      { key: 'roofOld', label: 'Roof over 20 years old', pct: -0.015, source: 'HomeLight Agent Survey' },
      { key: 'foundationIssues', label: 'Visible foundation movement (no documentation)', pct: -0.02, source: 'Texas appraisal guidelines' },
      { key: 'polybutylenePlumbing', label: 'Polybutylene plumbing', pct: -0.015, source: 'Industry best practice' },
      { key: 'aluminumWiring', label: 'Aluminum wiring', pct: -0.01, source: 'Industry best practice' },
    ],
  },
]
const RENOVATIONS = RENOVATION_GROUPS.flatMap((g) => g.items)

const CONDITION_PCT = { Excellent: 0.04, Good: 0, Average: -0.03, Fair: -0.06 }

// Per-comp adjustments: dollars (or multipliers) applied to the comp price to
// estimate what the comp would have sold for if it matched the subject home.
const POOL_ADJUSTMENT = 20000
const PER_GARAGE_SPACE = 5000
const ONE_STORY_PREMIUM = 0.02

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

  return { adjustedPrice: p, deltas }
}

function getCompsStrength(validCount) {
  if (validCount >= 5) return { tier: 'excellent', label: 'Excellent (defensible)', emoji: '🟢', color: '#16a34a' }
  if (validCount >= 3) return { tier: 'good', label: 'Good (standard)', emoji: '🟡', color: '#d97706' }
  return { tier: 'weak', label: 'Weak (inaccurate)', emoji: '🔴', color: '#dc2626' }
}

function CompFeatureToggle({ label, value, options, onChange }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
      <span className="inline-flex rounded-md border border-gray-200 bg-white overflow-hidden">
        {options.map((opt) => {
          const selected = value === opt.v
          return (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => onChange(opt.v)}
              className="px-2 py-0.5 text-[11px] font-medium transition-colors"
              style={
                selected
                  ? { backgroundColor: ACCENT, color: 'white' }
                  : { backgroundColor: 'white', color: '#4b5563' }
              }
            >
              {opt.l}
            </button>
          )
        })}
      </span>
    </span>
  )
}

function CompFeatureSelect({ label, value, options, onChange }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded px-1.5 py-0.5 text-[11px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
      >
        {options.map((opt) => (
          <option key={String(opt.v)} value={opt.v}>{opt.l}</option>
        ))}
      </select>
    </span>
  )
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
  { id: 3, label: 'Value Additions' },
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSource, setDrawerSource] = useState(null)

  const openDrawer = (sourceKey) => {
    setDrawerSource(SOURCE_DATA[sourceKey] ?? null)
    setDrawerOpen(true)
  }

  const [sqft, setSqft] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [yearBuilt, setYearBuilt] = useState('')
  const [condition, setCondition] = useState('')
  const [stories, setStories] = useState(null)
  const [pool, setPool] = useState(null)
  const [garageCars, setGarageCars] = useState('')
  const [comps, setComps] = useState([
    { ...EMPTY_COMP },
    { ...EMPTY_COMP },
    { ...EMPTY_COMP },
  ])
  const [renovations, setRenovations] = useState({})
  const [estimateSaved, setEstimateSaved] = useState(false)
  const [activeSubStep, setActiveSubStep] = useState(1)
  const [direction, setDirection] = useState(1)

  const goTo = (step) => {
    setDirection(step > activeSubStep ? 1 : -1)
    setActiveSubStep(step)
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
          if (s1.comps && s1.comps.length > 0) {
            setComps(s1.comps.map((c) => ({ ...EMPTY_COMP, ...c })))
          }
          if (s1.renovations !== undefined) setRenovations(s1.renovations)
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
        JSON.stringify({ ...existing, step1: { sqft, bedrooms, bathrooms, yearBuilt, condition, stories, pool, garageCars, comps, renovations } })
      )
      notifyStepDataChange()
    } catch {}
  }, [sqft, bedrooms, bathrooms, yearBuilt, condition, stories, pool, garageCars, comps, renovations])

  useEffect(() => {
    setEstimateSaved(false)
  }, [sqft, condition, stories, pool, garageCars, renovations, comps])

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

  const handleRenovationChange = (key, checked) => {
    setRenovations((prev) => {
      const next = { ...prev, [key]: checked }
      if (checked && key === 'newRoof') next.roofOld = false
      if (checked && key === 'roofOld') next.newRoof = false
      return next
    })
  }

  const subject = { pool, garageCars, stories, condition }

  const compStats = comps.map((comp) => {
    const rawPrice = parseFloat(comp.price)
    const sf = parseFloat(comp.sqft)
    if (!(rawPrice > 0) || !(sf > 0)) {
      return { rawPpsf: null, adjustedPpsf: null, deltas: [], adjustedPrice: null }
    }
    const rawPpsf = rawPrice / sf
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
    comp_features: 'Differences in pool, garage, stories, and condition are auto-adjusted to match your home before averaging $/sqft.',
  }

  const sqftNum = parseFloat(sqft)
  const hasComps = adjustedAvgPpsf !== null
  const baseValue = hasComps && sqftNum > 0 ? adjustedAvgPpsf * sqftNum : null

  const renovationAmounts = baseValue
    ? RENOVATIONS.filter((r) => renovations[r.key]).map((r) => ({ ...r, amount: baseValue * r.pct }))
    : []
  const renovationsTotal = renovationAmounts.reduce((acc, r) => acc + r.amount, 0)

  const calculatedValue = baseValue ? baseValue + renovationsTotal : null
  const rangeMin = calculatedValue ? calculatedValue * 0.98 : null
  const rangeMax = calculatedValue ? calculatedValue * 1.02 : null
  // Filter-aware list price: round up to next $25k bucket, then knock $100 under
  // (e.g. $624,000 → $625,000 → $624,900) to land just under common Zillow/Redfin filters.
  const suggestedListPrice = calculatedValue
    ? Math.ceil(calculatedValue / 25000) * 25000 - 100
    : null

  const handleSaveEstimate = () => {
    if (!calculatedValue) return
    const adjustments = [
      { step: 1, reason: 'adjusted comp average', amount: Math.round(baseValue) },
    ]
    renovationAmounts.forEach((r) =>
      adjustments.push({ step: 1, reason: r.label, amount: Math.round(r.amount) })
    )
    const estimate = {
      basePrice: Math.round(baseValue),
      adjustments,
      currentEstimate: Math.round(calculatedValue),
      suggestedListPrice,
    }
    try {
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(estimate))
    } catch {}
    if (onPriceUpdate) onPriceUpdate(estimate)
    setEstimateSaved(true)
  }

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Condition
              <HelpTip id="condition" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                Be honest — buyers find out at inspection
              </HelpTip>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              One-story or Two-story
              <HelpTip id="stories" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                In Texas, single-story homes typically sell faster and for more per sqft, especially for buyers over 50
              </HelpTip>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStories('one')}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  stories === 'one'
                    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                One-story
              </button>
              <button
                type="button"
                onClick={() => setStories('two')}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  stories === 'two'
                    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                Two-story
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Pool
              <HelpTip id="pool" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                In Texas, a pool adds $15,000–$30,000 depending on neighborhood
              </HelpTip>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPool(true)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  pool === true
                    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPool(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  pool === false
                    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Garage (car spaces)
              <HelpTip id="garageCars" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>
                Each garage space is worth roughly $5,000 in Texas. We use this to normalize comps that have a different number of spaces.
              </HelpTip>
            </label>
            <div className="flex gap-2">
              {['0', '1', '2', '3'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGarageCars(n)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={
                    garageCars === n
                      ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                  }
                >
                  {n === '3' ? '3+' : n}
                </button>
              ))}
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
                {validCount === 3 && '3 comps — meets the standard. Add 2 more for Excellent.'}
                {validCount === 4 && '4 comps — strong. Add 1 more for Excellent.'}
                {validCount >= 5 && 'You have a defensible spread. Drop weak ones rather than adding more.'}
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            {validCount}/5
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
        <div className="min-w-[640px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { id: 'comp_address', label: 'Address', align: 'start' },
                  { id: 'comp_price', label: 'List Price' },
                  { id: 'comp_sqft', label: 'Sqft' },
                  { id: 'comp_yr', label: 'Yr Built' },
                  { id: 'comp_dom', label: 'DOM' },
                  { id: 'comp_features', label: 'Adj $/sqft', align: 'end' },
                  { id: null, label: '' },
                ].map(({ id, label, align }) => (
                  <th key={label} className="text-left px-4 py-3 font-medium text-gray-600">
                    <div className="flex items-center gap-0.5">
                      {label}
                      {id && (
                        <HelpTip id={id} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} placement="bottom" align={align}>
                          {compTooltips[id]}
                        </HelpTip>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
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

                const priceNum = parseFloat(comp.price)
                const domNum = parseFloat(comp.dom)
                const domNote = priceNum > 0 && domNum > 0 ? getDomNote(domNum) : null

                const hasAnyNote = !!domNote || sqftOutlier || yearBuiltNewer || yearBuiltOlder
                const showFeatureRow = priceNum > 0 && parseFloat(comp.sqft) > 0
                const ppsfDiffers = rawPpsf !== null && adjPpsf !== null
                  && Math.abs(adjPpsf - rawPpsf) / rawPpsf > 0.005
                const adjustedDirection = adjPpsf !== null && rawPpsf !== null && adjPpsf < rawPpsf ? 'down' : 'up'

                return (
                  <Fragment key={i}>
                    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={comp.address}
                          onChange={(e) => updateComp(i, 'address', e.target.value)}
                          placeholder="456 Oak St, Round Rock TX"
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={comp.price}
                          onChange={(e) => updateComp(i, 'price', e.target.value)}
                          placeholder="485000"
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={comp.sqft}
                          onChange={(e) => updateComp(i, 'sqft', e.target.value)}
                          placeholder="2050"
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={comp.yearBuilt || ''}
                          onChange={(e) => updateComp(i, 'yearBuilt', e.target.value)}
                          placeholder="2005"
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={comp.dom}
                          onChange={(e) => updateComp(i, 'dom', e.target.value)}
                          placeholder="12"
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap">
                        {adjPpsf !== null ? (
                          <div className="flex flex-col leading-tight">
                            <span style={{ color: ppsfDiffers ? (adjustedDirection === 'up' ? ACCENT : '#dc2626') : '#374151' }}>
                              ${adjPpsf.toFixed(2)}
                            </span>
                            {ppsfDiffers && (
                              <span className="text-[10px] font-normal text-gray-400">
                                raw ${rawPpsf.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5" />
                    </tr>
                    {showFeatureRow && (
                      <tr className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td colSpan={7} className="px-4 pb-3 pt-0">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                            <span className="font-medium text-gray-500">Comp features:</span>

                            <CompFeatureToggle
                              label="Pool"
                              value={comp.pool}
                              options={[{ v: true, l: 'Yes' }, { v: false, l: 'No' }]}
                              onChange={(v) => updateComp(i, 'pool', v)}
                            />

                            <CompFeatureSelect
                              label="Garage"
                              value={comp.garageCars}
                              options={[
                                { v: '', l: '—' },
                                { v: '0', l: '0' },
                                { v: '1', l: '1' },
                                { v: '2', l: '2' },
                                { v: '3', l: '3+' },
                              ]}
                              onChange={(v) => updateComp(i, 'garageCars', v)}
                            />

                            <CompFeatureToggle
                              label="Stories"
                              value={comp.stories}
                              options={[{ v: 'one', l: '1' }, { v: 'two', l: '2' }]}
                              onChange={(v) => updateComp(i, 'stories', v)}
                            />

                            <CompFeatureSelect
                              label="Cond."
                              value={comp.condition}
                              options={[
                                { v: '', l: '—' },
                                { v: 'Excellent', l: 'Excellent' },
                                { v: 'Good', l: 'Good' },
                                { v: 'Average', l: 'Average' },
                                { v: 'Fair', l: 'Fair' },
                              ]}
                              onChange={(v) => updateComp(i, 'condition', v)}
                            />

                            {stats.deltas.length > 0 && (
                              <span className="basis-full inline-flex flex-wrap items-center gap-x-1 text-[11px] text-gray-500 italic">
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
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {hasAnyNote && (
                      <tr className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td colSpan={7} className="px-4 pb-2 pt-0">
                          <div className="space-y-0.5">
                            {domNote && (
                              <p style={{ fontSize: '12px', color: domNote.color }}>{domNote.text}</p>
                            )}
                            {sqftOutlier && (
                              <p style={{ fontSize: '12px', color: '#ea580c' }}>⚠ This comp is significantly different in size from your home — may not be a reliable benchmark</p>
                            )}
                            {yearBuiltNewer && (
                              <p style={{ fontSize: '12px', color: '#ea580c' }}>⚠ Built 15+ years newer than your home — find a closer-year comp</p>
                            )}
                            {yearBuiltOlder && (
                              <p style={{ fontSize: '12px', color: '#ea580c' }}>⚠ Built 15+ years older than your home — find a closer-year comp</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">
                  Average adjusted $/sqft
                </td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: ACCENT }}>
                  {adjustedAvgPpsf ? `$${adjustedAvgPpsf.toFixed(2)}` : '—'}
                </td>
                <td className="px-2 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
        </div>

        {comps.length < 5 && (
          <button
            type="button"
            onClick={addComp}
            className="mt-3 text-sm font-medium underline underline-offset-2 transition-colors"
            style={{ color: ACCENT }}
          >
            + Add comp
          </button>
        )}
      </section>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => goTo(3)}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Continue: Value Additions →
          </button>
        </div>
      </div>
      )}

      {/* ── CARD 3: Value Additions ── */}
      {activeSubStep === 3 && (
      <div>
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">What have you updated?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Check everything that applies. Subject-home features (pool, garage, stories, condition) are already baked in via the comp normalization in step 2 — these are upgrades and concerns on top of that.
        </p>
        <div className="space-y-6">
          {RENOVATION_GROUPS.map((group) => (
            <div key={group.label}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {group.label}
              </h4>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={renovations[item.key] || false}
                      onChange={(e) => handleRenovationChange(item.key, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: ACCENT }}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-sm text-gray-800">{item.label}</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: item.pct > 0 ? ACCENT : '#dc2626' }}
                      >
                        {item.pct > 0 ? '+' : ''}{(item.pct * 100) % 1 === 0 ? item.pct * 100 : (item.pct * 100).toFixed(2).replace(/0+$/, '')}%
                      </span>
                      <span className="text-xs text-gray-400">
                        — {SOURCE_DATA[item.source] ? (
                          <button
                            type="button"
                            onClick={() => openDrawer(item.source)}
                            className="underline underline-offset-2 hover:text-gray-600 transition-colors"
                          >
                            {item.source}
                          </button>
                        ) : item.source}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
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

          {validCount < 3 && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
              ⚠ This estimate is based on only {validCount} comp{validCount === 1 ? '' : 's'}. We recommend at least 3 to defend the price against buyer pushback.
            </div>
          )}

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between px-5 py-3 bg-white">
                <span className="text-sm text-gray-600">
                  Adjusted comp average: ${adjustedAvgPpsf.toFixed(2)}/sqft × {Number(sqft).toLocaleString()} sqft
                </span>
                <span className="text-sm font-semibold text-gray-900">${formatDollars(baseValue)}</span>
              </div>

              {renovationAmounts.map((r) => (
                <div key={r.key} className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">
                    {r.label}: {r.pct > 0 ? '+' : ''}{(r.pct * 100) % 1 === 0 ? r.pct * 100 : (r.pct * 100).toFixed(2).replace(/0+$/, '')}%
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: r.amount >= 0 ? ACCENT : '#dc2626' }}
                  >
                    {r.amount >= 0 ? '+' : '-'}${formatDollars(Math.abs(r.amount))}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                <span className="text-sm font-semibold text-gray-700">Calculated value</span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatDollars(calculatedValue)}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            📊 This is an AI-generated calculation based on the data you entered. It is not an appraisal and should not be used as the basis for any loan or legal transaction.
          </p>

          <div className="mt-4">
            {estimateSaved ? (
              <span className="text-sm font-semibold" style={{ color: ACCENT }}>
                ✓ Estimate saved
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSaveEstimate}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Save my calculation
              </button>
            )}
          </div>
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

      <SourceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        source={drawerSource}
      />
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
    </div>
  )
}
