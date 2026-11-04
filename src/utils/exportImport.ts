import { Activity, Category } from '../types/agenda';

export interface AgendaExportData {
  version: string;
  exportedAt: string;
  activities: Activity[];
  categories: Category[];
}

/**
 * Escapes a CSV cell according to RFC 4180
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports activities and categories to RFC 4180 CSV string
 */
export function exportToCSV(activities: Activity[], categories: Category[]): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    'ID',
    'Titulo',
    'Tipo',
    'Fecha',
    'HoraInicio',
    'HoraFin',
    'Completada',
    'Prioridad',
    'Categoria',
    'FrecuenciaRecurrencia',
    'RecordatorioMinutos',
    'Descripcion',
  ];

  const rows = activities.map((act) => [
    act.id,
    act.title,
    act.type,
    act.date,
    act.startTime || '',
    act.endTime || '',
    act.completed ? 'SI' : 'NO',
    act.priority,
    categoryMap.get(act.categoryId) || act.categoryId,
    act.recurrence?.frequency || 'none',
    act.reminderMinutesBefore ?? '',
    act.description || '',
  ]);

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];

  return csvLines.join('\r\n');
}

/**
 * Exports full backup to formatted JSON string
 */
export function exportToJSON(activities: Activity[], categories: Category[]): string {
  const payload: AgendaExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    activities,
    categories,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses and validates an imported JSON backup
 */
export function parseAndValidateJSON(jsonString: string): { activities: Activity[]; categories?: Category[] } {
  const data = JSON.parse(jsonString);
  if (!data || typeof data !== 'object') {
    throw new Error('El archivo JSON no contiene un objeto válido');
  }

  const rawActivities = Array.isArray(data.activities) ? data.activities : Array.isArray(data) ? data : null;
  if (!rawActivities) {
    throw new Error('No se encontraron actividades válidas en el archivo JSON');
  }

  const validActivities: Activity[] = rawActivities.map((item: any, idx: number) => {
    if (!item.title || typeof item.title !== 'string') {
      throw new Error(`Actividad #${idx + 1} no tiene un título válido`);
    }
    return {
      id: item.id || `imp_${Date.now()}_${idx}`,
      title: item.title,
      description: item.description || '',
      type: ['task', 'event', 'reminder'].includes(item.type) ? item.type : 'task',
      date: item.date || new Date().toISOString().slice(0, 10),
      startTime: item.startTime,
      endTime: item.endTime,
      completed: Boolean(item.completed),
      completedAt: item.completedAt,
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
      categoryId: item.categoryId || 'personal',
      recurrence: item.recurrence,
      reminderMinutesBefore: typeof item.reminderMinutesBefore === 'number' ? item.reminderMinutesBefore : 15,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const categories = Array.isArray(data.categories) ? data.categories : undefined;
  return { activities: validActivities, categories };
}

/**
 * Parses basic CSV format back into activities
 */
export function parseCSV(csvContent: string): Partial<Activity>[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const activities: Partial<Activity>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parser supporting quotes
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        if (inQuotes && line[charIndex + 1] === '"') {
          cur += '"';
          charIndex++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim());

    if (cells.length >= 2 && cells[1]) {
      activities.push({
        id: cells[0] || `csv_${Date.now()}_${i}`,
        title: cells[1],
        type: (cells[2] as any) || 'task',
        date: cells[3] || new Date().toISOString().slice(0, 10),
        startTime: cells[4] || undefined,
        endTime: cells[5] || undefined,
        completed: cells[6]?.toUpperCase() === 'SI' || cells[6]?.toUpperCase() === 'TRUE',
        priority: (['low', 'medium', 'high'].includes(cells[7]) ? cells[7] : 'medium') as any,
        categoryId: 'personal',
        description: cells[11] || '',
      });
    }
  }

  return activities;
}
