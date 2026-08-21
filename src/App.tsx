import React, { useState, useEffect } from 'react';
import { Bird, Observation } from './types/bird';
import { getAllObservations, getCustomBirds } from './services/db';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { IdentificationWizard } from './components/IdentificationWizard';
import { Catalog } from './components/Catalog';
import { RegionExplorer } from './components/RegionExplorer';
import { FamilyExplorer } from './components/FamilyExplorer';
import { ObservationNotebook } from './components/ObservationNotebook';
import { SpeciesDetailModal } from './components/SpeciesDetailModal';
import { ImportModal } from './components/ImportModal';
import { UpdateModal } from './components/UpdateModal';
import { Feather, ShieldCheck, RefreshCw } from 'lucide-react';
import { APP_VERSION, BUILD_DATE } from './version';

export const App: React.FC = () => {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'catalog' | 'region' | 'family' | 'notebook'>('wizard');
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [preselectedForObs, setPreselectedForObs] = useState<Bird | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load built-in birds dataset + custom imported species
  const loadAllBirds = async () => {
    try {
      const res = await fetch('/data/birds.json');
      const staticBirds: Bird[] = await res.json();
      const customBirds = await getCustomBirds();
      
      // Combine static birds + custom birds (avoiding duplicates by id)
      const birdMap = new Map<string, Bird>();
      staticBirds.forEach((b) => birdMap.set(b.id, b));
      customBirds.forEach((b) => birdMap.set(b.id, b));
      
      setBirds(Array.from(birdMap.values()));
    } catch (err) {
      console.error('Erreur de chargement des oiseaux:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBirds();
  }, []);

  // Load observations from storage
  useEffect(() => {
    getAllObservations().then((data) => {
      setObservations(data);
    });
  }, []);

  const handleAddObservationFromModal = (bird: Bird) => {
    setPreselectedForObs(bird);
    setActiveTab('notebook');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      <OfflineBanner />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        observationCount={observations.length}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 mb-16 md:mb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin" />
            <p className="text-slate-400 font-semibold text-sm">Chargement de la faune française...</p>
          </div>
        ) : (
          <>
            {activeTab === 'wizard' && (
              <IdentificationWizard
                birds={birds}
                onSelectBird={(bird) => setSelectedBird(bird)}
              />
            )}

            {activeTab === 'catalog' && (
              <Catalog
                birds={birds}
                onSelectBird={(bird) => setSelectedBird(bird)}
              />
            )}

            {activeTab === 'family' && (
              <FamilyExplorer
                birds={birds}
                onSelectBird={(bird) => setSelectedBird(bird)}
              />
            )}

            {activeTab === 'region' && (
              <RegionExplorer
                birds={birds}
                onSelectBird={(bird) => setSelectedBird(bird)}
              />
            )}

            {activeTab === 'notebook' && (
              <ObservationNotebook
                birds={birds}
                observations={observations}
                setObservations={setObservations}
                preselectedBird={preselectedForObs}
                onClearPreselectedBird={() => setPreselectedForObs(null)}
              />
            )}
          </>
        )}
      </main>

      {/* Species Detail Modal */}
      <SpeciesDetailModal
        bird={selectedBird}
        allBirds={birds}
        onClose={() => setSelectedBird(null)}
        onSelectSimilarBird={(b) => setSelectedBird(b)}
        onAddObservation={handleAddObservationFromModal}
      />

      {/* JSON Import & Gabarit Documentation Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onBirdsImported={(newBirds) => {
          setBirds((prev) => {
            const map = new Map<string, Bird>();
            prev.forEach((b) => map.set(b.id, b));
            newBirds.forEach((b) => map.set(b.id, b));
            return Array.from(map.values());
          });
        }}
        onObservationsImported={() => {
          getAllObservations().then((data) => setObservations(data));
        }}
      />

      {/* System Update & Version Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold">
            <Feather className="w-4 h-4 text-teal-400" />
            <span>Oiseaux de France — Inventaire & Clé de Détermination PWA</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold border border-slate-700 transition-all text-[11px]"
              title="Vérifier la version et les mises à jour"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>v{APP_VERSION} ({BUILD_DATE})</span>
            </button>

            <span className="hidden sm:flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Client-side & Données Locales</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
