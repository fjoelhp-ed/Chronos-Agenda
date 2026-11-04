import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Activity, Category, UserPreferences, WidgetConfig, SortCriterion, DashboardCardsVisibility } from '../types/agenda';
import { encryptData, decryptData, EncryptedPayload } from '../utils/crypto';
import { soundHaptics } from '../utils/soundHaptics';
import { formatDateKey, getActivitiesForDate } from '../utils/recurrence';

const STORAGE_KEY = 'chronos_agenda_store_v1';
const PREFS_KEY = 'chronos_user_prefs_v1';
const PASSHASH_KEY = 'chronos_vault_hash_v1';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'work', name: 'Trabajo & Proyectos', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal & Estilo', color: '#10b981', icon: 'User' },
  { id: 'health', name: 'Salud & Fitness', color: '#f43f5e', icon: 'Activity' },
  { id: 'study', name: 'Estudio & Aprendizaje', color: '#8b5cf6', icon: 'BookOpen' },
  { id: 'finance', name: 'Finanzas & Ahorro', color: '#f59e0b', icon: 'DollarSign' },
  { id: 'home', name: 'Hogar & Familia', color: '#06b6d4', icon: 'Home' },
];

export const INITIAL_WIDGETS: WidgetConfig[] = [
  {
    id: 'w-glance',
    name: 'Android Material Glance',
    type: 'glance_2x2',
    os: 'android',
    theme: 'material_you',
    accentColor: '#10b981',
    showCompleted: false,
    opacity: 95,
    roundedCorners: 'lg',
  },
  {
    id: 'w-agenda',
    name: 'iOS Smart Stack Agenda',
    type: 'agenda_4x2',
    os: 'ios',
    theme: 'dark',
    accentColor: '#3b82f6',
    showCompleted: true,
    opacity: 90,
    roundedCorners: 'md',
  },
  {
    id: 'w-cal',
    name: 'Planificador Mensual 4x4',
    type: 'calendar_4x4',
    os: 'android',
    theme: 'amoled',
    accentColor: '#8b5cf6',
    showCompleted: false,
    opacity: 100,
    roundedCorners: 'full',
  },
];

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  accentPreset: 'android_teal',
  deviceShell: 'responsive',
  dashboardMode: 'full',
  visibleCards: {
    progress: true,
    streak: true,
    priorityMatrix: true,
    quickAdd: true,
    categoryChips: true,
  },
  sortBy: 'priority',
  sortAscending: false,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  autoLockMinutes: 5,
  biometricsEnabled: false,
  encryptionEnabled: false,
  autoSyncGoogle: false,
  hasSeenTutorial: false,
};

