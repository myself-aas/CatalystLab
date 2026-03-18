const TRIAL_KEY = 'nl_trial'
const FREE_LIMIT = 5

interface TrialData {
  date: string    // ISO date string YYYY-MM-DD
  count: number   // runs used today
  plan: 'free' | 'researcher' | 'labpro' | 'institution'
}

export function getTrialData(): TrialData {
  if (typeof window === 'undefined') return { date: '', count: 0, plan: 'free' }
  const today = new Date().toISOString().split('T')[0]
  const raw = localStorage.getItem(TRIAL_KEY)
  if (!raw) return { date: today, count: 0, plan: 'free' }
  const data: TrialData = JSON.parse(raw)
  // Reset count if new day
  if (data.date !== today) return { date: today, count: 0, plan: data.plan }
  return data
}

export function canRunInstrument(): boolean {
  const data = getTrialData()
  if (data.plan !== 'free') return true
  return data.count < FREE_LIMIT
}

export function recordRun(): void {
  const data = getTrialData()
  localStorage.setItem(TRIAL_KEY, JSON.stringify({
    ...data,
    count: data.count + 1,
  }))
}

export function getRemainingRuns(): number {
  const data = getTrialData()
  if (data.plan !== 'free') return Infinity
  return Math.max(0, FREE_LIMIT - data.count)
}

export function setPlan(plan: TrialData['plan']): void {
  const data = getTrialData()
  localStorage.setItem(TRIAL_KEY, JSON.stringify({ ...data, plan }))
}

export function getTimeUntilReset(): string {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${h}h ${m}m ${s}s`
}
