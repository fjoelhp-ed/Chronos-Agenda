import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import {
  exportToCSV,
  exportToJSON,
  parseAndValidateJSON,
  parseCSV,
} from '../utils/exportImport';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const { activities, categories, importData } = useAgenda();
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  if (!isOpen) return null;

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = exportToJSON(activities, categories);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(jsonStr, `chronos_agenda_backup_${dateStr}.json`, 'application/json');
    setFeedback({ text: 'Archivo JSON descargado correctamente', type: 'success' });
  };

  const handleExportCSV = () => {
    const csvStr = exportToCSV(activities, categories);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csvStr, `chronos_agenda_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    setFeedback({ text: 'Archivo CSV descargado correctamente', type: 'success' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const { activities: importedActs, categories: importedCats } = parseAndValidateJSON(text);
          await importData(importedActs, importedCats);
          setFeedback({
            text: `¡Éxito! Se importaron ${importedActs.length} actividades desde JSON.`,
            type: 'success',
          });
        } else if (file.name.endsWith('.csv')) {
          const parsed = parseCSV(text);
          if (parsed.length === 0) {
            throw new Error('No se detectaron filas válidas en el CSV');
          }
          await importData(parsed as any);
          setFeedback({
            text: `¡Éxito! Se importaron ${parsed.length} actividades desde CSV.`,
            type: 'success',
          });
        } else {
          throw new Error('Formato no compatible. Por favor sube un archivo .json o .csv');
        }
      } catch (err: any) {
        setFeedback({ text: err?.message || 'Error al procesar el archivo', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Exportar e Importar Datos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {feedback && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exportar Agenda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500 dark:hover:border-emerald-500 transition text-left group"
              >
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Formato JSON
                  </p>
                  <p className="text-[11px] text-slate-500">Copia de seguridad completa</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500 dark:hover:border-emerald-500 transition text-left group"
              >
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Formato CSV
                  </p>
                  <p className="text-[11px] text-slate-500">Para Excel y Google Sheets</p>
                </div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Importar Archivo
            </h4>
            <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 mb-2" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Haz clic o arrastra un archivo .json o .csv
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Los datos se integrarán preservando tus categorías existentes
              </span>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
