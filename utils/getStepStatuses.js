const STEP2_MUST_FIX = ['patch-walls', 'bulbs', 'recaulk', 'faucets', 'hvac', 'smoke', 'gfci', 'handrail']
const STEP3_HIGH = ['mow-lawn', 'clean-walkway', 'remove-photos', 'clear-countertops', 'deep-clean', 'clean-windows', 'maximize-light']
const STEP8_DOC_COUNT = 10
const STEP9_MUST = ['complete-repairs', 'remove-belongings', 'broom-clean', 'leave-keys']

export function getStepStatuses(stepData = {}) {
  const s = stepData

  const step1 = s.step1 || {}
  const comps = Array.isArray(step1.comps) ? step1.comps : []
  const s1partial = !!(step1.sqft || step1.condition)
  const s1complete = comps.some(c => c.price && String(c.price).trim() !== '')

  const step2 = s.step2 || {}
  const checked2 = Array.isArray(step2.checkedItems) ? step2.checkedItems : []
  const s2partial = checked2.length > 0
  const s2complete = STEP2_MUST_FIX.every(id => checked2.includes(id))

  const step3 = s.step3 || {}
  const checked3 = Array.isArray(step3.checkedItems) ? step3.checkedItems : []
  const s3partial = checked3.length > 0
  const s3complete = STEP3_HIGH.every(id => checked3.includes(id))

  const step4 = s.step4 || {}
  const rooms = Array.isArray(step4.uploadedRooms) ? step4.uploadedRooms : []
  const desc = step4.listingDetails?.description || ''
  const s4partial = rooms.length > 0 || desc.length > 0
  const s4complete = rooms.length > 0 && desc.length > 0

  const step5 = s.step5 || {}
  const tc5 = step5.titleCompany || {}
  const s5partial = !!(step5.yardSignPhone || step5.virtualTourUrl || step5.showingMethod || tc5.name)
  const s5complete = !!(step5.showingMethod && tc5.name)

  const step6 = s.step6 || {}
  const offers = Array.isArray(step6.offers) ? step6.offers : []
  const s6partial = offers.length > 0
  const s6complete = offers.some(o => o.status === 'Accepted')

  const step7 = s.step7 || {}
  const op = step7.optionPeriod || {}
  const s7partial = !!(op.startDate)
  const s7complete = step7.isLocked === true

  const step8 = s.step8 || {}
  const docs8 = Array.isArray(step8.documentsChecked) ? step8.documentsChecked : []
  const s8partial = step8.titleOpened === true
  const s8complete = !!(step8.titleOpened && step8.surveyConfirmed && step8.wireFraudAcknowledged && docs8.length === STEP8_DOC_COUNT)

  const step9 = s.step9 || {}
  const wc = Array.isArray(step9.walkthroughChecked) ? step9.walkthroughChecked : []
  const s9partial = wc.length > 0
  const s9complete = STEP9_MUST.every(id => wc.includes(id))

  function status(partial, complete) {
    if (complete) return 'complete'
    if (partial) return 'partial'
    return 'none'
  }

  return {
    1: status(s1partial, s1complete),
    2: status(s2partial, s2complete),
    3: status(s3partial, s3complete),
    4: status(s4partial, s4complete),
    5: status(s5partial, s5complete),
    6: status(s6partial, s6complete),
    7: status(s7partial, s7complete),
    8: status(s8partial, s8complete),
    9: status(s9partial, s9complete),
  }
}
