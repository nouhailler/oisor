import React from 'react';
import { Bird } from '../types/bird';
import { BirdImage } from './BirdImage';
import { X, PlusCircle, Ruler, Compass, Calendar, Utensils, Feather, MapPin, AlertCircle, ChevronRight } from 'lucide-react';

interface SpeciesDetailModalProps {
  bird: Bird | null;
  allBirds: Bird[];
  onClose: () => void;
  onSelectSimilarBird: (bird: Bird) => void;
  onAddObservation: (bird: Bird) => void;
}

export const SpeciesDetailModal: React.FC<SpeciesDetailModalProps> = ({
  bird,
  allBirds,
  onClose,
  onSelectSimilarBird,
  onAddObservation,
}) => {
  if (!bird) return null;

  // Find objects for similar species
  const similarBirdObjects = bird.similar_species
    .map((id) => allBirds.find((b) => b.id === id))
    .filter(Boolean) as Bird[];

  const formatSeason = (seasons: string[]) => {
    return seasons
      .map((s) => {
        if (s === 'toute-annee') return 'Toute l\'année (Sédentaire)';
        if (s === 'printemps-ete') return 'Printemps / Été (Nicheur)';
        if (s === 'hiver') return 'Hivernage (Hiver)';
        if (s === 'migration') return 'Passage de migration';
        return s;
      })
      .join(', ');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-950 transition-all border border-slate-700/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {/* Header Image */}
          <div className="relative h-64 sm:h-80 w-full">
            <BirdImage
              src={bird.image}
              alt={bird.name_common}
              name={bird.name_common}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
                {bird.family}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 drop-shadow">
                {bird.name_common}
              </h2>
              <p className="text-sm sm:text-base text-teal-300/90 italic font-medium">
                {bird.name_latin}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Quick Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30">
              <div className="flex items-center space-x-3 text-teal-200">
                <Feather className="w-6 h-6 text-teal-400 shrink-0" />
                <span className="text-sm font-semibold">
                  Avez-vous aperçu cet oiseau aujourd'hui ?
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onAddObservation(bird);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold hover:from-teal-400 hover:to-emerald-300 shadow-lg shadow-teal-500/20 transition-all"
              >
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                <span>Ajouter à mes observations</span>
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Description & Signes Distinctifs</span>
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                {bird.description}
              </p>
            </div>

            {/* Key Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mensurations */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
                  <Ruler className="w-4 h-4" />
                  <span>Mensurations</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-white">Taille :</strong> {bird.size_cm} ({bird.size_category})</p>
                  <p><strong className="text-white">Envergure :</strong> {bird.wingspan_cm}</p>
                </div>
              </div>

              {/* Bec & Couleurs */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Bec & Couleurs</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-white">Type de bec :</strong> {bird.beak_type}</p>
                  <div className="flex items-center space-x-1.5 pt-1">
                    <strong className="text-white">Couleurs :</strong>
                    <div className="flex flex-wrap gap-1">
                      {bird.main_colors.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700 capitalize">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Saison & Présence */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Période de présence</span>
                </div>
                <p className="text-xs text-slate-300">{formatSeason(bird.seasons)}</p>
              </div>

              {/* Régime Alimentaire */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
                  <Utensils className="w-4 h-4" />
                  <span>Régime alimentaire</span>
                </div>
                <p className="text-xs text-slate-300">{bird.diet}</p>
              </div>
            </div>

            {/* Habitat & Regions List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Habitats privilégiés</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bird.habitat.map((h) => (
                    <span
                      key={h}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {bird.regions && bird.regions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
                    <Compass className="w-4 h-4" />
                    <span>Régions d'observation</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bird.regions.slice(0, 4).map((r) => (
                      <span
                        key={r}
                        className="px-2.5 py-1 rounded-xl bg-teal-950/60 text-teal-300 text-xs font-semibold border border-teal-500/30"
                      >
                        {r}
                      </span>
                    ))}
                    {bird.regions.length > 4 && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                        +{bird.regions.length - 4} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confusions Possibles Section */}
            {similarBirdObjects.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-base">
                  <AlertCircle className="w-5 h-5" />
                  <span>Confusions possibles</span>
                </div>
                <p className="text-xs text-slate-400">
                  Espèces proches visuellement à ne pas confondre :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarBirdObjects.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectSimilarBird(sim)}
                      className="group p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 flex items-center space-x-3 cursor-pointer transition-all"
                    >
                      <div className="w-14 h-14 shrink-0">
                        <BirdImage src={sim.image} alt={sim.name_common} name={sim.name_common} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 truncate">
                          {sim.name_common}
                        </h4>
                        <p className="text-xs text-slate-400 italic truncate">{sim.name_latin}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
