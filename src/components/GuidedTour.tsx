import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Smartphone,
  Sliders,
  Layers,
  Flame,
  Zap,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { soundHaptics } from '../utils/soundHaptics';

export const GuidedTour: React.FC = () => {
  const { isTutorialOpen, setIsTutorialOpen, updatePreferences } = useAgenda();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isTutorialOpen) return null;

  const steps = [
    {
      title: '¡Bienvenido a Chronos Agenda!',
      tagline: 'Tu agenda inteligente, privada y fluida para Android e iOS',
      icon: Sparkles,
      iconColor: 'from-emerald-500 to-teal-500',
      badge: 'Paso 1 de 6',
      content:
        'Chronos está diseñada para ofrecerte el máximo control de tu tiempo con almacenamiento local cifrado de extremo a extremo, calendario visual y widgets interactivos.',
      highlight:
        '✨ Funciona 100% offline y se sincroniza con Google Calendar cuando lo desees.',
    },
    {
      title: 'Sistema de Prioridades y Filtros',
      tagline: 'Identifica al instante lo urgente e importante',
      icon: Flame,
      iconColor: 'from-rose-500 to-amber-500',
      badge: 'Paso 2 de 6',
      content:
        'Asigna prioridad Alta, Media o Baja a cada tarea o evento. El dashboard y el calendario muestran ribetes visuales de color para cada nivel.',
      highlight:
        '🎯 Puedes ordenar tus actividades por Prioridad o Hora, y filtrar con un solo clic.',
    },
    {
      title: 'Modo Esencial y Personalización',
      tagline: 'Diseñado para quienes prefieren simplicidad sin distracciones',
      icon: Sliders,
      iconColor: 'from-blue-500 to-indigo-500',
      badge: 'Paso 3 de 6',
      content:
        'Si no quieres abrumarte con métricas o gráficos, activa el "Modo Esencial". Ocultará los paneles secundarios y te dejará una lista limpia con captura rápida.',
      highlight:
        '⚡ En el botón de ajustes del Dashboard puedes encender o apagar cualquier tarjeta.',
    },
    {
      title: 'Calendario Visual y Tareas Recurrentes',
      tagline: 'Visualiza tus días por Mes, Semana, Día o Agenda',
      icon: Calendar,
      iconColor: 'from-purple-500 to-pink-500',
      badge: 'Paso 4 de 6',
      content:
        'Soporta tareas recurrentes diarias, días laborables (Lun-Vie), semanales con días personalizados o mensuales.',
      highlight:
        '📅 Los colores de tus categorías y las prioridades se reflejan directamente en la cuadrícula.',
    },
    {
      title: 'Widget Studio y Estilo Glass',
      tagline: 'Widgets interactivos con acabado Glass translúcido',
      icon: Smartphone,
      iconColor: 'from-teal-500 to-cyan-500',
      badge: 'Paso 5 de 6',
      content:
        'Prueba el nuevo tema "Glass" con efecto de cristal esmerilado y transparencias, disponible tanto para la app como para los widgets de inicio (2x2, 4x2 y 4x4).',
      highlight:
        '📱 Puedes marcar tareas directamente en el simulador y copiar el código nativo para Android o iOS.',
    },
    {
      title: 'Privacidad Total: Cifrado y Biometría',
      tagline: 'Bóveda protegida con AES-256-GCM y sensor de huella',
      icon: ShieldCheck,
      iconColor: 'from-emerald-500 to-green-600',
      badge: 'Paso 6 de 6',
      content:
        'Activa la bóveda para cifrar tus notas y actividades con una clave maestra. Nadie más podrá leer tus datos. Además, puedes vincular tu sensor de huella o Face ID.',
      highlight:
        '🔒 Bloquea la agenda en cualquier momento pulsando el icono del candado en la cabecera.',
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    soundHaptics.triggerHaptic(10);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    soundHaptics.triggerHaptic(10);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    soundHaptics.playSuccessChime();
    soundHaptics.triggerHaptic([20, 40]);
    updatePreferences({ hasSeenTutorial: true });
    setIsTutorialOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900/95 dark:bg-slate-900/95 p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        {/* Glow backdrop behind card */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {step.badge}
          </span>
          <button
            onClick={handleFinish}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            title="Saltar tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="relative z-10 py-6 space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${step.iconColor} flex items-center justify-center text-white shadow-lg shrink-0`}
            >
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">{step.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{step.tagline}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed pt-1">{step.content}</p>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{step.highlight}</span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 py-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === idx
                  ? 'w-8 bg-emerald-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="relative z-10 flex items-center justify-between pt-5 border-t border-slate-800 mt-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition px-3 py-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <span>{currentStep === steps.length - 1 ? '¡Comenzar ahora!' : 'Siguiente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
