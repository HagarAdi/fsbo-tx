const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const DRAWERS = [
  { id: 'disclosure', emoji: '📑', label: 'TREC Disclosure' },
  { id: 'prep',       emoji: '🕵️', label: 'Inspection Prep' },
  { id: 'math',       emoji: '💰', label: 'Negotiation Math' },
  { id: 'rules',      emoji: '⚖️', label: 'Termination Rules' },
]

const SDN_ITEMS = [
  "Downloaded and completed the TREC Seller's Disclosure Notice",
  'Disclosed all known defects, water damage, and foundation issues',
  'Provided SDN to buyer before or at contract signing',
]

const SDN_TREC_INFO = {
  termName: "Seller's Disclosure Notice",
  whatItSays: "Seller must complete and deliver the TREC Seller's Disclosure Notice disclosing all known defects and conditions that materially affect the value or desirability of the property.",
  whatItMeans: "You are legally required in Texas to fill out and give the buyer the TREC OP-H form before or at contract signing. It covers roof, foundation, water damage, flooding history, HVAC, appliances, HOA disputes — anything you KNOW about your home's condition.",
  moneyTrail: "There is no dollar ceiling on non-disclosure liability. Buyers who discover undisclosed defects after closing can sue for damages, rescission, or return of the full purchase price. Disclosure protects you — not just the buyer.",
  txSellerTip: "When in doubt, disclose. A disclosed issue rarely kills a deal — a hidden one discovered post-closing can mean litigation. Download the TREC OP-H form at trec.texas.gov, complete it fully, and deliver it before the contract is signed.",
}

const PHASE_RANGES = [
  { label: 'Inspector Hired',  startDay: 0, endDay: 2 },
  { label: 'Report Delivered', startDay: 2, endDay: 3 },
  { label: 'Buyer Reviews',    startDay: 3, endDay: 7 },
  { label: 'Negotiation',      startDay: 7, endDay: null },
]

const TIMELINE = [
  { range: 'Day 1–2',          text: 'Buyer hires a licensed inspector. You must provide access. Plan to be out of the home for 3–4 hours.' },
  { range: 'Day 2–3',          text: 'Inspector delivers a report to the buyer — typically 30–80 pages with photos of every finding.' },
  { range: 'Day 3–7',          text: 'Buyer reviews report and decides what to request. They may ask for repairs, credits, or price reduction.' },
  { range: 'Day 7–10',         text: 'You respond to repair requests. Negotiate. Reach agreement — or buyer walks.' },
  { range: 'Option period ends', text: "Once expired, buyer loses their right to walk away for free. They're committed." },
]

const INFO_NOTES = [
  'Buyers can back out for ANY reason during the option period — no explanation needed.',
  'The option fee ($100–500) is yours to keep regardless of outcome.',
  'In Texas, inspectors are licensed by TREC — verify your inspector is licensed at trec.texas.gov.',
]

const FINDINGS = [
  {
    title: 'Foundation issues',
    detail: 'The #1 concern in Texas clay soil. Minor cracks are normal. Major movement needs a structural engineer. Cost to repair: $3,000–15,000+',
  },
  {
    title: 'HVAC problems',
    detail: 'Age, dirty filters, refrigerant levels. Texas buyers are especially sensitive to AC issues. A recent service receipt helps.',
  },
  {
    title: 'Roof condition',
    detail: 'Age, missing shingles, flashing issues. Most lenders require roof to have 2+ years of life remaining.',
  },
  {
    title: 'Plumbing',
    detail: 'Slow drains, leaks under sinks, water heater age. Common and usually cheap to fix.',
  },
  {
    title: 'Electrical',
    detail: 'Older panels, GFCI outlets near water, double-tapped breakers. Safety items buyers take seriously.',
  },
  {
    title: 'Wood rot',
    detail: 'Fascia boards, window sills, door frames. Common in Texas humidity. Usually $200–500 to fix.',
  },
  {
    title: 'Poor drainage',
    detail: 'Water pooling near foundation. Serious concern in TX — affects foundation long term.',
  },
]

const REQUEST_TYPES = ['Repair', 'Credit', 'Price Reduction']
const RESPONSE_TYPES = ['Accept', 'Counter', 'Decline']

const RESPONSE_STYLE = {
  Accept:  { bg: '#dcfce7', text: '#15803d' },
  Counter: { bg: '#fef9c3', text: '#854d0e' },
  Decline: { bg: '#fee2e2', text: '#dc2626' },
}

const PRO_TIPS = [
  { tip: "Offer a closing credit instead of repairs — you stay in control of cost", source: 'Industry best practice' },
  { tip: "Prioritize safety items — buyers and lenders care most about these", source: 'HomeLight Agent Survey' },
  { tip: "The inspection report is not a repair list — you don't have to fix everything", source: 'NAR guidelines' },
  { tip: "In Texas, foundation issues are common — get a structural engineer opinion before agreeing to repairs", source: 'Industry best practice' },
]

const VENDORS = [
  { label: 'TREC License Lookup', url: 'https://trec.texas.gov' },
  { label: 'HomeAdvisor',         url: 'https://homeadvisor.com' },
  { label: 'Thumbtack',           url: 'https://thumbtack.com' },
  { label: 'Foundation repair TX', url: 'https://thumbtack.com/k/foundation-repair/near-me' },
]

function makeEmptyRequest() {
  return {
    id: Date.now() + Math.random(),
    description: '',
    requestType: 'Repair',
    requestedAmount: '',
    response: 'Accept',
    counterAmount: '',
    notes: '',
  }
}

function loadStep7() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step7 || {}
  } catch { return {} }
}

function saveStep7(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step7: data }))
  } catch {}
}

function getAcceptedOptionDays() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    const accepted = (all.step6?.offers || []).find(o => o.status === 'Accepted')
    return accepted ? (parseInt(accepted.optionDays) || 10) : 10
  } catch { return 10 }
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

export {
  ACCENT, PURPLE, DRAWERS, SDN_ITEMS, SDN_TREC_INFO, PHASE_RANGES,
  TIMELINE, INFO_NOTES, FINDINGS, REQUEST_TYPES, RESPONSE_TYPES, RESPONSE_STYLE,
  PRO_TIPS, VENDORS, makeEmptyRequest, loadStep7, saveStep7, getAcceptedOptionDays, inputCls,
}
