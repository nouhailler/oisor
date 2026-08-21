import React, { useState, useRef } from 'react';
import { Bird, Observation } from '../types/bird';
import {
  saveObservation,
  deleteObservation,
  exportToJSON,
  exportToCSV,
  importFromJSON,
  getStorageEstimate,
  StorageEstimate,
} from '../services/db';
import {
  BookText,
  Plus,
  Calendar,
  Clock,
  MapPin,
  FileDown,
  FileUp,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  Locate,
  Hash,
  StickyNote,
} from 'lucide-react';

interface ObservationNotebookProps {
  birds: Bird[];
  observations: Observation[];
  setObservations: React.Dispatch<React.SetStateAction<Observation[]>>;
  preselectedBird?: Bird | null;
  onClearPreselectedBird?: () => void;
}

export const ObservationNotebook: React.FC<ObservationNotebookProps> = ({
  birds,
  observations,
  setObservations,
  preselectedBird,
  onClearPreselectedBird,
}) => {
  const [showForm, setShowForm] = useState(Boolean(preselectedBird));

  // Form State
  const [selectedBirdId, setSelectedBirdId] = useState<string>(
    preselectedBird ? preselectedBird.id : birds[0]?.id || ''
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [location, setLocation] = useState<string>('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [count, setCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [searchFilter, setSearchFilter] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageEstimate | null>(null);

  React.useEffect(() => {
    getStorageEstimate().then((info) => setStorageInfo(info));
  }, [observations]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      showToast('error', 'La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        setIsLocating(false);
        showToast('success', 'Coordonnées GPS récupérées avec succès !');
      },
      (error) => {
        setIsLocating(false);
        showToast('error', 'Impossible d\'obtenir la position : ' + error.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Submit Observation Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const birdObj = birds.find((b) => b.id === selectedBirdId);
    if (!birdObj) {
      showToast('error', 'Veuillez sélectionner un oiseau valide.');
      return;
    }

    const newObs: Observation = {
      id: 'obs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      bird_id: birdObj.id,
      bird_name: birdObj.name_common,
      bird_latin: birdObj.name_latin,
      date,
      time,
      location: location.trim() || 'Lieu non spécifié',
      coordinates: coords,
      count: Math.max(1, count),
      notes: notes.trim(),
      created_at: Date.now(),
    };

    try {
      await saveObservation(newObs);
      setObservations((prev) => [newObs, ...prev]);
      showToast('success', `Observation de "${birdObj.name_common}" enregistrée !`);
      
      // Reset fields
      setNotes('');
      setLocation('');
      setCount(1);
      setCoords(undefined);
      setShowForm(false);
      if (onClearPreselectedBird) onClearPreselectedBird();
    } catch (err) {
      showToast('error', 'Erreur lors de l\'enregistrement.');
    }
  };

  // Delete Observation
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Supprimer définitivement l'observation de ${name} ?`)) {
      await deleteObservation(id);
      setObservations((prev) => prev.filter((item) => item.id !== id));
      showToast('success', 'Observation supprimée.');
    }
  };

  // Import JSON handler
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const countImported = await importFromJSON(text);
      setObservations((prev) => {
        // Refresh local view
        return prev;
      });
      // Reload observations from DB
      window.location.reload();
      showToast('success', `${countImported} observation(s) importée(s) avec succès !`);
    } catch (err) {
      showToast('error', (err as Error).message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filtered observations
  const filteredObservations = observations.filter((obs) => {
    const query = searchFilter.toLowerCase();
    return (
      obs.bird_name.toLowerCase().includes(query) ||
      (obs.location || '').toLowerCase().includes(query) ||
      (obs.notes || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-bold border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60'
              : 'bg-red-950/90 text-red-300 border-red-700/60'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner & Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/20 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <BookText className="w-3.5 h-3.5" />
              <span>IndexedDB & OPFS (Haute Capacité)</span>
            </div>

            {storageInfo && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-semibold">
                <span>💾 Utilisation : <strong>{storageInfo.usageMB} Mo</strong> / {storageInfo.quotaGB} Go</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mon Carnet d'Observations
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Toutes vos observations sont conservées en sécurité sur votre appareil via <strong>IndexedDB</strong> et l'<strong>OPFS (Origin Private File System)</strong>, sans limitation de 5 Mo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold hover:from-teal-400 hover:to-emerald-300 shadow-lg shadow-teal-500/20 transition-all text-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Nouvelle observation</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => exportToJSON(observations)}
              disabled={observations.length === 0}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Exporter au format JSON"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportToCSV(observations)}
              disabled={observations.length === 0}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Exporter au format CSV (Excel)"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Importer une sauvegarde JSON"
            >
              <FileUp className="w-4 h-4 text-amber-400" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Entry Form Modal / Expandable Card */}
      {showForm && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-teal-400" />
              <span>Saisir une observation</span>
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              Fermer le formulaire
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Bird Selector */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Espèce observée
                </label>
                <select
                  value={selectedBirdId}
                  onChange={(e) => setSelectedBirdId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:border-teal-500 focus:outline-none"
                >
                  {birds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name_common} ({b.name_latin})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Heure</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Count */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-teal-400" />
                  <span>Nombre d'individus</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>Lieu d'observation</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Jardin public, Forêt de Fontainebleau, Lac du Bourget..."
                    className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-sm focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={isLocating}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-teal-300 hover:bg-slate-700 hover:text-white transition-colors text-xs font-bold flex items-center space-x-1.5 shrink-0"
                    title="Obtenir ma position GPS actuelle"
                  >
                    <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">GPS</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <StickyNote className="w-3.5 h-3.5 text-teal-400" />
                  <span>Notes personnelles & détails d'observation</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ex: Chant melodieux perche sur un chene, individu tres peu craintif..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold hover:from-teal-400 hover:to-emerald-300 text-sm shadow-lg shadow-teal-500/20"
              >
                Enregistrer l'observation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Observations Search & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Mes Observations enregistrées</span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30">
              {filteredObservations.length}
            </span>
          </h2>

          {observations.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrer mes observations..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          )}
        </div>

        {filteredObservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredObservations.map((obs) => {
              const birdMatch = birds.find((b) => b.id === obs.bird_id);
              return (
                <div
                  key={obs.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                          <span>{obs.bird_name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-xs font-extrabold">
                            x{obs.count}
                          </span>
                        </h3>
                        {obs.bird_latin && (
                          <p className="text-xs text-slate-400 italic">{obs.bird_latin}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(obs.id, obs.bird_name)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Supprimer cette observation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{obs.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{obs.time}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span className="truncate max-w-[180px]">{obs.location}</span>
                      </span>
                    </div>

                    {obs.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed italic">
                        "{obs.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50 flex justify-between">
                    <span>Enregistré localement</span>
                    <span>ID: {obs.id.substring(0, 12)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-2xl">
              📖
            </div>
            <h3 className="text-lg font-bold text-white">Aucune observation enregistrée</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Commencez à consigner vos observations sur le terrain. Vos données restent 100% privées sur votre téléphone ou ordinateur.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-2xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 shadow-lg"
            >
              Créer ma première observation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
