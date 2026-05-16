const STORAGE_KEY = 'fsbo_usage'

const LIMITS = {
  'analyze-staging': 3,
  'analyze-photography': 3,
  'compare-photography': 2,
  'generate-listing': 3,
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function getUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: today(), counts: {} }
    const data = JSON.parse(raw)
    if (data.date !== today()) return { date: today(), counts: {} }
    return data
  } catch {
    return { date: today(), counts: {} }
  }
}

function saveUsage(usage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  } catch {}
}

export function canUse(key) {
  const { counts } = getUsage()
  return (counts[key] || 0) < (LIMITS[key] ?? Infinity)
}

export function recordUse(key) {
  const usage = getUsage()
  usage.counts[key] = (usage.counts[key] || 0) + 1
  saveUsage(usage)
}

export function remainingUses(key) {
  const { counts } = getUsage()
  return Math.max(0, (LIMITS[key] || 0) - (counts[key] || 0))
}

export function resetUsage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
