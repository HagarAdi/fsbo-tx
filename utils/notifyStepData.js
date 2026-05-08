export function notifyStepDataChange() {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('fsbo_stepdata_changed'))
}
