const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const DRAWERS = [
  { id: 'terms',    emoji: '📋', label: 'Offer Terms' },
  { id: 'proceeds', emoji: '📊', label: 'Net Proceeds' },
  { id: 'counter',  emoji: '💬', label: 'How to Counter' },
  { id: 'decision', emoji: '✅', label: 'Decision Guide' },
]

const OFFER_TERMS = [
  {
    title: 'Purchase Price',
    explanation: 'The amount the buyer is offering to pay.',
    whyItMatters: 'This is your starting point for negotiation — not necessarily your ending point.',
  },
  {
    title: 'Down Payment',
    explanation: 'How much cash the buyer is putting down.',
    whyItMatters: 'Higher down payment = stronger buyer. 20%+ means no PMI and a serious buyer. Under 5% = higher risk of financing falling through.',
  },
  {
    title: 'Financing Type',
    explanation: 'How the buyer is paying.',
    whyItMatters: 'Cash is king — no appraisal risk, faster close. Conventional is solid. FHA/VA have more requirements and take longer.',
  },
  {
    title: 'Option Period',
    explanation: 'A set number of days (typically 5–10) where the buyer can back out for any reason.',
    whyItMatters: 'Shorter option period = more committed buyer. The buyer pays you an option fee — typically $100–500 — which you keep if they walk.',
    trecInfo: {
      termName: 'Termination Option / Option Period',
      whatItSays: 'For a negotiated number of days and fee, the buyer has the unrestricted right to terminate the contract for any reason.',
      whatItMeans: 'You are giving the buyer a specific number of days to change their mind for ANY reason in exchange for a small fee. No explanation needed — they can just walk.',
      moneyTrail: 'Option Fee → paid directly to SELLER within 3 days of contract execution. Yours to keep regardless of outcome. Earnest Money stays at title company during this period.',
      txSellerTip: 'Negotiate the shortest option period possible — 5 days is reasonable, 10 is standard. The option fee is yours either way — make it worth your time off market.',
    },
  },
  {
    title: 'Option Fee',
    explanation: 'Money paid by buyer for the option period.',
    whyItMatters: 'Non-refundable if buyer cancels. Negotiate for as much as possible.',
  },
  {
    title: 'Closing Date',
    explanation: 'When ownership transfers.',
    whyItMatters: '30–45 days is standard in Texas. Shorter close can be a negotiating chip.',
    trecInfo: {
      termName: 'Closing Date',
      whatItSays: 'The date by which the transaction must be completed and ownership transferred.',
      whatItMeans: "The deadline for everything — financing, inspections, title work — to be done. If closing doesn't happen by this date, either party may have grounds to terminate.",
      moneyTrail: 'On closing day: title company distributes funds. Your mortgage payoff goes to your lender. Your net proceeds wire to your bank account — same day or next morning.',
      txSellerTip: '30-45 days is standard in Texas. A buyer offering a shorter close (21-28 days) is often more serious — especially cash buyers. Use closing date as a negotiating chip.',
    },
  },
  {
    title: 'Earnest Money',
    explanation: 'Good faith deposit held by title company.',
    whyItMatters: 'Typically 1% of purchase price. If buyer backs out outside the option period, you may keep this.',
    trecInfo: {
      termName: 'Earnest Money',
      whatItSays: 'A deposit made by the buyer as evidence of good faith, held by the title company until closing or termination.',
      whatItMeans: "The buyer puts skin in the game. This money is held by the title company — not you — and protects you if the buyer backs out outside the option period.",
      moneyTrail: "Earnest Money → Title Company escrow. If buyer defaults outside option period → may be released to Seller. If deal closes → applied to buyer's closing costs.",
      txSellerTip: "1% of purchase price is standard in Texas. On a $500K home that's $5,000. Higher earnest money = more committed buyer — you can negotiate for more.",
    },
  },
  {
    title: 'Inclusions',
    explanation: 'What stays with the home.',
    whyItMatters: "Appliances, fixtures, shelving — get clear on what's included to avoid surprises at closing.",
  },
  {
    title: "Property Condition / Seller's Disclosure",
    explanation: "Seller's known defects and condition disclosures.",
    whyItMatters: 'You are legally required to disclose everything you know. When in doubt, disclose.',
    trecInfo: {
      termName: "Property Condition / Seller's Disclosure",
      whatItSays: "Seller's representations about the property's condition and any known defects, as detailed in the Seller's Disclosure Notice.",
      whatItMeans: "You are legally required to disclose everything you KNOW about your home's condition. What you don't know — you don't have to disclose. What you DO know — you must.",
      moneyTrail: 'No money involved — but non-disclosure can cost you everything. Buyers who discover undisclosed defects after closing can sue for damages or rescission.',
      txSellerTip: "When in doubt, disclose. A disclosed issue rarely kills a deal — a hidden one discovered later can end in litigation. Fill out the TREC Seller's Disclosure Notice completely and honestly.",
    },
  },
  {
    title: 'Title Policy & Survey',
    explanation: "Who pays for title insurance and survey.",
    whyItMatters: "In Texas it's customary for the seller to pay the owner's title policy — factor this into your net proceeds.",
    trecInfo: {
      termName: 'Title Policy & Survey',
      whatItSays: "Provisions covering who pays for title insurance and property survey, and what type of title policy will be delivered at closing.",
      whatItMeans: "Title insurance protects the owner if someone later claims they have a right to the property. In Texas, it's customary for the seller to pay for the owner's title policy — but this is negotiable.",
      moneyTrail: "Owner's Title Policy → typically paid by Seller in Texas ($1,000-2,500). Lender's Title Policy → paid by Buyer. Survey → negotiable, typically $400-600.",
      txSellerTip: "Factor the owner's title policy into your net proceeds calculation in Step 8. It's a significant cost many FSBO sellers forget to account for.",
    },
  },
  {
    title: 'Appraisal Contingency',
    explanation: 'Buyer can back out if home appraises below purchase price.',
    whyItMatters: 'Common with financed offers. Can negotiate appraisal gap coverage.',
  },
  {
    title: 'Inspection Contingency',
    explanation: 'Buyer can request repairs after inspection.',
    whyItMatters: 'Handled during option period in Texas — not a separate contingency.',
  },
]

