import test from 'node:test';
import assert from 'node:assert/strict';
import { exportToCSV, exportToJSON, parseAndValidateJSON, parseCSV } from './exportImport';
import { Activity, Category } from '../types/agenda';

const testCategories: Category[] = [
  { id: 'work', name: 'Trabajo & Proyectos', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal & Salud', color: '#10b981', icon: 'Heart' },
];

const testActivities: Activity[] = [
  {
    id: 'act-1',
    title: 'Revisión de metas Q4',
    description: 'Revisar KPIs trimestrales con el equipo.',
    type: 'event',
    date: '2026-11-02',
    startTime: '10:00',
    endTime: '11:00',
    completed: true,
    priority: 'high',
    categoryId: 'work',
    recurrence: { frequency: 'none' },
    reminderMinutesBefore: 15,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
];

test('exportToJSON and parseAndValidateJSON roundtrip successfully', () => {
  const jsonStr = exportToJSON(testActivities, testCategories);
  assert.ok(jsonStr.includes('Revisión de metas Q4'));

  const parsed = parseAndValidateJSON(jsonStr);
  assert.equal(parsed.activities.length, 1);
  assert.equal(parsed.activities[0].title, 'Revisión de metas Q4');
  assert.equal(parsed.activities[0].completed, true);
  assert.equal(parsed.categories?.length, 2);
});

test('exportToCSV generates valid RFC 4180 CSV with category names', () => {
  const csv = exportToCSV(testActivities, testCategories);
  assert.ok(csv.includes('Titulo,Tipo,Fecha'));
  assert.ok(csv.includes('Revisión de metas Q4'));
  assert.ok(csv.includes('Trabajo & Proyectos'));

  const parsedActivities = parseCSV(csv);
  assert.equal(parsedActivities.length, 1);
  assert.equal(parsedActivities[0].title, 'Revisión de metas Q4');
});
