import React, { useState, useMemo } from 'react';
import { Bird, REGIONS_FRANCE } from '../types/bird';
import { BirdImage } from './BirdImage';
import { MapPin, Compass, Search, Filter, Eye, Mountain, Waves, Trees, Sparkles, ChevronRight, Check } from 'lucide-react';

interface RegionExplorerProps {
  birds: Bird[];
  onSelectBird: (bird: Bird) => void;
  initialRegion?: string;
}

interface RegionMeta {
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  emblemBirds: string[];
  keyHabitats: string[];
}

const FEATURED_REGIONS: RegionMeta[] = [
  {
    name: 'Auvergne-Rhône-Alpes',
    badge: 'Montagnes & Vallées',
    tagline: 'Sommets alpins & Massif central',
    description: 'Une biodiversité d\'exception abritant les plus grands rapaces d\'Europe, la faune alpine d\'altitude et les forêts d\'Auvergne.',
    icon: <Mountain className="w-6 h-6 text-amber-400" />,
    gradient: 'from-amber-950 via-slate-900 to-slate-950 border-amber-500/30',
    emblemBirds: ['Aigle royal', 'Gypaète barbu', 'Tétras lyre', 'Chocard à bec jaune'],
    keyHabitats: ['Montagnes', 'Forêts', 'Champs'],
  },
  {
    name: 'Bretagne',
    badge: 'Littoral & Îles',
    tagline: 'Côtes armoricaines & Océan',
    description: 'Royaume incontesté des oiseaux marins, des falaises rocheuses, des baies sablonneuses et des réserves insulaires (Sept-Îles).',
    icon: <Waves className="w-6 h-6 text-cyan-400" />,
    gradient: 'from-cyan-950 via-slate-900 to-slate-950 border-cyan-500/30',
    emblemBirds: ['Fou de Bassan', 'Macareux moine', 'Cormoran huppé', 'Goéland marin'],
    keyHabitats: ['Littoral', 'Zones humides'],
  },
  {
    name: 'Île-de-France',
    badge: 'Bassin Parisien',
    tagline: 'Grands Parcs & Forêts Royales',
    description: 'Richesse ornithologique du bassin parisien, mariant parcs historiques, édifices urbains pour les faucons et denses forêts (Fontainebleau, Rambouillet).',
    icon: <Trees className="w-6 h-6 text-emerald-400" />,
    gradient: 'from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/30',
    emblemBirds: ['Faucon pèlerin', 'Chouette hulotte', 'Pic vert', 'Mésange charbonnière'],
    keyHabitats: ['Jardins', 'Villes', 'Forêts', 'Parcs'],
  },
];

export const RegionExplorer: React.FC<RegionExplorerProps> = ({ birds, onSelectBird, initialRegion }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion || 'Auvergne-Rhône-Alpes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  // Birds belonging to the active region
  const regionBirds = useMemo(() => {
    return birds.filter((bird) => {
      if (!bird.regions) return true; // fallback if missing
      return bird.regions.includes(selectedRegion);
    });
  }, [birds, selectedRegion]);

  // Extract unique families within this region
  const regionFamilies = useMemo(() => {
    const set = new Set<string>();
    regionBirds.forEach((b) => set.add(b.family));
    return Array.from(set).sort();
  }, [regionBirds]);

  // Filtered region birds by search query and family
  const filteredRegionBirds = useMemo(() => {
    return regionBirds.filter((bird) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        bird.name_common.toLowerCase().includes(q) ||
        bird.name_latin.toLowerCase().includes(q) ||
        bird.family.toLowerCase().includes(q) ||
        bird.description.toLowerCase().includes(q);

      const matchesFamily = selectedFamily === 'all' || bird.family === selectedFamily;

      return matchesSearch && matchesFamily;
    });
  }, [regionBirds, searchQuery, selectedFamily]);

  const activeRegionMeta = FEATURED_REGIONS.find((r) => r.name === selectedRegion);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>Guide d'Inventaire Régional</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Les Oiseaux par Région de France
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Explorez les espèces ornithologiques adaptées aux bioclimats et territoires de France métropolitaine : Auvergne-Rhône-Alpes, Bretagne, Île-de-France et plus encore.
          </p>
        </div>
      </div>

      {/* Featured Region Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURED_REGIONS.map((region) => {
          const isSelected = selectedRegion === region.name;
          const count = birds.filter((b) => b.regions?.includes(region.name)).length;

          return (
            <div
              key={region.name}
              onClick={() => {
                setSelectedRegion(region.name);
                setSearchQuery('');
                setSelectedFamily('all');
              }}
              className={`cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-gradient-to-b ${region.gradient} ring-2 ring-teal-400 shadow-xl scale-[1.02]`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      {region.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        {region.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-tight">{region.name}</h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
                    {count} espèces
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {region.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1">
                  {region.emblemBirds.slice(0, 3).map((b) => (
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
                    Explorer <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Any Region Dropdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Compass className="w-5 h-5 text-teal-400 shrink-0" />
            <label htmlFor="region-select" className="text-sm font-bold text-white shrink-0">
              Choisir une région de France :
            </label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSearchQuery('');
                setSelectedFamily('all');
              }}
              className="flex-1 sm:w-64 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm font-semibold text-teal-300 focus:outline-none focus:border-teal-500"
            >
              {REGIONS_FRANCE.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>Région active :</span>
            <span className="px-3 py-1 rounded-xl bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
              {selectedRegion}
            </span>
          </div>
        </div>

        {/* Search & Family Filter inside Region */}
        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher un oiseau spécifique en ${selectedRegion}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Toutes les familles ({regionFamilies.length})</option>
              {regionFamilies.map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Region Banner Header */}
      {activeRegionMeta && (
        <div className={`p-6 rounded-3xl bg-gradient-to-r ${activeRegionMeta.gradient} border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl`}>
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Espèces emblématiques & Inventaire regional</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Faune aviaire de {selectedRegion}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{activeRegionMeta.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {activeRegionMeta.emblemBirds.map((b) => (
              <span key={b} className="px-3 py-1.5 rounded-xl bg-slate-950/90 text-teal-300 text-xs font-bold border border-teal-500/30">
                ⭐ {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>Oiseaux observés en {selectedRegion}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
            {filteredRegionBirds.length} espèces
          </span>
        </h2>
      </div>

      {/* Species Grid for Selected Region */}
      {filteredRegionBirds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegionBirds.map((bird) => (
            <div
              key={bird.id}
              onClick={() => onSelectBird(bird)}
              className="group bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <BirdImage src={bird.image} alt={bird.name_common} name={bird.name_common} className="w-full h-52 object-cover" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-teal-300 font-bold text-[11px] border border-teal-500/30 shadow-lg flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    <span>{selectedRegion}</span>
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
                  <span>Fiche détaillée</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
          <p className="text-slate-300 font-bold">Aucune espèce trouvée pour vos critères en {selectedRegion}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFamily('all');
            }}
            className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};
