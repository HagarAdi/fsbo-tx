const ACCENT = '#16a34a'
const PURPLE = '#7c3aed'

const DRAWERS = [
  { id: 'walkthrough', emoji: '📋', label: 'Final Walkthrough' },
  { id: 'forever',     emoji: '📁', label: 'Keep Forever' },
  { id: 'taxes',       emoji: '💰', label: 'Tax Notes' },
]

const WALKTHROUGH_BUYER = [
  'Agreed repairs are completed',
  'Home is in same condition as when offer was made',
  'All included appliances and fixtures are still there',
  'No new damage since inspection',
]

const WALKTHROUGH_SELLER = [
  { id: 'complete-repairs',  label: 'Complete ALL agreed repairs',                            badge: 'Must do',                 isMust: true },
  { id: 'remove-belongings', label: 'Remove every personal belonging',                        badge: 'Must do',                 isMust: true },
  { id: 'broom-clean',       label: 'Leave home broom clean',                                 badge: 'Must do',                 isMust: true },
  { id: 'leave-keys',        label: 'Leave all keys, garage openers, mailbox keys in home',   badge: 'Must do',                 isMust: true },
  { id: 'leave-manuals',     label: 'Leave all appliance manuals and warranties',             badge: 'Recommended',             isMust: false },
  { id: 'lights-thermostat', label: 'Turn off all lights, set thermostat to reasonable temp', badge: 'Recommended',             isMust: false },
  { id: 'utility-note',      label: 'Leave a note with utility account numbers',              badge: 'Recommended (nice touch)', isMust: false },
]

const CLOSING_TIMELINE = [
  { emoji: '🪪', title: 'Arrive',  detail: 'Bring your government ID. Closing takes 1–2 hours. Title company staff will guide you through everything.' },
  { emoji: '✍️', title: 'Signing', detail: "You'll sign 50–100 pages. Don't panic — most are standard forms. Title company explains each one." },
  { emoji: '🔑', title: 'Keys',    detail: 'Hand over all keys, garage openers, mailbox keys, gate codes, HOA fobs.' },
  { emoji: '💸', title: 'Funds',   detail: 'Your net proceeds wire to your bank account — same day or next morning depending on time of closing.' },
  { emoji: '🎉', title: 'Done',    detail: 'You are no longer the homeowner. Congratulations!' },
]

const AFTER_CLOSING = [
  { id: 'cancel-insurance', label: "Cancel or transfer homeowner's insurance",    timeframe: 'Today' },
  { id: 'usps-forward',     label: 'Submit USPS mail forwarding (usps.com/move)', timeframe: 'Today' },
  { id: 'cancel-utilities', label: 'Cancel utilities at old address',             timeframe: 'Today or next day' },
  { id: 'bank-address',     label: 'Notify your bank of address change',          timeframe: 'This week' },
  { id: 'employer-address', label: 'Notify your employer of address change',      timeframe: 'This week' },
  { id: 'irs-8822',         label: 'Notify IRS (file Form 8822)',                 timeframe: 'This month' },
  { id: 'keep-docs',        label: 'Keep all closing documents in a safe place',  timeframe: 'Forever' },
]

const KEEP_FOREVER = [
  { doc: 'Closing Disclosure',       why: 'Shows exact sale price, costs, and net proceeds. Needed for tax filing.' },
  { doc: 'Deed',                     why: "Proof of transfer. Keep even though it's recorded publicly." },
  { doc: 'Title Insurance Policy',   why: 'Protects you if ownership disputes arise later.' },
  { doc: 'All repair receipts',      why: 'Adds to your cost basis, reduces capital gains.' },
  { doc: 'Inspection report',        why: 'Keep for your records.' },
  { doc: 'All contracts and addendums', why: 'Complete transaction record.' },
]

const TAX_CARDS = [
  'If you lived in this home for 2 of the last 5 years, up to $250,000 of profit is tax-free ($500,000 if married filing jointly)',
  'Your profit = sale price minus your original purchase price minus capital improvements',
  'Keep all receipts for improvements — they reduce your taxable gain',
  'Consult a CPA for your specific situation — this is general information only',
]

const CONFETTI_COLORS = ['#7c3aed', '#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#f97316']

const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 2.5) % 100}%`,
  delay: `${((i * 0.17) % 3).toFixed(2)}s`,
  duration: `${(2.5 + (i % 5) * 0.4).toFixed(1)}s`,
  size: 8 + (i % 4) * 4,
  isCircle: i % 3 === 0,
}))

function loadStep9() {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    return all.step9 || {}
  } catch { return {} }
}

function saveStep9(data) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    localStorage.setItem('fsbo_stepData', JSON.stringify({ ...all, step9: data }))
  } catch {}
}

function fmtMoney(n) {
  return '$' + Math.round(n).toLocaleString()
}

function getSalePrice(priceEstimate) {
  try {
    const all = JSON.parse(localStorage.getItem('fsbo_stepData') || '{}')
    const sp = parseFloat(all.step8?.netProceeds?.salePrice)
    if (sp > 0) return sp
  } catch {}
  return priceEstimate?.currentEstimate || 0
}

export {
  ACCENT, PURPLE, DRAWERS,
  WALKTHROUGH_BUYER, WALKTHROUGH_SELLER,
  CLOSING_TIMELINE, AFTER_CLOSING, KEEP_FOREVER, TAX_CARDS,
  CONFETTI_COLORS, CONFETTI_PIECES,
  loadStep9, saveStep9, fmtMoney, getSalePrice,
}
