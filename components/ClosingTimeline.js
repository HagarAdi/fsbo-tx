import { useEffect, useState } from 'react'
import HelpTip from './Tooltip'
import { getOptionPeriodStatusFromStorage } from './steps/Step7Inspection.data'

const PHASES = {
  option:     { color: '#f59e0b', label: 'Option period' },
  processing: { color: '#3b82f6', label: 'Processing' },
  funding:    { color: '#10b981', label: 'Funding' },
}

const PHASE_TINTS = {
  option:     'border-amber-300 bg-amber-50/50',
  processing: 'border-blue-300 bg-blue-50/50',
  funding:    'border-green-300 bg-green-50/50',
}

const PRO_TIPS = [
  {
    seller: 'Allow 10 business days for the payoff statement to arrive — request it the day the contract is executed.',
    title:  'Confirm the title company has the executed contract and earnest money before the third business day.',
    buyer:  'Option Period runs from the Effective Date. Buyer can terminate fee-free until 5:00 PM on the final day.',
  },
  {
    seller: 'If you have a recent T-47 affidavit, your existing survey may save ~$500 — confirm with the title company first.',
    title:  'HOA management companies have up to 10 business days to respond. Order it the moment HOA dues are confirmed.',
    buyer:  'Buyers typically complete inspections within the first 5 days of the Option Period to leave time for repair negotiation.',
  },
  {
    seller: 'You are not obligated to make repairs, but your response is due before the Option Period ends — silence ends the option.',
    title:  'Mechanic and tax liens must be resolved before closing — they can delay funding by days.',
    buyer:  'If the appraisal comes in low, expect a renegotiation request — review TREC Addendum P (Loan Assumption) ahead of time.',
  },
  {
    seller: 'Verify property tax prorations match your county most-recent statement, including any homestead or over-65 cap.',
    title:  'The Closing Disclosure must be delivered to the buyer at least 3 business days before closing — federal TRID rule.',
    buyer:  'Buyers should avoid new credit applications between appraisal and closing — it can re-trigger underwriting.',
  },
  {
    seller: 'Bring a government-issued photo ID and your payoff statement. Confirm wire instructions by phone — never email.',
    title:  'Recording at the county clerk happens after funding; expect 1–2 business days for the deed to appear in public records.',
    buyer:  'Verify your bank wire transfer limits 24 hours in advance — daily caps can delay funding.',
  },
]

const CLOSING_TIMELINE = [
  {
    period: 'Week 1',
    phase: 'option',
    sellerShort: 'Request payoff',
    seller: 'Request payoff statement from your lender',
    titleShort: 'Open escrow',
    title: 'Order title search and open escrow account',
    buyerShort: 'Option period',
    buyer: 'Option period begins — 10 days to inspect',
  },
  {
    period: 'Week 1–2',
    phase: 'processing',
    sellerShort: 'Order survey',
    seller: 'Schedule survey if required by the contract',
    titleShort: 'HOA estoppel',
    title: 'Send HOA estoppel letter request (if applicable)',
    buyerShort: 'Inspections',
    buyer: 'Complete inspections; submit any repair requests',
  },
  {
    period: 'Week 2–3',
    phase: 'processing',
    sellerShort: 'Repair response',
    seller: 'Respond to buyer repair requests before Option Period ends',
    titleShort: 'Clear liens',
    title: 'Clear liens; coordinate payoff with your lender',
    buyerShort: 'Appraisal & loan',
    buyer: 'Lender orders appraisal; loan processing begins',
  },
  {
    period: 'Week 3',
    phase: 'processing',
    sellerShort: 'Review CD',
    seller: 'Review closing disclosure for accuracy',
    titleShort: 'Deliver CD',
    title: 'Prepare and deliver closing disclosure (3 days before closing)',
    buyerShort: 'Clear to close',
    buyer: 'Underwriting review; final loan approval (clear to close)',
  },
  {
    period: 'Closing day',
    phase: 'funding',
    sellerShort: 'Sign & hand keys',
    seller: 'Sign documents and hand over keys',
    titleShort: 'Record & wire',
    title: 'Record deed with county; wire net proceeds to you',
    buyerShort: 'Walk & fund',
    buyer: 'Final walkthrough; wire closing funds to escrow',
  },
]

