import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'
const EMPTY_COMP = { address: '', price: '', sqft: '', dom: '' }

const RENOVATIONS = [
  { key: 'newRoof', label: 'New roof (last 5 years)', pct: 0.015, source: 'NAR Remodeling Impact Report' },
  { key: 'updatedKitchen', label: 'Updated kitchen', pct: 0.03, source: 'NAR Remodeling Impact Report' },
  { key: 'updatedBathrooms', label: 'Updated bathrooms', pct: 0.02, source: 'NAR Remodeling Impact Report' },
  { key: 'freshPaint', label: 'Fresh interior paint', pct: 0.0075, source: 'Zillow Research' },
  { key: 'newFlooring', label: 'New flooring', pct: 0.015, source: 'NAR Remodeling Impact Report' },
  { key: 'newWindows', label: 'New windows', pct: 0.0075, source: 'NAR Remodeling Impact Report' },
  { key: 'hvacOld', label: 'HVAC over 15 years old', pct: -0.015, source: 'HomeLight Agent Survey' },
  { key: 'roofOld', label: 'Roof over 20 years old', pct: -0.015, source: 'HomeLight Agent Survey' },
]

const CONDITION_PCT = { Excellent: 0.04, Good: 0, Average: -0.03, Fair: -0.06 }

function formatDollars(n) {
  return Math.round(n).toLocaleString()
}

function TooltipIcon({ id, activeTooltip, setActiveTooltip }) {
  return (
    <button
      type="button"
      onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold text-gray-400 border border-gray-300 hover:text-gray-600 hover:border-gray-400 transition-colors ml-1.5 flex-shrink-0 leading-none"
      aria-label="Show tip"
    >
      ?
    </button>
  )
}

function Tooltip({ children }) {
  return (
    <p className="mt-1 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded px-3 py-2">
      {children}
    </p>
  )
}

