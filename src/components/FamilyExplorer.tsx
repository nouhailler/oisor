import React, { useState, useMemo } from 'react';
import { Bird, BIRD_CATEGORIES } from '../types/bird';
import { BirdImage } from './BirdImage';
import { Shield, Sparkles, Search, Filter, Eye, ChevronRight, Check, Feather, Waves, Compass, Mountain, Trees } from 'lucide-react';

interface FamilyExplorerProps {
  birds: Bird[];
  onSelectBird: (bird: Bird) => void;
  initialCategory?: string;
}

interface FamilyMeta {
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  emblemBirds: string[];
}

const FEATURED_FAMILIES: FamilyMeta[] = [
  {
    name: 'Rapaces',
    badge: 'Chasseurs Aériens',
    tagline: 'Aigles, Faucons, Milans, Buses & Balbuzard',
    description: 'Grands voiliers prédateurs dotés de serres puissantes, d\'une vue perçante et de becs crochus adaptés à la chasse et au vol en ascendance.',
    icon: <Shield className="w-6 h-6 text-amber-400" />,
    gradient: 'from-amber-950 via-slate-900 to-slate-950 border-amber-500/30',
    emblemBirds: ['Aigle royal', 'Faucon pèlerin', 'Milan royal', 'Balbuzard pêcheur'],
  },
  {
    name: 'Hirondelles et martinets',
    badge: 'Voiliers Migrateurs',
    tagline: 'Hirondelles & Martinets',
    description: 'Maîtres acrobates de l\'air capturant les insectes en plein vol. Reconnaissables à leurs silhouettes effilées en faux ou à queue fourchue.',
    icon: <Compass className="w-6 h-6 text-sky-400" />,
    gradient: 'from-sky-950 via-slate-900 to-slate-950 border-sky-500/30',
    emblemBirds: ['Hirondelle rustique', 'Hirondelle de fenêtre', 'Martinet noir'],
  },
  {
    name: 'Passereaux',
    badge: 'Petits Chanteurs',
    tagline: 'Mésanges, Rougegorge, Merle, Chardonneret, Grive',
    description: 'L\'ordre le plus vaste des oiseaux des jardins, haies et forêts. Chanteurs mélodieux dotés de pattes adaptées à la perchée.',
    icon: <Feather className="w-6 h-6 text-emerald-400" />,
    gradient: 'from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/30',
    emblemBirds: ['Rougegorge familier', 'Merle noir', 'Grive musicienne', 'Mésange bleue'],
  },
  {
    name: 'Oiseaux d\'eau',
    badge: 'Zones Humides',
    tagline: 'Canards, Cygne, Foulque, Grèbe, Grande Aigrette',
    description: 'Habitants des lacs, étangs, marais et rivières. Adaptés à la nage, au plongeon ou à la recherche d\'invertébrés aquatiques.',
    icon: <Waves className="w-6 h-6 text-teal-400" />,
    gradient: 'from-teal-950 via-slate-900 to-slate-950 border-teal-500/30',
    emblemBirds: ['Canard colvert', 'Cygne tuberculé', 'Foulque macroule', 'Grèbe huppé'],
  },
  {
    name: 'Oiseaux marins',
    badge: 'Faune Océanique',
    tagline: 'Fou de Bassan, Macareux, Puffin, Cormoran, Goéland',
    description: 'Seigneurs de l\'Atlantique, de la Manche et de la Méditerranée. Adaptés aux plongées en mer, piqués et vol au ras des vagues.',
    icon: <Waves className="w-6 h-6 text-cyan-400" />,
    gradient: 'from-cyan-950 via-slate-900 to-slate-950 border-cyan-500/30',
    emblemBirds: ['Fou de Bassan', 'Macareux moine', 'Puffin des Baléares', 'Cormoran huppé'],
  },
  {
    name: 'Échassiers',
    badge: 'Hauts Échassiers',
    tagline: 'Cigognes, Aigrettes, Spatule, Ibis, Huîtrier',
    description: 'Oiseaux aux très longues pattes et becs effilés ou en spatule, arpentant les vasières, estuaires et prairies humides.',
    icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
    gradient: 'from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30',
    emblemBirds: ['Cigogne blanche', 'Spatule blanche', 'Ibis falcinelle', 'Aigrette garzette'],
  },
];