function getCurrentWeekIndex(daysToClose) {
  if (typeof daysToClose !== 'number' || Number.isNaN(daysToClose)) return -1
  if (daysToClose > 21) return 0
  if (daysToClose > 14) return 1
  if (daysToClose > 7)  return 2
  if (daysToClose > 0)  return 3
  return 4
}

export default function ClosingTimeline({ daysToClose }) {
  const currentWeekIdx = getCurrentWeekIndex(daysToClose)
  const hasCurrent = currentWeekIdx !== -1
  const currentPhase = hasCurrent ? CLOSING_TIMELINE[currentWeekIdx].phase : null

  const [activeTooltip, setActiveTooltip] = useState(null)
  const [optionStatus, setOptionStatus] = useState({ hasDates: false, isActive: false, daysRemaining: null, hoursRemaining: null })
  useEffect(() => { setOptionStatus(getOptionPeriodStatusFromStorage()) }, [daysToClose])

  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-2">
      <style>{`@keyframes ct-pulse-ring {
        0%   { box-shadow: 0 0 0 0    rgba(22,163,74,0.55); }
        70%  { box-shadow: 0 0 0 14px rgba(22,163,74,0); }
        100% { box-shadow: 0 0 0 0    rgba(22,163,74,0); }
      }`}</style>

      <div className="flex items-center gap-3 mb-3 text-[11px] font-medium text-gray-600 px-1">
        {Object.entries(PHASES).map(([key, { color, label }]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            {label}
          </span>
        ))}
      </div>

      {hasCurrent && (
        <span className="sr-only">
          Current phase: {PHASES[currentPhase].label}. This week&apos;s tasks are highlighted.
        </span>
      )}

      <ol
        role="list"
        aria-label="Closing timeline by week"
        className="relative grid grid-cols-5 gap-2"
        style={{ minWidth: 760 }}
      >
        <div aria-hidden className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 flex pointer-events-none">
          {CLOSING_TIMELINE.slice(0, 4).map((_, i) => {
            const segPhase = CLOSING_TIMELINE[i + 1].phase
            return <div key={i} className="flex-1 h-1" style={{ backgroundColor: PHASES[segPhase].color }} />
          })}
        </div>

        {CLOSING_TIMELINE.map((row, i) => {
          const phase = PHASES[row.phase]
          const isCurrent = i === currentWeekIdx
          const cardCls = isCurrent
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-white'
          return (
            <li key={i} role="listitem" className="relative flex flex-col items-center">

              <div className={`w-full rounded-xl border px-3 py-3 mb-2 text-left ${cardCls}`}>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">You</p>
                <p className="text-xs font-bold text-gray-900 leading-snug">{row.sellerShort}</p>
                <p className="text-[11px] text-gray-600 leading-snug mt-1">{row.seller}</p>
              </div>

              <div aria-hidden className="w-px h-2 bg-gray-300" />

              <div
                aria-current={isCurrent ? 'true' : undefined}
                className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ring-4 ring-white"
                style={{
                  backgroundColor: phase.color,
                  animation: isCurrent ? 'ct-pulse-ring 1.8s ease-out infinite' : undefined,
                }}
              >
                {i + 1}
                {isCurrent && <span className="sr-only">You are here. </span>}
              </div>

              <span className="mt-1 text-[11px] font-semibold text-gray-700 whitespace-nowrap">{row.period}</span>

              <div aria-hidden className="w-px h-2 bg-gray-300" />

              <div className={`w-full rounded-xl border px-3 py-3 mt-1 text-left ${cardCls}`}>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">Title co.</p>
                <p className="text-xs font-bold text-gray-800 leading-snug">{row.titleShort}</p>
                <p className="text-[11px] text-gray-600 leading-snug mt-1">{row.title}</p>
              </div>

              <div className={`w-full rounded-xl border px-3 py-3 mt-2 text-left ${cardCls}`}>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">Buyer</p>
                <p className="text-xs font-bold italic text-gray-700 leading-snug">{row.buyerShort}</p>
                <p className="text-[11px] italic text-gray-500 leading-snug mt-1">{row.buyer}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
