import React, { useState } from 'react';
import { Bird, IdentificationFilters, SizeCategory, BeakType } from '../types/bird';
import { BirdImage } from './BirdImage';
import { Sparkles, RotateCcw, Check, ChevronRight, Ruler, Palette, Compass, MapPin, Eye } from 'lucide-react';

interface WizardProps {
  birds: Bird[];
  onSelectBird: (bird: Bird) => void;
}

const SIZE_OPTIONS: { value: SizeCategory; label: string; desc: string; icon: string }[] = [
  { value: 'très-petit', label: 'Très Petit', desc: '< 15 cm (Mésange, Rouge-gorge)', icon: '🐣' },
  { value: 'petit', label: 'Petit', desc: '15-25 cm (Moineau, Chardonneret)', icon: '🐦' },
  { value: 'moyen', label: 'Moyen', desc: '25-45 cm (Merle, Pigeon, Pie)', icon: '🕊️' },
  { value: 'grand', label: 'Grand', desc: '45-70 cm (Canard, Faucon)', icon: '🦅' },
  { value: 'très-grand', label: 'Très Grand', desc: '> 70 cm (Héron cendré)', icon: '🦩' },
];

const BEAK_OPTIONS: { value: BeakType; label: string; desc: string; icon: string }[] = [
  { value: 'court-fin', label: 'Court & Fin', desc: 'Pour attraper les insectes', icon: '🔹' },
  { value: 'conique', label: 'Conique & Épais', desc: 'Pour décortiquer les graines', icon: '🔺' },
  { value: 'crochu', label: 'Crochu', desc: 'Pour déchirer les proies (rapaces)', icon: '🦅' },
  { value: 'long', label: 'Long & Poignard', desc: 'Pour harponner les poissons', icon: '🗡️' },
  { value: 'plat', label: 'Plat & Large', desc: 'Pour filtrer l\'eau (canards)', icon: '🦆' },
];

