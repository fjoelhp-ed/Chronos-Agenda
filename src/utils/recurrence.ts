import { Activity, RecurrenceRule } from '../types/agenda';

/**
 * Formats a date object to 'YYYY-MM-DD'
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses 'YYYY-MM-DD' into a local Date object (ignoring timezone drift)
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Checks if a date falls on a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Returns human-readable Spanish text for recurrence rule
 */
export function getRecurrenceDescription(rule?: RecurrenceRule): string {
  if (!rule || rule.frequency === 'none') return 'Sin repetición';
  switch (rule.frequency) {
    case 'daily':
      return rule.interval && rule.interval > 1 ? `Cada ${rule.interval} días` : 'Todos los días';
    case 'weekdays':
      return 'Días laborables (Lun - Vie)';
    case 'weekly': {
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const selected = rule.daysOfWeek.map((d) => dayNames[d]).join(', ');
        return `Semanalmente (${selected})`;
      }
      return 'Cada semana';
    }
    case 'biweekly':
      return 'Cada dos semanas';
    case 'monthly':
      return 'Mensualmente';
    case 'yearly':
      return 'Anualmente';
    default:
      return 'Personalizado';
  }
}

/**
 * Checks whether an activity with an optional recurrence rule occurs on a target date.
 */
export function doesActivityOccurOn(activity: Activity, targetDateKey: string): boolean {
  if (activity.date === targetDateKey) return true;
  if (!activity.recurrence || activity.recurrence.frequency === 'none') {
    return false;
  }

  const actDate = parseDateKey(activity.date);
  const targetDate = parseDateKey(targetDateKey);

  // If target date is before the original start date, it doesn't occur
  if (targetDate.getTime() < actDate.getTime()) return false;

  // Check end date if defined
  if (activity.recurrence.endDate) {
    const endDate = parseDateKey(activity.recurrence.endDate);
    if (targetDate.getTime() > endDate.getTime()) return false;
  }

  const { frequency, interval = 1, daysOfWeek } = activity.recurrence;
  const diffDays = Math.round((targetDate.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (frequency) {
    case 'daily': {
      return diffDays % interval === 0;
    }
    case 'weekdays': {
      const day = targetDate.getDay();
      return day >= 1 && day <= 5;
    }
    case 'weekly': {
      if (daysOfWeek && daysOfWeek.length > 0) {
        const targetDay = targetDate.getDay();
        if (!daysOfWeek.includes(targetDay)) return false;
        // interval check in weeks
        const weeksDiff = Math.floor(diffDays / 7);
        return weeksDiff % interval === 0;
      }
      return diffDays % (7 * interval) === 0;
    }
    case 'biweekly': {
      return diffDays % 14 === 0;
    }
    case 'monthly': {
      // Occurs on same day of month
      const dayMatches = targetDate.getDate() === actDate.getDate();
      if (!dayMatches) return false;
      const monthDiff =
        (targetDate.getFullYear() - actDate.getFullYear()) * 12 +
        (targetDate.getMonth() - actDate.getMonth());
      return monthDiff >= 0 && monthDiff % interval === 0;
    }
    case 'yearly': {
      return (
        targetDate.getDate() === actDate.getDate() &&
        targetDate.getMonth() === actDate.getMonth() &&
        (targetDate.getFullYear() - actDate.getFullYear()) % interval === 0
      );
    }
    default:
      return false;
  }
}

/**
 * Returns all activities that occur on a specific date (including virtual recurring instances).
 */
export function getActivitiesForDate(activities: Activity[], dateKey: string): Activity[] {
  return activities
    .filter((act) => doesActivityOccurOn(act, dateKey))
    .map((act) => {
      if (act.date === dateKey) return act;
      // Virtual instance for recurring activity on this date
      return {
        ...act,
        id: `${act.id}_occ_${dateKey}`,
        date: dateKey,
        // Instances inherit parent or can have independent completion
      };
    })
    .sort((a, b) => {
      const timeA = a.startTime || '99:99';
      const timeB = b.startTime || '99:99';
      return timeA.localeCompare(timeB);
    });
}