const FINANCING_OPTIONS = ['Cash', 'Conventional', 'FHA', 'VA', 'Other']

const OFFER_STATUS_OPTIONS = ['Received', 'Countered', 'Accepted', 'Rejected']

const OFFER_STATUS_COLORS = {
  Received:  { bg: '#dbeafe', text: '#1d4ed8' },
  Countered: { bg: '#fef3c7', text: '#92400e' },
  Accepted:  { bg: '#dcfce7', text: '#15803d' },
  Rejected:  { bg: '#f3f4f6', text: '#6b7280' },
}

const RED_FLAG_CHECKS = [
  {
    check: (o) => { const d = parseFloat(o.optionDays); return !isNaN(d) && d > 10 },
    message: 'Option period is long — buyer has more time to back out fee-free',
  },
  {
    check: (o) => {
      const price = parseFloat(o.price), em = parseFloat(o.earnestMoney)
      return price > 0 && !isNaN(em) && em < price * 0.01
    },
    message: 'Earnest money is under 1% of purchase price — low buyer commitment',
  },
  {
    check: (o) => {
      if (o.financing !== 'FHA' && o.financing !== 'VA') return false
      if (!o.closingDate) return false
      const diff = Math.round((new Date(o.closingDate) - new Date()) / 86400000)
      return diff < 45
    },
    message: 'FHA/VA loans typically need 45+ days to close — closing date may be too tight',
  },
  {
    check: (o) => {
      const dp = parseFloat(o.downPayment)
      return o.financing !== 'Cash' && !isNaN(dp) && dp < 10
    },
    message: 'Low down payment may indicate higher financing risk',
  },
]

const TX_TIPS = [
  'Option fee is negotiable — $100–500 is typical in the Austin area',
  'Counter within 24 hours to keep momentum — buyers get nervous with silence',
  'Cash closes in 2–3 weeks; financed offers need 30–45 days',
  'Multiple offers? Ask all buyers for their "highest and best" by a deadline',
]

const SCORE_BANDS = [
  { min: 90, label: 'Exceptional' },
  { min: 75, label: 'Strong' },
  { min: 60, label: 'Average' },
  { min: 0,  label: 'Weak' },
]

function getScoreBand(score) {
  return SCORE_BANDS.find(b => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1]
}

function makeEmptyOffer(label) {
  return {
    id: Date.now() + Math.random(),
    nickname: label,
    status: 'Received',
    price: '',
    financing: 'Conventional',
    downPayment: '',
    optionDays: '',
    optionFee: '',
    earnestMoney: '',
    closingDate: '',
    notes: '',
  }
}

function scoreBreakdown(offer, maxPrice) {
  const dp = parseFloat(offer.downPayment) || 0
  const optVal = parseFloat(offer.optionDays)
  const price = parseFloat(offer.price) || 0

  let financing = 0
  if (offer.financing === 'Cash') financing = 30
  else if (offer.financing === 'Conventional') financing = 20
  else if (offer.financing === 'FHA' || offer.financing === 'VA') financing = 10

  let downPts = 0
  if (dp > 20) downPts = 20
  else if (dp >= 10) downPts = 10

  let optPts = 5
  if (!isNaN(optVal)) {
    if (optVal < 5) optPts = 15
    else if (optVal <= 7) optPts = 10
  }

  let closingPts = 0
  if (offer.closingDate) {
    const diff = Math.round((new Date(offer.closingDate) - new Date()) / 86400000)
    if (diff <= 30) closingPts = 10
    else if (diff <= 45) closingPts = 5
  }

  let pricePts = 0
  if (maxPrice > 0 && price > 0) pricePts = Math.round((price / maxPrice) * 25)

  return [
    { label: 'Financing type', points: financing, max: 30 },
    { label: 'Down payment',   points: downPts,   max: 20 },
    { label: 'Option period',  points: optPts,    max: 15 },
    { label: 'Closing speed',  points: closingPts, max: 10 },
    { label: 'Price vs. highest', points: pricePts, max: 25 },
  ]
}

function calcScore(offer, maxPrice) {
  return Math.min(scoreBreakdown(offer, maxPrice).reduce((s, r) => s + r.points, 0), 100)
}

function getRedFlags(offer) {
  return RED_FLAG_CHECKS.filter(r => r.check(offer)).map(r => r.message)
}

function loadStep6() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step6 || {}
  } catch { return {} }
}

function saveStep6(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step6: data }))
  } catch {}
}

function fmtCurrency(val) {
  const n = parseFloat(val)
  return (!val || isNaN(n)) ? '—' : '$' + n.toLocaleString()
}

function fmtDate(val) {
  if (!val) return '—'
  return new Date(val + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

export {
  ACCENT, PURPLE, DRAWERS, OFFER_TERMS, FINANCING_OPTIONS,
  OFFER_STATUS_OPTIONS, OFFER_STATUS_COLORS, RED_FLAG_CHECKS, TX_TIPS,
  SCORE_BANDS, getScoreBand, makeEmptyOffer, scoreBreakdown, calcScore,
  getRedFlags, loadStep6, saveStep6, fmtCurrency, fmtDate, inputCls,
}
