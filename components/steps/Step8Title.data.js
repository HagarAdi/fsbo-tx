import { notifyStepDataChange } from '../../utils/notifyStepData'
import { calcNetProceeds } from './Step6Offers.data'

const NET_PROCEEDS_EMPTY = {
  salePrice: '', mortgagePayoff: '', titleFees: '', propertyTaxes: '',
  hoaFees: '', repairCredits: '', sellerContribution: '', misc: '',
}

const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const DRAWERS = [
  { id: 'title',   emoji: '🏢', label: 'Title Setup' },
  { id: 'docs',    emoji: '📝', label: 'Doc Prep' },
  { id: 'fraud',   emoji: '🛡️', label: 'Wire Fraud' },
  { id: 'closing', emoji: '🏠', label: 'Closing Day' },
]

const TITLE_COMPANIES = [
  { name: 'Republic Title',       description: 'Full service title & escrow', rating: '4.9', coverage: 'Dallas/Fort Worth & Austin', url: 'https://republictitle.com' },
  { name: 'Chicago Title Texas',  description: 'Statewide coverage',           rating: '4.8', coverage: 'All TX counties',           url: 'https://cttexas.com' },
  { name: 'Independence Title',   description: 'Local TX title company',        rating: '4.7', coverage: 'Austin & Central TX',       url: 'https://independencetitle.com' },
]

const TITLE_TIMELINE = [
  { period: 'Week 1',     label: 'Title search',                    detail: 'Checks for liens, judgments, ownership disputes on your property' },
  { period: 'Week 1–2',   label: 'HOA estoppel letter',             detail: 'If you have an HOA, they request a clearance letter (takes 1–2 weeks, costs $200–400)' },
  { period: 'Week 2–3',   label: 'Lien clearance',                  detail: 'Pays off any liens from your proceeds at closing' },
  { period: 'Week 3',     label: 'Closing disclosure',              detail: 'You receive a document showing exact costs and net proceeds 3 days before closing' },
  { period: 'Closing day',label: 'Deed transfer, funds distribution', detail: 'You get paid' },
]

const PAYOFF_CARDS = [
  "Call your mortgage lender and request a 'payoff statement' — give them your expected closing date",
  'Takes 3–5 business days — request it as soon as you have a closing date',
  'The payoff amount changes daily due to interest — get it dated close to your closing date',
  'If you own your home free and clear — skip this step ✓',
]

const SURVEY_OPTIONS = ['I have a survey', 'I need a new survey', 'Not sure']

const PRO_TIPS_CLOSE = [
  { tip: 'In Texas, closing typically takes 30–45 days from contract to close',                             source: 'Industry standard' },
  { tip: 'The Closing Disclosure arrives 3 days before closing — review every line carefully',              source: 'CFPB requirement' },
  { tip: 'Wire funds 24–48 hours early if possible — last minute wires cause delays',                       source: 'Title company best practice' },
  { tip: 'Take photos of the home condition on closing day — protects you if disputes arise later',         source: 'Industry best practice' },
]

const VENDORS_CLOSE = [
  { label: 'Republic Title',        url: 'https://republictitle.com' },
  { label: 'Independence Title',    url: 'https://independencetitle.com' },
  { label: 'TREC',                  url: 'https://trec.texas.gov' },
  { label: 'Texas Title Insurance', url: 'https://tdi.texas.gov' },
]

const WIRE_FRAUD_SOURCE = {
  title: 'Wire Fraud in Real Estate',
  year: '2024',
  intro: 'Real estate wire fraud is the #1 financial cybercrime in the US. The FBI reported over $446 million lost in real estate wire fraud in 2023 alone. Criminals monitor real estate transactions and intercept email communications to send fake wire instructions.',
  bullets: [
    'Criminals hack into real estate agent or title company email accounts',
    "They send convincing emails with 'updated' wire instructions",
    "The money is wired to a criminal's account and is nearly impossible to recover",
    'Always call your title company at a number from their official website — not from any email',
  ],
  whyItMatters: 'Texas real estate closings are a prime target. Always verify wire instructions by calling your title company directly using a phone number you find yourself — never from an email. One wrong wire transfer and your entire sale proceeds could be gone with no recovery.',
  fullReportUrl: 'https://www.fbi.gov/scams-and-safety/common-scams-and-crimes/real-estate-wire-fraud',
}

