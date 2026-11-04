import test from 'node:test';
import assert from 'node:assert/strict';
import { sortActivities, getPriorityWeight } from './priority';
import { Activity } from '../types/agenda';

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Comprar leche',
    type: 'task',
    date: '2026-11-01',
    startTime: '14:00',
    completed: false,
    priority: 'low',
    categoryId: 'personal',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    title: 'Entrega final de proyecto',
    type: 'task',
    date: '2026-11-01',
    startTime: '10:00',
    completed: false,
    priority: 'high',
    categoryId: 'work',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    title: 'Revisión intermedia',
    type: 'task',
    date: '2026-11-01',
    startTime: '11:00',
    completed: false,
    priority: 'medium',
    categoryId: 'work',
    createdAt: '',
    updatedAt: '',
  },
];

test('getPriorityWeight returns correct hierarchy', () => {
  assert.ok(getPriorityWeight('high') > getPriorityWeight('medium'));
  assert.ok(getPriorityWeight('medium') > getPriorityWeight('low'));
});

test('sortActivities sorts by priority high to low by default', () => {
  const sorted = sortActivities(mockActivities, 'priority', false);
  assert.equal(sorted[0].id, '2'); // high
  assert.equal(sorted[1].id, '3'); // medium
  assert.equal(sorted[2].id, '1'); // low
});

test('sortActivities sorts by time ascending', () => {
  const sorted = sortActivities(mockActivities, 'time', true);
  assert.equal(sorted[0].startTime, '10:00');
  assert.equal(sorted[1].startTime, '11:00');
  assert.equal(sorted[2].startTime, '14:00');
});