const COLOR_PALETTE: { value: string; label: string; bgClass: string; borderClass: string }[] = [
  { value: 'orange', label: 'Orange', bgClass: 'bg-orange-500', borderClass: 'border-orange-400' },
  { value: 'bleu', label: 'Bleu', bgClass: 'bg-blue-500', borderClass: 'border-blue-400' },
  { value: 'jaune', label: 'Jaune', bgClass: 'bg-yellow-400', borderClass: 'border-yellow-300' },
  { value: 'noir', label: 'Noir', bgClass: 'bg-zinc-900', borderClass: 'border-zinc-700' },
  { value: 'blanc', label: 'Blanc', bgClass: 'bg-slate-100', borderClass: 'border-slate-300' },
  { value: 'brun', label: 'Brun/Marron', bgClass: 'bg-amber-800', borderClass: 'border-amber-700' },
  { value: 'rouge', label: 'Rouge', bgClass: 'bg-red-600', borderClass: 'border-red-500' },
  { value: 'vert', label: 'Vert', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-500' },
  { value: 'gris', label: 'Gris', bgClass: 'bg-slate-400', borderClass: 'border-slate-300' },
];

const HABITAT_OPTIONS = [
  'Jardins',
  'Forêts',
  'Champs',
  'Zones humides',
  'Littoral',
  'Villes',
  'Montagnes'
];

export const IdentificationWizard: React.FC<WizardProps> = ({ birds, onSelectBird }) => {
  const [filters, setFilters] = useState<IdentificationFilters>({
    size_category: null,
    colors: [],
    beak_type: null,
    habitat: null,
  });

  const [activeStep, setActiveStep] = useState<number>(1);

  const toggleColor = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const resetFilters = () => {
    setFilters({
      size_category: null,
      colors: [],
      beak_type: null,
      habitat: null,
    });
    setActiveStep(1);
  };

  // Score computation for bird matches
  const birdScores = birds.map((bird) => {
    let maxPossibleScore = 0;
    let currentScore = 0;

    // Size criteria
    if (filters.size_category) {
      maxPossibleScore += 30;
      if (bird.size_category === filters.size_category) {
        currentScore += 30;
      }
    }

    // Color criteria
    if (filters.colors.length > 0) {
      maxPossibleScore += 30;
      const matchingColors = filters.colors.filter((c) => bird.main_colors.includes(c));
      const colorRatio = matchingColors.length / filters.colors.length;
      currentScore += Math.round(colorRatio * 30);
    }

    // Beak criteria
    if (filters.beak_type) {
      maxPossibleScore += 20;
      if (bird.beak_type === filters.beak_type) {
        currentScore += 20;
      }
    }

    // Habitat criteria
    if (filters.habitat) {
      maxPossibleScore += 20;
      if (bird.habitat.includes(filters.habitat)) {
        currentScore += 20;
      }
    }

    const percentage = maxPossibleScore > 0 ? Math.round((currentScore / maxPossibleScore) * 100) : 100;

    return { bird, score: currentScore, percentage, maxPossibleScore };
  });

  // Filter and sort candidates
  const candidates = birdScores
    .filter((item) => item.maxPossibleScore === 0 || item.percentage >= 30)
    .sort((a, b) => b.percentage - a.percentage);

  const hasActiveFilters = Boolean(
    filters.size_category || filters.colors.length > 0 || filters.beak_type || filters.habitat
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Wizard Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clé de Détermination Visuelle</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Quel est cet oiseau observé ?
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Sélectionnez la taille, les couleurs et les détails observés. Notre algorithme côté client calcule en direct la correspondance avec la faune française.
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex items-center space-x-3 p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            activeStep === 1
              ? 'bg-teal-500/20 border-teal-500/60 text-teal-200 shadow-lg shadow-teal-500/10'
              : filters.size_category
              ? 'bg-slate-900/80 border-slate-700/80 text-emerald-400'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center font-bold text-sm shrink-0">
            {filters.size_category ? <Check className="w-4 h-4 text-emerald-400" /> : '1'}
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs text-slate-400 font-medium">Étape 1</span>
            <span className="block font-semibold text-sm truncate">Taille estimée</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`flex items-center space-x-3 p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            activeStep === 2
              ? 'bg-teal-500/20 border-teal-500/60 text-teal-200 shadow-lg shadow-teal-500/10'
              : filters.colors.length > 0
              ? 'bg-slate-900/80 border-slate-700/80 text-emerald-400'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center font-bold text-sm shrink-0">
            {filters.colors.length > 0 ? <Check className="w-4 h-4 text-emerald-400" /> : '2'}
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs text-slate-400 font-medium">Étape 2</span>
            <span className="block font-semibold text-sm truncate">Couleurs ({filters.colors.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`flex items-center space-x-3 p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            activeStep === 3
              ? 'bg-teal-500/20 border-teal-500/60 text-teal-200 shadow-lg shadow-teal-500/10'
              : filters.beak_type
              ? 'bg-slate-900/80 border-slate-700/80 text-emerald-400'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center font-bold text-sm shrink-0">
            {filters.beak_type ? <Check className="w-4 h-4 text-emerald-400" /> : '3'}
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs text-slate-400 font-medium">Étape 3</span>
            <span className="block font-semibold text-sm truncate">Forme du bec</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(4)}
          className={`flex items-center space-x-3 p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            activeStep === 4
              ? 'bg-teal-500/20 border-teal-500/60 text-teal-200 shadow-lg shadow-teal-500/10'
              : filters.habitat
              ? 'bg-slate-900/80 border-slate-700/80 text-emerald-400'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center font-bold text-sm shrink-0">
            {filters.habitat ? <Check className="w-4 h-4 text-emerald-400" /> : '4'}
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs text-slate-400 font-medium">Étape 4</span>
            <span className="block font-semibold text-sm truncate">Habitat</span>
          </div>
        </button>
      </div>

      {/* Step Panels */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Step 1: Size */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-teal-400 font-semibold">
              <Ruler className="w-5 h-5" />
              <span>1. Quelle est la taille approximative de l'oiseau ?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters((prev) => ({ ...prev, size_category: prev.size_category === opt.value ? null : opt.value }))}
                  className={`flex items-start space-x-4 p-4 rounded-2xl border text-left transition-all ${
                    filters.size_category === opt.value
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg ring-2 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <span className="font-bold block text-base">{opt.label}</span>
                    <span className="text-xs text-slate-400 block mt-1">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-colors"
              >
                <span>Étape suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Colors */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-teal-400 font-semibold">
                <Palette className="w-5 h-5" />
                <span>2. Quelles couleurs avez-vous remarquées ?</span>
              </div>
              <span className="text-xs text-slate-400">Plusieurs sélections possibles</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {COLOR_PALETTE.map((c) => {
                const isSelected = filters.colors.includes(c.value);
                return (
                  <button
                    key={c.value}
                    onClick={() => toggleColor(c.value)}
                    className={`flex items-center space-x-3 p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-400 text-white ring-2 ring-teal-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full ${c.bgClass} border ${c.borderClass} shadow-md shrink-0 flex items-center justify-center`}>
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </span>
                    <span className="font-semibold text-sm">{c.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Précédent
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
              >
                <span>Étape suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Beak */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-teal-400 font-semibold">
              <Compass className="w-5 h-5" />
              <span>3. Quelle était la forme du bec ?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BEAK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters((prev) => ({ ...prev, beak_type: prev.beak_type === opt.value ? null : opt.value }))}
                  className={`flex items-start space-x-4 p-4 rounded-2xl border text-left transition-all ${
                    filters.beak_type === opt.value
                      ? 'bg-teal-500/20 border-teal-400 text-white ring-2 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <span className="font-bold block text-base">{opt.label}</span>
                    <span className="text-xs text-slate-400 block mt-1">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Précédent
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
              >
                <span>Étape suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Habitat */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-teal-400 font-semibold">
              <MapPin className="w-5 h-5" />
              <span>4. Dans quel milieu l'avez-vous aperçu ?</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {HABITAT_OPTIONS.map((hab) => (
                <button
                  key={hab}
                  onClick={() => setFilters((prev) => ({ ...prev, habitat: prev.habitat === hab ? null : hab }))}
                  className={`p-3.5 rounded-2xl border text-center font-semibold text-sm transition-all ${
                    filters.habitat === hab
                      ? 'bg-teal-500/20 border-teal-400 text-white ring-2 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {hab}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStep(3)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Précédent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Espèces candidates suggérées</span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-sm font-extrabold border border-teal-500/30">
              {candidates.length}
            </span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {hasActiveFilters
              ? 'Trier par pourcentage de correspondance'
              : 'Affichage de toutes les espèces du catalogue (filtres non actifs)'}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-xs font-semibold self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        )}
      </div>

      {/* Candidates List Grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(({ bird, percentage }) => (
            <div
              key={bird.id}
              onClick={() => onSelectBird(bird)}
              className="group bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <BirdImage src={bird.image} alt={bird.name_common} name={bird.name_common} className="w-full h-52 object-cover" />

                  {hasActiveFilters && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 font-extrabold text-xs border border-emerald-500/40 shadow-lg">
                      {percentage}% match
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                        {bird.name_common}
                      </h3>
                      <p className="text-xs text-slate-400 italic mt-0.5">{bird.name_latin}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                      {bird.family}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {bird.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {bird.habitat.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 text-[11px]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Consulter la fiche complète</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-white">Aucune espèce ne correspond exactement</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Essayez de désélectionner un ou plusieurs filtres pour élargir les critères de recherche.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}
    </div>
  );
};
