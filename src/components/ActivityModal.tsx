import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  Repeat,
  Bell,
  Sparkles,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { Activity, ActivityType, Priority, RecurrenceFrequency } from '../types/agenda';
import { createGoogleCalendarEvent, getGoogleAccessToken } from '../services/googleCalendar';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetDate?: string;
  initialActivity?: Activity | null;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  presetDate,
  initialActivity,
}) => {
  const { categories, addActivity, updateActivity, addCategory, selectedDate } = useAgenda();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActivityType>('task');
  const [date, setDate] = useState(presetDate || selectedDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'work');
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderOffset, setReminderOffset] = useState<number>(15);
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Category inline creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title);
      setDescription(initialActivity.description || '');
      setType(initialActivity.type);
      setDate(initialActivity.date);
      setStartTime(initialActivity.startTime || '10:00');
      setEndTime(initialActivity.endTime || '11:00');
      setPriority(initialActivity.priority);
      setCategoryId(initialActivity.categoryId);
      setRecurrenceFreq(initialActivity.recurrence?.frequency || 'none');
      setRecurrenceInterval(initialActivity.recurrence?.interval || 1);
      setSelectedDaysOfWeek(initialActivity.recurrence?.daysOfWeek || [1]);
      setReminderOffset(initialActivity.reminderMinutesBefore ?? 15);
    } else {
      setTitle('');
      setDescription('');
      setType('task');
      setDate(presetDate || selectedDate);
      setStartTime('10:00');
      setEndTime('11:00');
      setPriority('medium');
      setCategoryId(categories[0]?.id || 'work');
      setRecurrenceFreq('none');
      setRecurrenceInterval(1);
      setReminderOffset(15);
    }
    setError(null);
  }, [initialActivity, presetDate, selectedDate, isOpen, categories]);

  if (!isOpen) return null;

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const created = await addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag',
    });
    setCategoryId(created.id);
    setIsCreatingCategory(false);
    setNewCatName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor indica un título para la actividad');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const recurrenceRule =
        recurrenceFreq !== 'none'
          ? {
              frequency: recurrenceFreq,
              interval: recurrenceInterval,
              daysOfWeek: recurrenceFreq === 'weekly' ? selectedDaysOfWeek : undefined,
            }
          : undefined;

      const actData = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        date,
        startTime: startTime || undefined,
        endTime: type === 'event' ? endTime || undefined : undefined,
        completed: false,
        priority,
        categoryId,
        recurrence: recurrenceRule,
        reminderMinutesBefore: reminderOffset,
      };

      let createdAct: Activity;
      if (initialActivity) {
        await updateActivity(initialActivity.id, actData);
        createdAct = { ...initialActivity, ...actData };
      } else {
        createdAct = await addActivity(actData);
      }

      // If user toggled sync with Google Calendar
      if (syncWithGoogle) {
        try {
          const token = await getGoogleAccessToken();
          if (token) {
            const googleId = await createGoogleCalendarEvent(createdAct);
            await updateActivity(createdAct.id, {
              googleEventId: googleId,
              isSyncedWithGoogle: true,
            });
          }
        } catch (syncErr: any) {
          console.warn('Google Calendar sync skipped/error:', syncErr?.message);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    if (selectedDaysOfWeek.includes(day)) {
      if (selectedDaysOfWeek.length > 1) {
        setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== day));
      }
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, day].sort());
    }
  };

  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialActivity ? 'Editar Actividad' : 'Nueva Actividad o Recordatorio'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Activity Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tipo de Actividad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'task', label: 'Tarea' },
                { id: 'event', label: 'Evento' },
                { id: 'reminder', label: 'Recordatorio' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as ActivityType)}
                  className={`py-2 text-xs rounded-xl border text-center font-medium transition ${
                    type === t.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Título *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Revisión trimestral de objetivos"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Descripción o notas (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles, enlaces o puntos clave..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {type === 'event' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="low">Baja (Opcional)</option>
                <option value="medium">Media (Estándar)</option>
                <option value="high">Alta (Urgente)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Categoría
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  + Nueva Etiqueta
                </button>
              </div>

              {isCreatingCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nombre..."
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                Repetición / Tarea Recurrente
              </label>
            </div>
            <select
              value={recurrenceFreq}
              onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFrequency)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="none">Sin repetición</option>
              <option value="daily">Todos los días</option>
              <option value="weekdays">Días laborables (Lunes a Viernes)</option>
              <option value="weekly">Semanalmente</option>
              <option value="biweekly">Cada dos semanas</option>
              <option value="monthly">Mensualmente</option>
              <option value="yearly">Anualmente</option>
            </select>

            {recurrenceFreq === 'weekly' && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-1.5">
                  Días que se repite:
                </span>
                <div className="flex justify-between gap-1">
                  {dayNames.map((name, idx) => {
                    const isSelected = selectedDaysOfWeek.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDayOfWeek(idx)}
                        className={`h-8 w-8 rounded-full text-xs font-bold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Push Reminder Timing */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Notificación Push Personalizada
            </label>
            <select
              value={reminderOffset}
              onChange={(e) => setReminderOffset(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value={0}>Al momento exacto</option>
              <option value={5}>5 minutos antes</option>
              <option value={10}>10 minutos antes</option>
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes</option>
              <option value={60}>1 hora antes</option>
              <option value={1440}>1 día antes</option>
            </select>
          </div>

          {/* Google Calendar Sync Option */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Sincronizar con Google Calendar
              </p>
              <p className="text-[11px] text-slate-500">
                Crea el evento en tu calendario de Google con recordatorios
              </p>
            </div>
            <input
              type="checkbox"
              checked={syncWithGoogle}
              onChange={(e) => setSyncWithGoogle(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : initialActivity ? 'Actualizar' : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