const UTILITIES = [
  { id: 'electric',         label: 'Electric (Oncor, AEP, or your provider)' },
  { id: 'gas',              label: 'Gas (Atmos Energy or your provider)' },
  { id: 'water',            label: 'Water (city utility)' },
  { id: 'internet',         label: 'Internet and cable' },
  { id: 'trash',            label: 'Trash collection' },
  { id: 'hoa-autopay',      label: 'HOA auto-pay (cancel after closing)' },
  { id: 'insurance-cancel', label: "Homeowner's insurance (cancel after closing)" },
]

const CLOSING_DAY_ITEMS = [
  { id: 'cd-photo-id',   label: 'Government issued photo ID',                         badge: 'Must bring',      isMust: true },
  { id: 'cd-keys',       label: 'All keys to the property',                           badge: 'Must bring',      isMust: true },
  { id: 'cd-garage',     label: 'Garage door openers',                                badge: 'Must bring',      isMust: true },
  { id: 'cd-mailbox',    label: 'Mailbox keys',                                       badge: 'Must bring',      isMust: true },
  { id: 'cd-gate',       label: 'Any gate or amenity access cards/fobs',              badge: 'Must bring if HOA', isMust: true },
  { id: 'cd-manuals',    label: 'Appliance manuals and warranties',                   badge: 'Bring if available', isMust: false },
  { id: 'cd-title-docs', label: 'Any remaining documents requested by title company', badge: 'Must bring',      isMust: true },
]

const DOCUMENTS = [
  { id: 'photo-id',       label: "Government issued photo ID (driver's license or passport)", badge: 'Must have',           isMust: true },
  { id: 'survey',         label: 'Property survey',                                           badge: 'Must have',           isMust: true },
  { id: 'hoa-clearance',  label: 'HOA clearance letter (if applicable)',                      badge: 'Must have if HOA',    isMust: true },
  { id: 'payoff-stmt',    label: 'Mortgage payoff statement',                                 badge: 'Must have if financed', isMust: true },
  { id: 'insurance',      label: "Homeowner's insurance cancellation confirmation",           badge: 'Recommended',         isMust: false },
  { id: 'warranties',     label: 'Warranties or manuals for appliances staying with home',    badge: 'Recommended',         isMust: false },
  { id: 'repair-records', label: 'Records of all repairs and improvements made',              badge: 'Recommended',         isMust: false },
  { id: 'utility-accts',  label: 'Utility account numbers for transfer',                      badge: 'Recommended',         isMust: false },
  { id: 'keys',           label: 'Garage door openers, mailbox keys, gate codes',            badge: 'Must have',           isMust: true },
  { id: 'hoa-fobs',       label: 'Any HOA fobs, pool keys, or amenity cards',                badge: 'Must have if HOA',    isMust: true },
]

const NET_PROCEEDS_FIELDS = [
  { field: 'salePrice',          label: 'Sale price ($)',                      placeholder: '', readOnly: true },
  { field: 'mortgagePayoff',     label: 'Mortgage payoff balance ($)',         placeholder: '' },
  { field: 'titleFees',          label: 'Title company fees ($)',              placeholder: '1500' },
  { field: 'propertyTaxes',      label: 'Property taxes owed — prorated ($)', placeholder: '' },
  { field: 'hoaFees',            label: 'HOA fees owed ($)',                   placeholder: '' },
  { field: 'repairCredits',      label: 'Repair credits agreed to ($)',        placeholder: '' },
  { field: 'sellerContribution', label: 'Seller concession — Para 12 ($)',    placeholder: '' },
  { field: 'misc',               label: 'Miscellaneous costs ($)',             placeholder: '' },
]

const CLOSING_DATE_FIELDS = [
  { field: 'contractSigned', label: 'Contract signed' },
  { field: 'optionEnd',      label: 'Option period end' },
  { field: 'appraisal',      label: 'Appraisal date' },
  { field: 'loanApproval',   label: 'Loan approval deadline' },
  { field: 'closingDate',    label: 'Closing date' },
]

function loadStep8() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step8 || {}
  } catch { return {} }
}

