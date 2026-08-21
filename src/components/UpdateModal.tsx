import React from 'react';
import { RefreshCw, Zap, CheckCircle2, AlertCircle, X, Shield, Calendar, Clock, Sparkles } from 'lucide-react';
import { usePWAUpdate } from '../services/pwaService';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose }) => {
  const {
    currentVersion,
    lastUpdateDate,
    lastCheckDate,
    updateAvailable,
    checking,
    statusMessage,
    checkUpdate,
    forceUpdate,
  } = usePWAUpdate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <RefreshCw className={`w-6 h-6 ${checking ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Gestion des Mises à Jour</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 text-xs font-mono font-extrabold border border-slate-700">
                  {currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">Statut du système & mise à jour du Service Worker PWA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Update Status Banner */}
        {updateAvailable ? (
          <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-amber-300">Nouvelle version disponible !</h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Une mise à jour de l'application a été téléchargée en arrière-plan. Vous pouvez l'appliquer immédiatement.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs font-semibold">
              Votre application est en version optimale et prête pour le terrain.
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Version courante :</span>
            </div>
            <p className="font-bold text-white text-sm font-mono">{currentVersion}</p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Dernière mise à jour :</span>
            </div>
            <p className="font-semibold text-slate-200 text-xs">{lastUpdateDate}</p>
          </div>

          <div className="sm:col-span-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dernière vérification réseau :</span>
            </div>
            <p className="font-semibold text-slate-300 text-xs">
              {lastCheckDate || 'Aucune vérification manuelle effectuée'}
            </p>
          </div>
        </div>

        {/* Dynamic Status Feedback */}
        {statusMessage && (
          <div className="text-xs text-center text-teal-300 font-semibold bg-slate-950/60 py-2.5 px-4 rounded-xl border border-slate-800">
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={checkUpdate}
            disabled={checking}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Vérification en cours...' : 'Vérifier s\'il y a une mise à jour'}</span>
          </button>

          <button
            onClick={forceUpdate}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 text-slate-950 font-extrabold text-xs hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/20"
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
            <span>Forcer la mise à jour maintenant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
