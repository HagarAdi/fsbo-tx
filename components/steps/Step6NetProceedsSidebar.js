import { calcNetProceeds, fmtCurrency } from './Step6Offers.data'

export default function Step6NetProceedsSidebar({ offer, annualTaxes, setAnnualTaxes }) {
  const price = parseFloat(offer?.price) || 0

  if (!price) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Est. Net Check</p>
        <div className="rounded-lg border border-dashed border-gray-200 px-3 py-3">
          <p className="text-xs text-gray-400">Enter a purchase price to see your estimate.</p>
        </div>
      </div>
    )
  }

  const result = calcNetProceeds(offer, annualTaxes)
  if (!result) return null

  const { sellerContrib, titlePolicy, taxProration, escrow, net, hasClosingDate } = result
  const isHighPara12 = sellerContrib > price * 0.02

  const rows = [
    {
      label: 'Gross Price',
      value: fmtCurrency(String(price)),
      highlight: false,
    },
    {
      label: 'Para 12 Deduction',
      value: sellerContrib > 0 ? `− ${fmtCurrency(String(Math.round(sellerContrib)))}` : '—',
      highlight: isHighPara12,
    },
    {
      label: 'Title Policy',
      value: `− ${fmtCurrency(String(Math.round(titlePolicy)))}`,
      highlight: false,
    },
    {
      label: `Tax Proration${!hasClosingDate ? ' (est.)' : ''}`,
      value: `− ${fmtCurrency(String(Math.round(taxProration)))}`,
      highlight: false,
    },
    {
      label: 'Escrow & Recording',
      value: `− ${fmtCurrency(String(escrow))}`,
      highlight: false,
    },
  ]

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Est. Net Check</p>

      <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
        <div className="px-3 py-3 text-center" style={{ backgroundColor: '#f0fdf4' }}>
          <p
            className="text-2xl font-bold leading-none"
            style={{ color: net >= 0 ? '#15803d' : '#dc2626' }}
          >
            {fmtCurrency(String(Math.round(net)))}
          </p>
          <p className="text-xs text-gray-500 mt-1">before mortgage payoff</p>
        </div>

        <div className="divide-y divide-gray-100">
          {rows.map(row => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-3 py-1.5 text-xs ${row.highlight ? 'bg-red-50' : ''}`}
            >
              <span className={row.highlight ? 'text-red-700 font-semibold' : 'text-gray-500'}>
                {row.label}
              </span>
              <span className={`font-semibold tabular-nums ${row.highlight ? 'text-red-600' : 'text-gray-700'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Annual taxes (optional)</label>
        <input
          type="number"
          min="0"
          value={annualTaxes}
          onChange={e => setAnnualTaxes(e.target.value)}
          placeholder={`~${fmtCurrency(String(Math.round(price * 0.022)))}`}
          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-400 mt-0.5">Leave blank → 2.2% estimate</p>
      </div>
    </div>
  )
}
