import React, { useState, useMemo } from 'react';
import { Bird, REGIONS_FRANCE } from '../types/bird';
import { BirdImage } from './BirdImage';
import { Search, Filter, Eye, Grid, List, MapPin } from 'lucide-react';

interface CatalogProps {
  birds: Bird[];
  onSelectBird: (bird: Bird) => void;
  onSelectRegionTab?: (region: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ birds, onSelectBird, onSelectRegionTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHabitat, setSelectedHabitat] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'alpha-reverse' | 'family'>('alpha');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique families and habitats
  const allFamilies = useMemo(() => {
    const set = new Set<string>();
    birds.forEach((b) => set.add(b.family));
    return Array.from(set).sort();
  }, [birds]);

  const allHabitats = useMemo(() => {
    const set = new Set<string>();
    birds.forEach((b) => b.habitat.forEach((h) => set.add(h)));
    return Array.from(set).sort();
  }, [birds]);

  // Filtered and sorted birds
  const filteredBirds = useMemo(() => {
    return birds
      .filter((bird) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          bird.name_common.toLowerCase().includes(query) ||
          bird.name_latin.toLowerCase().includes(query) ||
          bird.family.toLowerCase().includes(query) ||
          (bird.category && bird.category.toLowerCase().includes(query)) ||
          bird.description.toLowerCase().includes(query);

        const matchesHabitat = selectedHabitat === 'all' || bird.habitat.includes(selectedHabitat);
        const matchesFamily = selectedFamily === 'all' || bird.family === selectedFamily;
        const matchesCategory = selectedCategory === 'all' || bird.category === selectedCategory;
        const matchesRegion =
          selectedRegion === 'all' || (bird.regions && bird.regions.includes(selectedRegion));

        return matchesSearch && matchesHabitat && matchesFamily && matchesCategory && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'alpha') return a.name_common.localeCompare(b.name_common, 'fr');
        if (sortBy === 'alpha-reverse') return b.name_common.localeCompare(a.name_common, 'fr');
        if (sortBy === 'family') return a.family.localeCompare(b.family, 'fr');
        return 0;
      });
  }, [birds, searchQuery, selectedHabitat, selectedFamily, selectedCategory, selectedRegion, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom commun, nom latin, région, famille..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white font-bold"
              >
                Effacer
              </button>
            )}
          </div>

          {/* View Mode & Sort Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSortBy('alpha')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === 'alpha' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A - Z
              </button>
              <button
                onClick={() => setSortBy('family')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === 'family' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Famille
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vue Grille"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vue Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span>Filtres :</span>
          </div>

          {/* Region Select */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-teal-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">📍 Toutes les régions de France</option>
            <option value="Auvergne-Rhône-Alpes">🏔️ Auvergne-Rhône-Alpes</option>
            <option value="Bretagne">🌊 Bretagne</option>
            <option value="Île-de-France">🏛️ Île-de-France</option>
            {REGIONS_FRANCE.filter(
              (r) => !['Auvergne-Rhône-Alpes', 'Bretagne', 'Île-de-France'].includes(r)
            ).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-300 focus:outline-none focus:border-teal-500"
          >
            <option value="all">🦅 Tous les groupes (Rapaces, Passereaux...)</option>
            <option value="Rapaces">🦅 Rapaces</option>
            <option value="Hirondelles et martinets">🕊️ Hirondelles & Martinets</option>
            <option value="Passereaux">🐦 Passereaux</option>
            <option value="Oiseaux d'eau">🦆 Oiseaux d'eau</option>
            <option value="Oiseaux marins">🌊 Oiseaux marins</option>
            <option value="Échassiers">🦩 Échassiers</option>
            <option value="Oiseaux de montagne">🏔️ Oiseaux de montagne</option>
            <option value="Pics & Corvidés">🪵 Pics & Corvidés</option>
          </select>

          {/* Habitat Select */}
          <select
            value={selectedHabitat}
            onChange={(e) => setSelectedHabitat(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">Tous les habitats</option>
            {allHabitats.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          {/* Family Select */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">Toutes les familles taxonomiques</option>
            {allFamilies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {(selectedHabitat !== 'all' || selectedFamily !== 'all' || selectedCategory !== 'all' || selectedRegion !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedHabitat('all');
                setSelectedFamily('all');
                setSelectedCategory('all');
                setSelectedRegion('all');
                setSearchQuery('');
              }}
              className="text-xs text-teal-400 hover:underline font-semibold ml-auto"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Species Grid */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>Oiseaux de France</span>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
            {filteredBirds.length} espèces
          </span>
        </h2>
      </div>

      {filteredBirds.length > 0 ? (
        viewMode === 'grid' ? (
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
                    {bird.regions && bird.regions.length > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-teal-300 font-semibold text-[10px] border border-teal-500/30 shadow">
                        {bird.regions.includes('Auvergne-Rhône-Alpes') && bird.regions.includes('Bretagne') && bird.regions.includes('Île-de-France')
                          ? 'Toute la France'
                          : `${bird.regions.length} rég.`}
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
                    <span>Consulter la fiche</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredBirds.map((bird) => (
              <div
                key={bird.id}
                onClick={() => onSelectBird(bird)}
                className="group bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-4 rounded-2xl flex items-center space-x-4 cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="w-24 h-20 shrink-0">
                  <BirdImage src={bird.image} alt={bird.name_common} name={bird.name_common} className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 truncate">
                      {bird.name_common}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold shrink-0">
                      {bird.family}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic">{bird.name_latin}</p>
                  <p className="text-xs text-slate-300 mt-1 truncate">{bird.description}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
          <p className="text-slate-300 font-bold">Aucune espèce trouvée pour "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedHabitat('all');
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