const getInitialActivities = (): Activity[] => {
  const today = formatDateKey(new Date());
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  return [
    {
      id: 'demo-1',
      title: 'Reunión de Sincronización Estratégica',
      description: 'Alineación de objetivos semanales y revisión de KPIs del trimestre.',
      type: 'event',
      date: today,
      startTime: '09:30',
      endTime: '10:30',
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      priority: 'high',
      categoryId: 'work',
      recurrence: { frequency: 'weekdays' },
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      title: 'Entrenamiento Funcional & Estiramiento',
      description: '45 minutos de circuito metabólico y estiramientos dinámicos.',
      type: 'event',
      date: today,
      startTime: '18:00',
      endTime: '19:00',
      completed: false,
      priority: 'medium',
      categoryId: 'health',
      recurrence: { frequency: 'daily', interval: 1 },
      reminderMinutesBefore: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      title: 'Auditar Presupuesto y Facturas de Servicios',
      description: 'Revisar balance mensual y programar pagos domiciliados.',
      type: 'task',
      date: today,
      startTime: '14:00',
      completed: false,
      priority: 'high',
      categoryId: 'finance',
      recurrence: { frequency: 'monthly', interval: 1 },
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      title: 'Módulo de Machine Learning & Python',
      description: 'Completar lección 4 de optimización de redes neuronales.',
      type: 'task',
      date: today,
      startTime: '20:30',
      completed: false,
      priority: 'low',
      categoryId: 'study',
      recurrence: { frequency: 'none' },
      reminderMinutesBefore: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      title: 'Comprar frutas de temporada y despensa',
      description: 'Supermercado local ecológico.',
      type: 'task',
      date: tomorrowKey,
      completed: false,
      priority: 'medium',
      categoryId: 'home',
      recurrence: { frequency: 'none' },
      reminderMinutesBefore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export interface AgendaNotification {
  id: string;
  activityId: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface AgendaContextType {
  activities: Activity[];
  categories: Category[];
  widgets: WidgetConfig[];
  preferences: UserPreferences;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  // Vault & Encryption
  isVaultLocked: boolean;
  hasPassphrase: boolean;
  lockVault: () => void;
  unlockVault: (passphrase: string) => Promise<boolean>;
  setupEncryption: (passphrase: string) => Promise<void>;
  disableEncryption: () => Promise<void>;
  // Activity actions
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleActivityCompletion: (id: string) => Promise<void>;
  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  // Widgets
  addWidget: (config: Omit<WidgetConfig, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  deleteWidget: (id: string) => void;
  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  // Import / Export
  importData: (newActivities: Activity[], newCategories?: Category[]) => Promise<void>;
  // Notifications
  notifications: AgendaNotification[];
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  // Active filter
  filterCategory: string | null;
  setFilterCategory: (catId: string | null) => void;
  filterPriority: string | null;
  setFilterPriority: (priority: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Dashboard Customization & Minimalist Mode
  toggleDashboardMode: () => void;
  updateVisibleCard: (card: keyof DashboardCardsVisibility, visible: boolean) => void;
  updateSort: (sortBy: SortCriterion, sortAscending?: boolean) => void;
  // Guided Tutorial
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  isDashboardCustomizerOpen: boolean;
  setIsDashboardCustomizerOpen: (open: boolean) => void;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(INITIAL_WIDGETS);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(new Date()));
  const [notifications, setNotifications] = useState<AgendaNotification[]>([]);

  // Encryption / Vault State
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [hasPassphrase, setHasPassphrase] = useState<boolean>(false);
  const [activePassphrase, setActivePassphrase] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tutorial and Dashboard Customizer modal states
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isDashboardCustomizerOpen, setIsDashboardCustomizerOpen] = useState<boolean>(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(PREFS_KEY);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferences((prev) => ({ ...prev, ...parsed }));
        if (!parsed.hasSeenTutorial && typeof window !== 'undefined' && !window.location.search.includes('autostart=1')) {
          setIsTutorialOpen(true);
        }
      } else {
        if (typeof window !== 'undefined' && !window.location.search.includes('autostart=1')) {
          setIsTutorialOpen(true);
        }
      }

      const storedHash = localStorage.getItem(PASSHASH_KEY);
      const isEncrypted = Boolean(storedHash);
      setHasPassphrase(isEncrypted);

      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          if (parsed && parsed.cipher) {
            // It's encrypted!
            setIsVaultLocked(true);
            return;
          } else if (Array.isArray(parsed.activities)) {
            // Plain storage
            setActivities(parsed.activities);
            if (parsed.categories) setCategories(parsed.categories);
            if (parsed.widgets) setWidgets(parsed.widgets);
            return;
          }
        } catch {
          // fallback
        }
      }

      // No data yet, initialize with demo data
      const initialActs = getInitialActivities();
      setActivities(initialActs);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activities: initialActs,
          categories: INITIAL_CATEGORIES,
          widgets: INITIAL_WIDGETS,
        })
      );
    } catch (e) {
      console.error('Failed to load local agenda storage', e);
    }
  }, []);

  // Save changes to storage (encrypted if passphrase active)
  const persistStore = useCallback(
    async (
      currentActs: Activity[],
      currentCats: Category[],
      currentWigs: WidgetConfig[],
      passphrase: string | null
    ) => {
      const payload = {
        activities: currentActs,
        categories: currentCats,
        widgets: currentWigs,
      };

      if (passphrase) {
        const encrypted = await encryptData(JSON.stringify(payload), passphrase);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    },
    []
  );

  const lockVault = useCallback(() => {
    setActivePassphrase(null);
    setIsVaultLocked(true);
    soundHaptics.triggerHaptic([30, 20]);
  }, []);

  const unlockVault = useCallback(
    async (passphrase: string): Promise<boolean> => {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) return false;

      try {
        const parsed = JSON.parse(rawData);
        if (parsed.cipher) {
          const decryptedJson = await decryptData(parsed as EncryptedPayload, passphrase);
          const data = JSON.parse(decryptedJson);
          setActivities(data.activities || []);
          if (data.categories) setCategories(data.categories);
          if (data.widgets) setWidgets(data.widgets);
        }
        setActivePassphrase(passphrase);
        setIsVaultLocked(false);
        soundHaptics.playSuccessChime();
        soundHaptics.triggerHaptic([20, 40]);
        return true;
      } catch (err) {
        console.error('Unlock failed', err);
        return false;
      }
    },
    []
  );

  const setupEncryption = useCallback(
    async (passphrase: string): Promise<void> => {
      const payload = { activities, categories, widgets };
      const encrypted = await encryptData(JSON.stringify(payload), passphrase);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
      localStorage.setItem(PASSHASH_KEY, 'true');
      setActivePassphrase(passphrase);
      setHasPassphrase(true);
      setIsVaultLocked(false);
      setPreferences((p) => {
        const next = { ...p, encryptionEnabled: true };
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
        return next;
      });
      soundHaptics.playSuccessChime();
    },
    [activities, categories, widgets]
  );

  const disableEncryption = useCallback(async (): Promise<void> => {
    localStorage.removeItem(PASSHASH_KEY);
    setActivePassphrase(null);
    setHasPassphrase(false);
    setIsVaultLocked(false);
    const payload = { activities, categories, widgets };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setPreferences((p) => {
      const next = { ...p, encryptionEnabled: false };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, [activities, categories, widgets]);

  // Activity Actions
  const addActivity = useCallback(
    async (item: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
      const newAct: Activity = {
        ...item,
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newAct, ...activities];
      setActivities(updated);
      await persistStore(updated, categories, widgets, activePassphrase);
      soundHaptics.triggerHaptic(20);
      return newAct;
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const updateActivity = useCallback(
    async (id: string, updates: Partial<Activity>) => {
      const updated = activities.map((act) =>
        act.id === id ? { ...act, ...updates, updatedAt: new Date().toISOString() } : act
      );
      setActivities(updated);
      await persistStore(updated, categories, widgets, activePassphrase);
      soundHaptics.triggerHaptic(15);
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      const updated = activities.filter((act) => act.id !== id);
      setActivities(updated);
      await persistStore(updated, categories, widgets, activePassphrase);
      soundHaptics.triggerHaptic([20, 20]);
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const toggleActivityCompletion = useCallback(
    async (id: string) => {
      // Check if it's a virtual occurrence
      const realId = id.includes('_occ_') ? id.split('_occ_')[0] : id;
      const target = activities.find((a) => a.id === realId);
      if (!target) return;

      const nextCompleted = !target.completed;
      const updated = activities.map((act) =>
        act.id === realId
          ? {
              ...act,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : act
      );

      setActivities(updated);
      await persistStore(updated, categories, widgets, activePassphrase);

      if (nextCompleted) {
        if (preferences.soundEnabled) soundHaptics.playSuccessChime();
        if (preferences.vibrationEnabled) soundHaptics.triggerHaptic([30, 40, 50]);
      } else {
        soundHaptics.triggerHaptic(15);
      }
    },
    [activities, categories, widgets, activePassphrase, persistStore, preferences]
  );

  // Category Actions
  const addCategory = useCallback(
    async (cat: Omit<Category, 'id'>): Promise<Category> => {
      const newCat: Category = {
        ...cat,
        id: `cat_${Date.now()}`,
      };
      const updated = [...categories, newCat];
      setCategories(updated);
      await persistStore(activities, updated, widgets, activePassphrase);
      return newCat;
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      await persistStore(activities, updated, widgets, activePassphrase);
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  // Widget Actions
  const addWidget = useCallback(
    (config: Omit<WidgetConfig, 'id'>) => {
      const newWidget: WidgetConfig = {
        ...config,
        id: `w_${Date.now()}`,
      };
      const updated = [...widgets, newWidget];
      setWidgets(updated);
      persistStore(activities, categories, updated, activePassphrase);
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const updateWidget = useCallback(
    (id: string, updates: Partial<WidgetConfig>) => {
      const updated = widgets.map((w) => (w.id === id ? { ...w, ...updates } : w));
      setWidgets(updated);
      persistStore(activities, categories, updated, activePassphrase);
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const deleteWidget = useCallback(
    (id: string) => {
      const updated = widgets.filter((w) => w.id !== id);
      setWidgets(updated);
      persistStore(activities, categories, updated, activePassphrase);
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const importData = useCallback(
    async (newActivities: Activity[], newCategories?: Category[]) => {
      const mergedActs = [...newActivities, ...activities.filter((a) => !newActivities.some((na) => na.id === a.id))];
      let mergedCats = categories;
      if (newCategories && newCategories.length > 0) {
        mergedCats = [
          ...newCategories,
          ...categories.filter((c) => !newCategories.some((nc) => nc.id === c.id)),
        ];
      }
      setActivities(mergedActs);
      setCategories(mergedCats);
      await persistStore(mergedActs, mergedCats, widgets, activePassphrase);
      soundHaptics.playSuccessChime();
    },
    [activities, categories, widgets, activePassphrase, persistStore]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Periodic Reminder Checker (runs every 30s)
  useEffect(() => {
    const checkReminders = () => {
      if (isVaultLocked) return;
      const todayKey = formatDateKey(new Date());
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMins = currentHours * 60 + currentMinutes;

      const todayActivities = getActivitiesForDate(activities, todayKey);

      todayActivities.forEach((act) => {
        if (act.completed || !act.startTime) return;
        const [h, m] = act.startTime.split(':').map(Number);
        const eventTimeInMins = h * 60 + m;
        const remOffset = act.reminderMinutesBefore ?? 15;
        const triggerTime = eventTimeInMins - remOffset;

        // Trigger if within this 1-minute window
        if (currentTimeInMins === triggerTime) {
          const notifId = `notif_${act.id}_${todayKey}_${triggerTime}`;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;

            const timeLabel = remOffset === 0 ? '¡Comienza ahora!' : `en ${remOffset} minutos (${act.startTime})`;
            const newNotif: AgendaNotification = {
              id: notifId,
              activityId: act.id,
              title: `⏰ Recordatorio: ${act.title}`,
              body: `${timeLabel}. ${act.description || ''}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
            };

            // Audio & Haptic
            if (preferences.soundEnabled) soundHaptics.playReminderChime();
            if (preferences.vibrationEnabled) soundHaptics.triggerHaptic([50, 100, 50]);

            // Web Push Notification if allowed
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`Chronos: ${act.title}`, {
                  body: `${timeLabel}\n${act.description || ''}`,
                  icon: '/icon.svg',
                });
              } catch {
                // Ignore notification failure
              }
            }

            return [newNotif, ...prev];
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    checkReminders();
    return () => clearInterval(interval);
  }, [activities, isVaultLocked, preferences]);

  const toggleDashboardMode = useCallback(() => {
    setPreferences((prev) => {
      const nextMode = prev.dashboardMode === 'essential' ? 'full' : 'essential';
      const next = { ...prev, dashboardMode: nextMode as 'full' | 'essential' };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
    soundHaptics.triggerHaptic(15);
  }, []);

  const updateVisibleCard = useCallback((card: keyof DashboardCardsVisibility, visible: boolean) => {
    setPreferences((prev) => {
      const nextCards = { ...prev.visibleCards, [card]: visible };
      const next = { ...prev, visibleCards: nextCards };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSort = useCallback((sortBy: SortCriterion, sortAscending?: boolean) => {
    setPreferences((prev) => {
      const isAsc = sortAscending !== undefined ? sortAscending : prev.sortBy === sortBy ? !prev.sortAscending : false;
      const next = { ...prev, sortBy, sortAscending: isAsc };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
    soundHaptics.triggerHaptic(10);
  }, []);

  // Apply Theme Classes to Document Element & Body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('dark', 'theme-amoled', 'theme-glass');
    body.classList.remove('theme-glass');

    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'amoled') {
      root.classList.add('dark', 'theme-amoled');
    } else if (preferences.theme === 'glass') {
      root.classList.add('dark', 'theme-glass');
      body.classList.add('theme-glass');
    }
  }, [preferences.theme]);

  const value = useMemo(
    () => ({
      activities,
      categories,
      widgets,
      preferences,
      selectedDate,
      setSelectedDate,
      isVaultLocked,
      hasPassphrase,
      lockVault,
      unlockVault,
      setupEncryption,
      disableEncryption,
      addActivity,
      updateActivity,
      deleteActivity,
      toggleActivityCompletion,
      addCategory,
      deleteCategory,
      addWidget,
      updateWidget,
      deleteWidget,
      updatePreferences,
      importData,
      notifications,
      dismissNotification,
      clearNotifications,
      filterCategory,
      setFilterCategory,
      filterPriority,
      setFilterPriority,
      searchQuery,
      setSearchQuery,
      toggleDashboardMode,
      updateVisibleCard,
      updateSort,
      isTutorialOpen,
      setIsTutorialOpen,
      isDashboardCustomizerOpen,
      setIsDashboardCustomizerOpen,
    }),
    [
      activities,
      categories,
      widgets,
      preferences,
      selectedDate,
      isVaultLocked,
      hasPassphrase,
      lockVault,
      unlockVault,
      setupEncryption,
      disableEncryption,
      addActivity,
      updateActivity,
      deleteActivity,
      toggleActivityCompletion,
      addCategory,
      deleteCategory,
      addWidget,
      updateWidget,
      deleteWidget,
      updatePreferences,
      importData,
      notifications,
      dismissNotification,
      clearNotifications,
      filterCategory,
      setFilterCategory,
      filterPriority,
      setFilterPriority,
      searchQuery,
      toggleDashboardMode,
      updateVisibleCard,
      updateSort,
      isTutorialOpen,
      isDashboardCustomizerOpen,
    ]
  );

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
};

export const useAgenda = (): AgendaContextType => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};