export default function Step1Pricing({ homeAddress, onComplete, isCompleted, onPriceUpdate }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const [sqft, setSqft] = useState('')
  const [bedsBaths, setBedsBaths] = useState('')
  const [yearBuilt, setYearBuilt] = useState('')
  const [condition, setCondition] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [stories, setStories] = useState(null)
  const [pool, setPool] = useState(null)
  const [garage, setGarage] = useState(null)
  const [comps, setComps] = useState([
    { ...EMPTY_COMP },
    { ...EMPTY_COMP },
    { ...EMPTY_COMP },
  ])
  const [renovations, setRenovations] = useState({})
  const [estimateSaved, setEstimateSaved] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) {
        const data = JSON.parse(saved)
        const s1 = data.step1
        if (s1) {
          if (s1.sqft !== undefined) setSqft(s1.sqft)
          if (s1.bedsBaths !== undefined) setBedsBaths(s1.bedsBaths)
          if (s1.yearBuilt !== undefined) setYearBuilt(s1.yearBuilt)
          if (s1.condition !== undefined) setCondition(s1.condition)
          if (s1.bedrooms !== undefined) setBedrooms(s1.bedrooms)
          if (s1.stories !== undefined) setStories(s1.stories)
          if (s1.pool !== undefined) setPool(s1.pool)
          if (s1.garage !== undefined) setGarage(s1.garage)
          if (s1.comps && s1.comps.length > 0) setComps(s1.comps)
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
        JSON.stringify({ ...existing, step1: { sqft, bedrooms, bedsBaths, yearBuilt, condition, stories, pool, garage, comps, renovations } })
      )
    } catch {}
  }, [sqft, bedrooms, bedsBaths, yearBuilt, condition, stories, pool, garage, comps, renovations])

  useEffect(() => {
    setEstimateSaved(false)
  }, [sqft, condition, stories, pool, renovations, comps])

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

  const getPpsf = (comp) => {
    const price = parseFloat(comp.price)
    const sf = parseFloat(comp.sqft)
    if (price > 0 && sf > 0) return (price / sf).toFixed(2)
    return null
  }

  const avgPpsf = (() => {
    const valid = comps.filter((c) => getPpsf(c) !== null)
    if (!valid.length) return null
    const sum = valid.reduce((acc, c) => acc + parseFloat(c.price) / parseFloat(c.sqft), 0)
    return (sum / valid.length).toFixed(2)
  })()

  const compTooltips = {
    comp_address: 'Find on Redfin or HAR.com under Recently Sold',
    comp_price: 'Final sale price, not list price. Do not use Zestimate',
    comp_sqft: 'Heated area only. On the listing or CAD record',
    comp_dom: 'Under 21 days = priced right. Over 45 days = was overpriced, use with caution',
  }

  // Price calculation (derived values, only meaningful when avgPpsf and sqft exist)
  const sqftNum = parseFloat(sqft)
  const hasComps = avgPpsf !== null
  const baseValue = hasComps && sqftNum > 0 ? parseFloat(avgPpsf) * sqftNum : null

  const condPct = CONDITION_PCT[condition] ?? null
  const condAmt = baseValue && condPct !== null ? baseValue * condPct : 0
  const poolAmt = baseValue && pool === true ? 20000 : 0
  const storyAmt = baseValue && stories === 'one' ? baseValue * 0.02 : 0
  const renovationAmounts = baseValue
    ? RENOVATIONS.filter((r) => renovations[r.key]).map((r) => ({ ...r, amount: baseValue * r.pct }))
    : []
  const calculatedValue = baseValue
    ? baseValue + condAmt + poolAmt + storyAmt + renovationAmounts.reduce((acc, r) => acc + r.amount, 0)
    : null
  const rangeMin = calculatedValue ? calculatedValue * 0.98 : null
  const rangeMax = calculatedValue ? calculatedValue * 1.02 : null
  const tipPrice = calculatedValue ? Math.ceil(calculatedValue / 25000) * 25000 - 1000 : null

  const handleSaveEstimate = () => {
    if (!calculatedValue) return
    const adjustments = [
      { step: 1, reason: 'comp average', amount: Math.round(baseValue) },
    ]
    if (condAmt !== 0) adjustments.push({ step: 1, reason: `condition (${condition})`, amount: Math.round(condAmt) })
    if (poolAmt) adjustments.push({ step: 1, reason: 'pool', amount: poolAmt })
    if (storyAmt) adjustments.push({ step: 1, reason: 'one-story premium', amount: Math.round(storyAmt) })
    renovationAmounts.forEach((r) =>
      adjustments.push({ step: 1, reason: r.label, amount: Math.round(r.amount) })
    )
    const estimate = {
      basePrice: Math.round(baseValue),
      adjustments,
      currentEstimate: Math.round(calculatedValue),
    }
    try {
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(estimate))
    } catch {}
    if (onPriceUpdate) onPriceUpdate(estimate)
    setEstimateSaved(true)
  }

  return (
    <div className="px-10 py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
        >
          Prepare
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Price Your Home Correctly</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span> Pricing is the single
        most important decision you&apos;ll make. Homes priced right sell in days — overpriced homes
        sit and get stigmatized. Texas buyers are data-savvy and know the comps.
      </p>

      {/* Your home details */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Your home details</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Square footage */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Square footage</label>
              <TooltipIcon id="sqft" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'sqft' && (
              <Tooltip>Heated/cooled area only. Find on Williamson CAD (wcad.org)</Tooltip>
            )}
            <input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="e.g. 2100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Bedrooms</label>
              <TooltipIcon id="bedrooms" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'bedrooms' && (
              <Tooltip>Number of bedrooms. Buyers filter by this — comps should match your bedroom count</Tooltip>
            )}
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="e.g. 4"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Beds / Baths */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Beds / Baths</label>
              <TooltipIcon id="bedsBaths" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'bedsBaths' && (
              <Tooltip>Enter as 3/2 or 4/2.5. Half baths count as 0.5</Tooltip>
            )}
            <input
              type="text"
              value={bedsBaths}
              onChange={(e) => setBedsBaths(e.target.value)}
              placeholder="e.g. 4/2.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Year built */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Year built</label>
              <TooltipIcon id="yearBuilt" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'yearBuilt' && (
              <Tooltip>
                On your CAD record. Homes 10+ years older than comps price 3–5% lower unless updated
              </Tooltip>
            )}
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              placeholder="e.g. 2005"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Condition */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Condition</label>
              <TooltipIcon id="condition" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'condition' && (
              <Tooltip>Be honest — buyers find out at inspection</Tooltip>
            )}
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

          {/* Stories */}
          <div>
            <div className="flex items-center mb-2">
              <label className="text-sm font-medium text-gray-700">One-story or Two-story</label>
              <TooltipIcon id="stories" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'stories' && (
              <Tooltip>In Texas, single-story homes typically sell faster and for more per sqft, especially for buyers over 50</Tooltip>
            )}
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

          {/* Pool */}
          <div>
            <div className="flex items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Pool</label>
              <TooltipIcon id="pool" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
            </div>
            {activeTooltip === 'pool' && (
              <Tooltip>In Texas, a pool adds $15,000–$30,000 depending on neighborhood</Tooltip>
            )}
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

          {/* Garage */}
          <div>
            <div className="flex items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Garage</label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGarage(true)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  garage === true
                    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setGarage(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={
                  garage === false
                    ? { backgroundColor: ACCENT, color: 'white', borderColor: ACCENT }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                No
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How to find your comps */}
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

      {/* Comparable sales */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Comparable sales</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter 3–5 recent nearby sales to establish your price baseline.
        </p>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { id: 'comp_address', label: 'Address' },
                  { id: 'comp_price', label: 'Sale Price' },
                  { id: 'comp_sqft', label: 'Sqft' },
                  { id: 'comp_dom', label: 'DOM' },
                  { id: null, label: '$/sqft' },
                ].map(({ id, label }) => (
                  <th key={label} className="text-left px-4 py-3 font-medium text-gray-600">
                    <div>
                      <div className="flex items-center gap-0.5">
                        {label}
                        {id && (
                          <TooltipIcon
                            id={id}
                            activeTooltip={activeTooltip}
                            setActiveTooltip={setActiveTooltip}
                          />
                        )}
                      </div>
                      {activeTooltip === id && id && (
                        <div className="mt-1 text-xs font-normal normal-case tracking-normal text-gray-500 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 whitespace-normal min-w-[180px]">
                          {compTooltips[id]}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comps.map((comp, i) => {
                const ppsf = getPpsf(comp)
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
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
                        value={comp.dom}
                        onChange={(e) => updateComp(i, 'dom', e.target.value)}
                        placeholder="12"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {ppsf ? `$${ppsf}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">
                  Average price per sqft
                </td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: ACCENT }}>
                  {avgPpsf ? `$${avgPpsf}` : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
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

      {/* Section 1: Renovation checklist */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">What have you updated?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Check everything that applies. These adjustments will be reflected in your price estimate below.
        </p>
        <div className="space-y-3">
          {RENOVATIONS.map((item) => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={renovations[item.key] || false}
                onChange={(e) =>
                  setRenovations((prev) => ({ ...prev, [item.key]: e.target.checked }))
                }
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
                <span className="text-xs text-gray-400">— {item.source}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Section 2: Price calculation */}
      {hasComps && baseValue && (
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your estimated price</h3>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {/* Base value */}
              <div className="flex items-center justify-between px-5 py-3 bg-white">
                <span className="text-sm text-gray-600">
                  Base value: avg ${avgPpsf}/sqft × {Number(sqft).toLocaleString()} sqft
                </span>
                <span className="text-sm font-semibold text-gray-900">${formatDollars(baseValue)}</span>
              </div>

              {/* Condition adjustment */}
              {condition && condPct !== null && condAmt !== 0 && (
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">
                    Condition ({condition}): {condPct > 0 ? '+' : ''}{condPct * 100}%
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: condAmt >= 0 ? ACCENT : '#dc2626' }}
                  >
                    {condAmt >= 0 ? '+' : '-'}${formatDollars(Math.abs(condAmt))}
                  </span>
                </div>
              )}
              {condition === 'Good' && (
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">Condition (Good): 0%</span>
                  <span className="text-sm font-semibold text-gray-500">$0</span>
                </div>
              )}

              {/* Pool */}
              {pool === true && (
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">
                    Pool (TX adds $15K–$30K regardless of home price)
                  </span>
                  <span className="text-sm font-semibold" style={{ color: ACCENT }}>+$20,000</span>
                </div>
              )}

              {/* One-story premium */}
              {stories === 'one' && (
                <div className="flex items-center justify-between px-5 py-3 bg-white">
                  <span className="text-sm text-gray-600">One-story premium: +2%</span>
                  <span className="text-sm font-semibold" style={{ color: ACCENT }}>
                    +${formatDollars(storyAmt)}
                  </span>
                </div>
              )}

              {/* Renovation adjustments */}
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

              {/* Dividing line + price range */}
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                <span className="text-sm font-semibold text-gray-900">Recommended price range</span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatDollars(rangeMin)} — ${formatDollars(rangeMax)}
                </span>
              </div>
            </div>
          </div>

          {/* Tip box */}
          <div
            className="mt-4 rounded-lg px-4 py-3"
            style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}
          >
            <p className="text-sm" style={{ color: '#166534' }}>
              <span className="font-semibold">Tip:</span> Price at{' '}
              <span className="font-semibold">${formatDollars(tipPrice)}</span> to appear in more
              search filters on Zillow and Redfin
            </p>
          </div>

          {/* Save button */}
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
                Save this estimate
              </button>
            )}
          </div>
        </section>
      )}

      {/* Pro tips */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pro tips</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { tip: 'Homes priced correctly sell 50% faster than overpriced ones', source: 'Zillow Research 2023' },
            { tip: 'After 21 days on market, buyers assume something is wrong with the home', source: 'NAR Profile of Home Buyers' },
            { tip: 'A $400 pre-listing appraisal gives you a defensible price to show buyers', source: 'HomeLight Agent Survey' },
            { tip: 'Price reductions signal desperation — better to price right the first time', source: 'Industry best practice' },
          ].map(({ tip, source }, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-sm text-gray-800 leading-relaxed mb-2">{tip}</p>
              <p className="text-xs text-gray-400">— {source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools & resources */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Where to find your data</h3>
        <div className="flex flex-wrap gap-2">
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
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* Mark complete */}
      <div className="pt-6 border-t border-gray-100">
        {isCompleted ? (
          <div className="flex items-center gap-4">
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
              Completed
            </span>
            <button
              type="button"
              onClick={() => onComplete(false)}
              className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
            >
              Undo
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
  )
}
