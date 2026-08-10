import React, { useState } from 'react';
import { Bird, Observation } from '../types/bird';
import { importBirdsFromJSON, importFromJSON } from '../services/db';
import {
  FileCode,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileJson,
  BookOpen,
  BookText,
  Info,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBirdsImported: (imported: Bird[]) => void;
  onObservationsImported: () => void;
}

const SAMPLE_SPECIES_JSON = [
  {
    id: "grosbec-casse-noyaux",
    name_common: "Grosbec casse-noyaux",
    name_latin: "Coccothraustes coccothraustes",
    family: "Fringillidae",
    habitat: ["Forêts", "Jardins", "Vergers"],
    size_category: "petit",
    size_cm: "16-18 cm",
    main_colors: ["brun", "orange", "gris", "noir"],
    beak_type: "conique",
    wingspan_cm: "29-33 cm",
    seasons: ["toute-annee"],
    description: "Passereau massif au bec triangulaire extrêmement puissant capable d'écraser des noyaux de cerises.",
    diet: "Granivore & graines dures",
    similar_species: ["chardonneret-elegant"],
    image: "assets/images/birds/grosbec.webp"
  }
];

const SAMPLE_OBSERVATION_JSON = [
  {
    id: "obs_1723456789012_a1b2",
    bird_id: "rouge-gorge-familier",
    bird_name: "Rouge-gorge familier",
    bird_latin: "Erithacus rubecula",
    date: "2026-08-10",
    time: "14:30",
    location: "Jardin des Tuileries, Paris",
    coordinates: {
      latitude: 48.8635,
      longitude: 2.3275
    },
    count: 2,
    notes: "Aperçu au sol près d'une haie, chant très clair.",
    created_at: 1723456789012
  }
];

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onBirdsImported,
  onObservationsImported,
}) => {
  const [activeMode, setActiveMode] = useState<'species' | 'observations'>('species');
  const [pastedJson, setPastedJson] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSample = activeMode === 'species' ? SAMPLE_SPECIES_JSON : SAMPLE_OBSERVATION_JSON;
  const currentSampleText = JSON.stringify(currentSample, null, 2);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(currentSampleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTemplate = () => {
    const filename = activeMode === 'species' ? 'gabarit_espece_oiseau.json' : 'gabarit_observations.json';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(currentSampleText);
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImportText = async () => {
    if (!pastedJson.trim()) {
      setStatusMessage({ type: 'error', text: 'Veuillez coller un contenu JSON ou sélectionner un fichier.' });
      return;
    }

    try {
      if (activeMode === 'species') {
        const imported = await importBirdsFromJSON(pastedJson);
        onBirdsImported(imported);
        setStatusMessage({
          type: 'success',
          text: `${imported.length} espèce(s) ajoutée(s) avec succès au catalogue !`,
        });
      } else {
        const count = await importFromJSON(pastedJson);
        onObservationsImported();
        setStatusMessage({
          type: 'success',
          text: `${count} observation(s) importée(s) avec succès !`,
        });
      }
      setPastedJson('');
    } catch (err) {
      setStatusMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setPastedJson(text);
      if (activeMode === 'species') {
        const imported = await importBirdsFromJSON(text);
        onBirdsImported(imported);
        setStatusMessage({
          type: 'success',
          text: `${imported.length} espèce(s) importée(s) depuis "${file.name}" !`,
        });
      } else {
        const count = await importFromJSON(text);
        onObservationsImported();
        setStatusMessage({
          type: 'success',
          text: `${count} observation(s) importée(s) depuis "${file.name}" !`,
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: (err as Error).message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Menu d'Importation & Gabarits JSON</h2>
              <p className="text-xs text-slate-400">
                Documentation du gabarit attendu et outil d'importation de données
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 space-x-2">
          <button
            onClick={() => {
              setActiveMode('species');
              setStatusMessage(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all border-b-2 ${
              activeMode === 'species'
                ? 'border-teal-400 text-teal-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Gabarit & Import d'Espèces (Catalogue)</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('observations');
              setStatusMessage(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all border-b-2 ${
              activeMode === 'observations'
                ? 'border-teal-400 text-teal-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookText className="w-4 h-4" />
            <span>Gabarit & Import d'Observations (Carnet)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 custom-scrollbar">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm font-bold animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-red-950/80 text-red-300 border-red-700/60'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Schema Specification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-teal-400" />
                <span>Structure du Gabarit JSON Attendu ({activeMode === 'species' ? 'Espèce' : 'Observation'})</span>
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyTemplate}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copié !' : 'Copier le gabarit'}</span>
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .json</span>
                </button>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-4 text-xs font-mono text-teal-300 overflow-x-auto custom-scrollbar leading-relaxed">
                {currentSampleText}
              </pre>
            </div>

            {/* Field Breakdown Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Info className="w-4 h-4 text-teal-400" />
                <span>Description détaillée des champs du gabarit :</span>
              </h4>

              {activeMode === 'species' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div><strong className="text-white">id :</strong> Identifiant unique (kebab-case)</div>
                  <div><strong className="text-white">name_common :</strong> Nom francais de l'oiseau</div>
                  <div><strong className="text-white">name_latin :</strong> Nom scientifique latin</div>
                  <div><strong className="text-white">family :</strong> Famille (ex: Paridae, Corvidae)</div>
                  <div><strong className="text-white">habitat :</strong> Liste des milieux (Jardins, Forêts...)</div>
                  <div><strong className="text-white">size_category :</strong> très-petit, petit, moyen, grand, très-grand</div>
                  <div><strong className="text-white">beak_type :</strong> court-fin, conique, crochu, long, plat</div>
                  <div><strong className="text-white">main_colors :</strong> Pastilles de couleur (orange, bleu, etc.)</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div><strong className="text-white">id :</strong> Identifiant unique de l'observation</div>
                  <div><strong className="text-white">bird_name :</strong> Nom de l'oiseau observe</div>
                  <div><strong className="text-white">date / time :</strong> Date (YYYY-MM-DD) et Heure (HH:MM)</div>
                  <div><strong className="text-white">count :</strong> Nombre d'individus observés</div>
                  <div><strong className="text-white">location :</strong> Lieu ou description geographique</div>
                  <div><strong className="text-white">coordinates :</strong> Objet optionnel (latitude, longitude)</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Import Actions (Upload or Paste) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>Exécuter l'importation dans l'application</span>
            </h3>

            {/* Drag & Drop / File Input */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto flex-1 cursor-pointer flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-teal-500 bg-slate-950/80 hover:bg-slate-950 transition-all text-xs font-semibold text-slate-300">
                <Upload className="w-5 h-5 text-teal-400" />
                <span>Sélectionner un fichier .json depuis votre appareil</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-500 font-bold uppercase">Ou</span>

              <div className="w-full sm:w-auto">
                <button
                  onClick={handleImportText}
                  className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-emerald-300 shadow-lg shadow-teal-500/20 transition-all"
                >
                  Valider le JSON colle
                </button>
              </div>
            </div>

            {/* Textarea for Pasting JSON */}
            <textarea
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              rows={5}
              placeholder={`Collez ici votre tableau JSON respectant le gabarit ci-dessus...\nEx:\n[\n  { "id": "mon-oiseau", "name_common": "Exemple", ... }\n]`}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
