import { useState, useEffect } from 'react'

const ACCENT = '#16a34a'
const EMPTY_COMP = { address: '', price: '', sqft: '', dom: '' }

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

export default function Step1Pricing({ homeAddress, onComplete, isCompleted }) {
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
        JSON.stringify({ ...existing, step1: { sqft, bedrooms, bedsBaths, yearBuilt, condition, stories, pool, garage, comps } })
      )
    } catch {}
  }, [sqft, bedrooms, bedsBaths, yearBuilt, condition, stories, pool, garage, comps])

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
