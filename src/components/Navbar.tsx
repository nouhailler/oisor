import React from 'react';
import { Feather, Compass, BookOpen, BookText, Download, Wifi, WifiOff, CheckCircle2, FileJson } from 'lucide-react';
import { useOnlineStatus, usePWAInstallPrompt } from '../services/pwaService';

interface NavbarProps {
  activeTab: 'wizard' | 'catalog' | 'notebook';
  setActiveTab: (tab: 'wizard' | 'catalog' | 'notebook') => void;
  observationCount: number;
  onOpenImportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, observationCount, onOpenImportModal }) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstallPrompt();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('wizard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-bold">
              <Feather className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Oiseaux<span className="text-slate-100 font-normal"> de France</span>
              </span>
              <span className="block text-[10px] text-teal-400/80 tracking-wider font-semibold uppercase -mt-1">
                PWA 100% Hors-Ligne
              </span>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'wizard'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Clé d'Identification</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Catalogue des Espèces</span>
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'notebook'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookText className="w-4 h-4" />
              <span>Carnet d'Observations</span>
              {observationCount > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === 'notebook' ? 'bg-slate-950 text-teal-300' : 'bg-teal-500/20 text-teal-300'
                }`}>
                  {observationCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/30 transition-all"
              title="Menu d'importation et documentation du Gabarit JSON"
            >
              <FileJson className="w-4 h-4 text-teal-400" />
              <span className="hidden lg:inline">Gabarit JSON & Import</span>
            </button>
          </nav>

          {/* Network Status & PWA Install */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status Pill */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/50 animate-pulse'
              }`}
              title={isOnline ? 'Connecté à Internet' : 'Mode 100% Hors-ligne actif'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isOnline ? 'En Ligne' : 'Hors-Ligne'}</span>
            </div>

            {/* PWA Install Button */}
            {isInstallable && !isInstalled && (
              <button
                onClick={triggerInstall}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20 animate-bounce"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden xs:inline">Installer l'App</span>
              </button>
            )}

            {isInstalled && (
              <span className="hidden lg:flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-teal-300 border border-teal-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>App Installée</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs transition-all ${
            activeTab === 'wizard' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Identification</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs transition-all ${
            activeTab === 'catalog' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Catalogue</span>
        </button>

        <button
          onClick={() => setActiveTab('notebook')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs transition-all relative ${
            activeTab === 'notebook' ? 'text-teal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <BookText className="w-5 h-5 mb-0.5" />
            {observationCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[10px] rounded-full bg-teal-500 text-slate-950 font-extrabold">
                {observationCount}
              </span>
            )}
          </div>
          <span>Carnet</span>
        </button>

        <button
          onClick={onOpenImportModal}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-xs text-teal-400 font-semibold"
        >
          <FileJson className="w-5 h-5 mb-0.5" />
          <span>Import JSON</span>
        </button>
      </div>
    </header>
  );
};
