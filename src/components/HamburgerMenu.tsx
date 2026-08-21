import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  BookOpen,
  Layers,
  MapPin,
  BookText,
  FileJson,
  Navigation,
  Database,
  Download,
  Wifi,
  WifiOff,
  Sparkles,
  ShieldCheck,
  Feather,
  ChevronRight,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Zap,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useOnlineStatus, usePWAInstallPrompt, usePWAUpdate } from '../services/pwaService';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'wizard' | 'catalog' | 'region' | 'family' | 'notebook';
  setActiveTab: (tab: 'wizard' | 'catalog' | 'region' | 'family' | 'notebook') => void;
  observationCount: number;
  onOpenImportModal: () => void;
  onOpenUpdateModal?: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  observationCount,
  onOpenImportModal,
}) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstallPrompt();
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

  const [storageUsage, setStorageUsage] = useState<{ usedMb: string; quotaMb: string } | null>(null);

  // Fetch local storage estimation
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        const used = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
        const quota = ((estimate.quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
        setStorageUsage({ usedMb: used, quotaMb: quota });
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (tab: 'wizard' | 'catalog' | 'region' | 'family' | 'notebook') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg text-slate-950 font-bold">
                <Feather className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-extrabold text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Oiseaux de France
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 text-[10px] font-mono font-bold border border-slate-700">
                    {currentVersion}
                  </span>
                </div>
                <span className="block text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                  Menu & Gestion des Mises à Jour
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50"
              title="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content with Categorized Features */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Category 1: Détermination & Identification */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>1. Détermination & Identification</span>
              </div>

              <div
                onClick={() => navigateTo('wizard')}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'wizard'
                    ? 'bg-teal-500/20 border-teal-500/60 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-teal-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">
                        Clé de Détermination Visuelle
                      </h3>
                      <p className="text-xs text-slate-400">Identification rapide en 4 étapes</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-300 space-y-1">
                  <p>• Algorithme de calcul du score de correspondance (`% match`).</p>
                  <p>• Filtres simultanés : taille, pastilles de couleur, bec et milieu.</p>
                </div>
              </div>
            </div>

            {/* Category 2: Explorations Aviaires */}
            <div className="space-y-3 pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>2. Explorations & Guides Aviaires</span>
              </div>

              <div className="space-y-2">
                {/* Catalogue General */}
                <div
                  onClick={() => navigateTo('catalog')}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeTab === 'catalog'
                      ? 'bg-teal-500/20 border-teal-500/60'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-4 h-4 text-teal-400" />
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-teal-300">Catalogue des Espèces</h4>
                      <p className="text-[11px] text-slate-400">Recherche textuelle, filtres & vues Grille/Liste</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                </div>

                {/* Par Famille */}
                <div
                  onClick={() => navigateTo('family')}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeTab === 'family'
                      ? 'bg-teal-500/20 border-teal-500/60'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-teal-300">Oiseaux par Famille</h4>
                      <p className="text-[11px] text-slate-400">Rapaces, Passereaux, Oiseaux d'eau, Marins...</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                </div>

                {/* Par Région */}
                <div
                  onClick={() => navigateTo('region')}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeTab === 'region'
                      ? 'bg-teal-500/20 border-teal-500/60'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-teal-300">Oiseaux par Région</h4>
                      <p className="text-[11px] text-slate-400">Auvergne-Rhône-Alpes, Bretagne, Île-de-France...</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                </div>
              </div>
            </div>

            {/* Category 3: Suivi & Carnet de Terrain */}
            <div className="space-y-3 pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <BookText className="w-4 h-4 text-teal-400" />
                <span>3. Suivi & Carnet de Terrain (100% Local)</span>
              </div>

              <div
                onClick={() => navigateTo('notebook')}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'notebook'
                    ? 'bg-teal-500/20 border-teal-500/60 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-teal-400">
                      <BookText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-teal-300">Carnet d'Observations</h3>
                        {observationCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                            {observationCount} obs.
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Saisie terrain & suivi temporel</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-300 space-y-1">
                  <p className="flex items-center space-x-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Géolocalisation GPS :</strong> Capture en 1 clic via le navigateur.</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span><strong>Stockage OPFS + IndexedDB :</strong> Aucune limite de 5 Mo.</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Exports :</strong> Téléchargement immédiat en JSON & CSV.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Category 4: Outils & Mises à Jour System */}
            <div className="space-y-3 pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <RefreshCw className="w-4 h-4 text-teal-400" />
                <span>4. Gestion des Mises à Jour & Système</span>
              </div>

              {/* Update Card Container */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">Version actuelle :</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
                      {currentVersion}
                    </span>
                  </div>

                  {updateAvailable && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 animate-pulse">
                      MAJ Prête
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <p className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Dernière version :</strong> {lastUpdateDate}</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span><strong>Dernière vérification :</strong> {lastCheckDate || 'Jamais vérifié'}</span>
                  </p>
                </div>

                {statusMessage && (
                  <div className="text-[11px] font-semibold text-teal-300 bg-slate-900/80 p-2 rounded-lg border border-teal-500/20">
                    {statusMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={checkUpdate}
                    disabled={checking}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    <span>{checking ? 'Recherche...' : 'Vérifier'}</span>
                  </button>

                  <button
                    onClick={forceUpdate}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs hover:from-teal-400 hover:to-emerald-300 transition-all shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Forcer MAJ</span>
                  </button>
                </div>
              </div>

              {/* JSON Import button */}
              <div
                onClick={() => {
                  onClose();
                  onOpenImportModal();
                }}
                className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FileJson className="w-4 h-4 text-teal-400" />
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-teal-300">Importation & Gabarit JSON</h4>
                    <p className="text-[11px] text-slate-400">Import de sauvegardes & espèces personnalisées</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
              </div>
            </div>

          </div>

          {/* Footer with Real-Time Storage & App Status */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-3">
            {/* Status Pills */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-semibold">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">En Ligne</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Mode Hors-Ligne Actif</span>
                  </>
                )}
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-teal-300 text-[10px] font-bold border border-slate-700">
                PWA Client-Side
              </span>
            </div>

            {/* Storage Quota Gauge */}
            {storageUsage && (
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Espace utilisé :</span>
                </span>
                <span className="font-mono font-bold text-teal-300">
                  {storageUsage.usedMb} Mo / {storageUsage.quotaMb} Go
                </span>
              </div>
            )}

            {/* Install PWA Button */}
            {isInstallable && !isInstalled && (
              <button
                onClick={() => {
                  triggerInstall();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Installer l'application sur l'appareil</span>
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center justify-center space-x-1.5 text-xs text-teal-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Application installée et autonome</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
