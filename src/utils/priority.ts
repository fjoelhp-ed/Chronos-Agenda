import { Activity, Priority, SortCriterion } from '../types/agenda';

export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

/**
 * Returns numeric weight for priority comparison
 */
export function getPriorityWeight(priority: Priority): number {
  return PRIORITY_WEIGHTS[priority] ?? 2;
}

/**
 * Sorts activities based on specified criterion and order
 */
export function sortActivities(
  activities: Activity[],
  sortBy: SortCriterion,
  ascending = false
): Activity[] {
  const sorted = [...activities].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const weightA = getPriorityWeight(a.priority);
        const weightB = getPriorityWeight(b.priority);
        // By default, high priority first (descending)
        const diff = weightB - weightA;
        if (diff !== 0) return ascending ? -diff : diff;
        // Secondary sort by time
        const timeA = a.startTime || '99:99';
        const timeB = b.startTime || '99:99';
        return timeA.localeCompare(timeB);
      }
      case 'time': {
        const timeA = a.startTime || '99:99';
        const timeB = b.startTime || '99:99';
        const diff = timeA.localeCompare(timeB);
        return ascending ? diff : -diff;
      }
      case 'title': {
        const diff = a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
        return ascending ? diff : -diff;
      }
      case 'completed': {
        const compA = a.completed ? 1 : 0;
        const compB = b.completed ? 1 : 0;
        const diff = compA - compB;
        return ascending ? diff : -diff;
      }
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Returns Tailwind classes for priority badge tags
 */
export function getPriorityBadgeClasses(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 shadow-xs';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 shadow-xs';
    case 'low':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

/**
 * Returns border highlight styling for activities in dashboard & calendar
 */
export function getPriorityBorderHighlight(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-rose-500';
    case 'medium':
      return 'border-l-4 border-l-amber-500';
    case 'low':
    default:
      return 'border-l-4 border-l-slate-400 dark:border-l-slate-600';
  }
}