export const FamilyExplorer: React.FC<FamilyExplorerProps> = ({ birds, onSelectBird, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Rapaces');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter birds by category
  const categoryBirds = useMemo(() => {
    return birds.filter((bird) => {
      if (!bird.category) return true;
      return bird.category === selectedCategory;
    });
  }, [birds, selectedCategory]);

  // Filtered by search query
  const filteredBirds = useMemo(() => {
    return categoryBirds.filter((bird) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        bird.name_common.toLowerCase().includes(q) ||
        bird.name_latin.toLowerCase().includes(q) ||
        bird.family.toLowerCase().includes(q) ||
        bird.description.toLowerCase().includes(q)
      );
    });
  }, [categoryBirds, searchQuery]);

  const activeMeta = FEATURED_FAMILIES.find((f) => f.name === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Feather className="w-3.5 h-3.5" />
            <span>Classification par Familles & Ordres</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Les Oiseaux par Famille & Grand Groupe
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Parcourez la faune selon ses grands groupes aviaires : Rapaces, Hirondelles & Martinets, Passereaux, Oiseaux d'eau, Oiseaux marins et Échassiers.
          </p>
        </div>
      </div>

      {/* Featured Family Group Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_FAMILIES.map((fam) => {
          const isSelected = selectedCategory === fam.name;
          const count = birds.filter((b) => b.category === fam.name).length;

          return (
            <div
              key={fam.name}
              onClick={() => {
                setSelectedCategory(fam.name);
                setSearchQuery('');
              }}
              className={`cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-gradient-to-b ${fam.gradient} ring-2 ring-teal-400 shadow-xl scale-[1.02]`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      {fam.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        {fam.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-tight">{fam.name}</h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
                    {count} espèces
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {fam.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1">
                  {fam.emblemBirds.slice(0, 3).map((b) => (
                    <span key={b} className="px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 text-[10px] font-medium border border-slate-800">
                      {b}
                    </span>
                  ))}
                </div>
                {isSelected ? (
                  <span className="flex items-center text-teal-400 font-bold text-xs shrink-0 ml-2">
                    <Check className="w-4 h-4 mr-1" /> Sélectionné
                  </span>
                ) : (
                  <span className="flex items-center text-slate-400 font-semibold group-hover:text-white shrink-0 ml-2">
                    Voir <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Category Dropdown & Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-teal-400 shrink-0" />
            <label htmlFor="family-select" className="text-sm font-bold text-white shrink-0">
              Choisir un groupe / famille :
            </label>
            <select
              id="family-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchQuery('');
              }}
              className="flex-1 sm:w-64 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm font-semibold text-teal-300 focus:outline-none focus:border-teal-500"
            >
              {BIRD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher une espèce dans ${selectedCategory}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Active Category Meta Banner */}
      {activeMeta && (
        <div className={`p-6 rounded-3xl bg-gradient-to-r ${activeMeta.gradient} border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl`}>
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Groupe sélectionné</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{selectedCategory}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{activeMeta.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {activeMeta.emblemBirds.map((b) => (
              <span key={b} className="px-3 py-1.5 rounded-xl bg-slate-950/90 text-teal-300 text-xs font-bold border border-teal-500/30">
                ⭐ {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Species Count Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>Espèces du groupe « {selectedCategory} »</span>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
            {filteredBirds.length} espèces
          </span>
        </h2>
      </div>

      {/* Species Grid */}
      {filteredBirds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBirds.map((bird) => (
            <div
              key={bird.id}
              onClick={() => onSelectBird(bird)}
              className="group bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <BirdImage src={bird.image} alt={bird.name_common} name={bird.name_common} className="w-full h-52 object-cover" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 font-bold text-[11px] border border-amber-500/30 shadow-lg">
                    {bird.family}
                  </div>
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
                      {bird.category || 'Passereaux'}
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
                  <span>Consulter la fiche</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
          <p className="text-slate-300 font-bold">Aucune espèce trouvée pour "{searchQuery}" dans la catégorie {selectedCategory}</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
          >
            Effacer la recherche
          </button>
        </div>
      )}
    </div>
  );
};