function saveStep8(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step8: data }))
    notifyStepDataChange()
  } catch {}
}

function daysUntilDate(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

function loadStep8Overrides() {
  if (typeof window === 'undefined') return { ...NET_PROCEEDS_EMPTY }
  const saved = loadStep8().netProceeds || {}
  return {
    salePrice:          toOverrideString(saved.salePrice),
    mortgagePayoff:     toOverrideString(saved.mortgagePayoff),
    titleFees:          toOverrideString(saved.titleFees),
    propertyTaxes:      toOverrideString(saved.propertyTaxes),
    hoaFees:            toOverrideString(saved.hoaFees),
    repairCredits:      toOverrideString(saved.repairCredits),
    sellerContribution: toOverrideString(saved.sellerContribution),
    misc:               toOverrideString(saved.misc),
  }
}

function toOverrideString(v) {
  if (v === undefined || v === null) return ''
  return String(v)
}

function deriveStep8Defaults(closingDate, salePriceOverride = '') {
  if (typeof window === 'undefined') return { ...NET_PROCEEDS_EMPTY }
  let all = {}
  try { all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}') } catch {}
  const accepted = (all.step6?.offers || []).find(o => o.status === 'Accepted')

  let salePrice = accepted?.price ? String(accepted.price) : ''
  if (!salePrice) {
    try {
      const pe = JSON.parse(localStorage.getItem('fsbo_priceEstimate') || 'null')
      if (pe?.currentEstimate) salePrice = String(pe.currentEstimate)
    } catch {}
  }

  const repairTotal = (all.step7?.repairRequests || []).reduce((sum, r) => {
    if (r.response === 'Decline') return sum
    return sum + (r.response === 'Counter' ? parseFloat(r.counterAmount) || 0 : parseFloat(r.requestedAmount) || 0)
  }, 0)
  const repairCredits = repairTotal > 0 ? String(repairTotal) : ''

  const sellerContribution = accepted?.sellerContribution ? String(accepted.sellerContribution) : ''

  const effectivePriceStr = salePriceOverride !== '' ? salePriceOverride : salePrice
  const priceNum = parseFloat(effectivePriceStr) || 0
  let titleFees = ''
  let propertyTaxes = ''
  if (priceNum > 0) {
    const r = calcNetProceeds({ price: priceNum, closingDate: closingDate || '', titlePolicyOverride: accepted?.titlePolicyOverride }, '')
    if (r) {
      titleFees     = String(Math.round(r.titlePolicy + r.escrow))
      propertyTaxes = String(Math.round(r.taxProration))
    }
  }

  return {
    salePrice,
    mortgagePayoff: '',
    titleFees,
    propertyTaxes,
    hoaFees: '',
    repairCredits,
    sellerContribution,
    misc: '',
  }
}

const AUTOFILLABLE_FIELDS = ['salePrice', 'titleFees', 'propertyTaxes', 'repairCredits', 'sellerContribution']

function initClosingDates() {
  if (typeof window === 'undefined') {
    return { contractSigned: '', optionEnd: '', appraisal: '', loanApproval: '', closingDate: '' }
  }
  const saved = loadStep8().closingDates || {}
  let optionEnd = saved.optionEnd || ''
  if (!optionEnd) {
    try {
      const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
      optionEnd = all.step7?.optionPeriod?.endDate || ''
    } catch {}
  }
  return {
    contractSigned: saved.contractSigned || '',
    optionEnd,
    appraisal:      saved.appraisal      || '',
    loanApproval:   saved.loanApproval   || '',
    closingDate:    saved.closingDate    || '',
  }
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

export {
  ACCENT, PURPLE, DRAWERS,
  TITLE_COMPANIES, TITLE_TIMELINE, PAYOFF_CARDS, SURVEY_OPTIONS,
  PRO_TIPS_CLOSE, VENDORS_CLOSE, WIRE_FRAUD_SOURCE,
  UTILITIES, CLOSING_DAY_ITEMS, DOCUMENTS,
  NET_PROCEEDS_FIELDS, CLOSING_DATE_FIELDS, AUTOFILLABLE_FIELDS,
  loadStep8, saveStep8, daysUntilDate, loadStep8Overrides, deriveStep8Defaults, initClosingDates, inputCls,
}
