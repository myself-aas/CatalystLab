/**
 * Pure helper functions for trail card data formatting and transformation
 */

/**
 * Format total duration in minutes to user-friendly "Xh Ym" string format
 * @param totalMinutes duration in minutes
 * @returns formatted string, e.g. "2h 45m" or "0h 30m"
 */
export const formatDuration = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Format distance in kilometers to user-friendly string
 * @param distanceKm distance in km
 * @param unit target unit ('km' | 'mi')
 * @returns formatted distance string, e.g. "14.2km"
 */
export const formatDistance = (distanceKm: number, unit: 'km' | 'mi' = 'km'): string => {
  if (isNaN(distanceKm) || distanceKm < 0) return `0${unit}`;
  if (unit === 'mi') {
    const miles = (distanceKm * 0.621371).toFixed(1);
    return `${miles}mi`;
  }
  const km = distanceKm % 1 === 0 ? distanceKm.toFixed(0) : distanceKm.toFixed(1);
  return `${km}km`;
};

/**
 * Format elevation gain in meters to user-friendly string
 * @param elevationMeters elevation in meters
 * @param unit target unit ('m' | 'ft')
 * @returns formatted elevation string, e.g. "820m"
 */
export const formatElevation = (elevationMeters: number, unit: 'm' | 'ft' = 'm'): string => {
  if (isNaN(elevationMeters) || elevationMeters < 0) return `0${unit}`;
  if (unit === 'ft') {
    const feet = Math.round(elevationMeters * 3.28084);
    return `${feet}ft`;
  }
  return `${Math.round(elevationMeters)}m`;
};

/**
 * Return semantic color and style tokens for difficulty levels
 */
export const getDifficultyTheme = (difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert') => {
  switch (difficulty) {
    case 'Easy':
      return {
        label: 'Easy',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10 border-emerald-500/30',
        dotColor: 'bg-emerald-400',
        badgeBorder: 'border-emerald-500/40',
      };
    case 'Moderate':
      return {
        label: 'Moderate',
        colorClass: 'text-cyan-400',
        bgClass: 'bg-cyan-500/10 border-cyan-500/30',
        dotColor: 'bg-cyan-400',
        badgeBorder: 'border-cyan-500/40',
      };
    case 'Hard':
      return {
        label: 'Hard',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10 border-amber-500/30',
        dotColor: 'bg-amber-400',
        badgeBorder: 'border-amber-500/40',
      };
    case 'Expert':
      return {
        label: 'Expert',
        colorClass: 'text-rose-400',
        bgClass: 'bg-rose-500/10 border-rose-500/30',
        dotColor: 'bg-rose-400',
        badgeBorder: 'border-rose-500/40',
      };
    default:
      return {
        label: difficulty,
        colorClass: 'text-slate-300',
        bgClass: 'bg-slate-800 border-slate-700',
        dotColor: 'bg-slate-400',
        badgeBorder: 'border-slate-700',
      };
  }
};
