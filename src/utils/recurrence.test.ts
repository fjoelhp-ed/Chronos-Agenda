import test from 'node:test';
import assert from 'node:assert/strict';
import { doesActivityOccurOn, getActivitiesForDate, formatDateKey } from './recurrence';
import { Activity } from '../types/agenda';

const baseActivity: Activity = {
  id: 'act-1',
  title: 'Daily Standup',
  type: 'event',
  date: '2026-11-01',
  startTime: '09:00',
  endTime: '09:30',
  completed: false,
  priority: 'high',
  categoryId: 'work',
  createdAt: '2026-11-01T08:00:00Z',
  updatedAt: '2026-11-01T08:00:00Z',
};

test('doesActivityOccurOn identifies daily recurring events', () => {
  const dailyAct: Activity = {
    ...baseActivity,
    recurrence: { frequency: 'daily', interval: 1 },
  };

  assert.equal(doesActivityOccurOn(dailyAct, '2026-11-01'), true);
  assert.equal(doesActivityOccurOn(dailyAct, '2026-11-02'), true);
  assert.equal(doesActivityOccurOn(dailyAct, '2026-11-15'), true);
  assert.equal(doesActivityOccurOn(dailyAct, '2026-10-31'), false, 'Cannot occur before start date');
});

test('doesActivityOccurOn identifies weekdays only', () => {
  const weekdayAct: Activity = {
    ...baseActivity,
    date: '2026-11-02', // Monday
    recurrence: { frequency: 'weekdays' },
  };

  // 2026-11-02 is Monday (weekday)
  assert.equal(doesActivityOccurOn(weekdayAct, '2026-11-02'), true);
  // 2026-11-06 is Friday (weekday)
  assert.equal(doesActivityOccurOn(weekdayAct, '2026-11-06'), true);
  // 2026-11-07 is Saturday (weekend)
  assert.equal(doesActivityOccurOn(weekdayAct, '2026-11-07'), false);
  // 2026-11-08 is Sunday (weekend)
  assert.equal(doesActivityOccurOn(weekdayAct, '2026-11-08'), false);
});

test('getActivitiesForDate generates virtual occurrences and sorts by time', () => {
  const list: Activity[] = [
    { ...baseActivity, id: 'a1', startTime: '14:00', recurrence: { frequency: 'daily' } },
    { ...baseActivity, id: 'a2', startTime: '09:00', recurrence: { frequency: 'daily' } },
  ];

  const results = getActivitiesForDate(list, '2026-11-05');
  assert.equal(results.length, 2);
  assert.equal(results[0].startTime, '09:00', 'Earlier event must come first');
  assert.equal(results[1].startTime, '14:00');
  assert.ok(results[0].id.includes('occ_2026-11-05'));
});
