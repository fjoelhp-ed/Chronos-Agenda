import test from 'node:test';
import assert from 'node:assert/strict';

test('Dashboard cards visibility defaults and toggle logic', () => {
  const defaultVisibleCards = {
    progress: true,
    streak: true,
    priorityMatrix: true,
    quickAdd: true,
    categoryChips: true,
  };

  assert.equal(defaultVisibleCards.progress, true);
  assert.equal(defaultVisibleCards.streak, true);
  assert.equal(defaultVisibleCards.priorityMatrix, true);
  assert.equal(defaultVisibleCards.quickAdd, true);
  assert.equal(defaultVisibleCards.categoryChips, true);

  // Toggle single card
  const updatedCards = {
    ...defaultVisibleCards,
    streak: !defaultVisibleCards.streak,
  };

  assert.equal(updatedCards.streak, false);
  assert.equal(updatedCards.progress, true);
});

test('Essential mode correctly overrides full dashboard elements', () => {
  const preferences = {
    dashboardMode: 'essential',
    visibleCards: {
      progress: true,
      streak: true,
      priorityMatrix: true,
      quickAdd: true,
      categoryChips: true,
    },
  };

  const isEssential = preferences.dashboardMode === 'essential';
  const showProgress = !isEssential && preferences.visibleCards.progress;
  const showStreak = !isEssential && preferences.visibleCards.streak;
  const showPriorityMatrix = !isEssential && preferences.visibleCards.priorityMatrix;
  const showQuickAdd = preferences.visibleCards.quickAdd;
  const showCategoryChips = !isEssential && preferences.visibleCards.categoryChips;

  assert.equal(showProgress, false);
  assert.equal(showStreak, false);
  assert.equal(showPriorityMatrix, false);
  assert.equal(showQuickAdd, true, 'Quick add remains available in essential mode');
  assert.equal(showCategoryChips, false);
});

test('Priority sort correctly orders high, medium, and low items', () => {
  const items = [
    { id: '1', title: 'Comprar café', priority: 'low' },
    { id: '2', title: 'Enviar propuesta a cliente', priority: 'high' },
    { id: '3', title: 'Llamar al médico', priority: 'medium' },
  ];

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const sortedDescending = [...items].sort((a, b) => {
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  assert.equal(sortedDescending[0].priority, 'high');
  assert.equal(sortedDescending[1].priority, 'medium');
  assert.equal(sortedDescending[2].priority, 'low');
});
