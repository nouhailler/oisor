import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Observation } from '../types/bird';

interface OiseauxDB extends DBSchema {
  observations: {
    key: string;
    value: Observation;
    indexes: { 'by-date': string; 'by-bird': string };
  };
  custom_birds: {
    key: string;
    value: Bird;
  };
}

const DB_NAME = 'oiseaux-de-france-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<OiseauxDB>> | null = null;

function getDB(): Promise<IDBPDatabase<OiseauxDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OiseauxDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1 || !db.objectStoreNames.contains('observations')) {
          const store = db.createObjectStore('observations', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
          store.createIndex('by-bird', 'bird_id');
        }
        if (oldVersion < 2 || !db.objectStoreNames.contains('custom_birds')) {
          db.createObjectStore('custom_birds', { keyPath: 'id' });
        }
      },
    }).catch((err) => {
      console.warn('IndexedDB unavailable, fallback to localStorage', err);
      return null as unknown as IDBPDatabase<OiseauxDB>;
    });
  }
  return dbPromise;
}

// Fallback LocalStorage helpers
const LOCAL_STORAGE_KEY = 'oiseaux_observations_backup';
const LOCAL_STORAGE_BIRDS_KEY = 'oiseaux_custom_birds_backup';

function getLocalStorageObservations(): Observation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageObservations(obs: Observation[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obs));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export async function getAllObservations(): Promise<Observation[]> {
  try {
    const db = await getDB();
    if (db) {
      const items = await db.getAllFromIndex('observations', 'by-date');
      return items.sort((a, b) => b.created_at - a.created_at);
    }
  } catch (e) {
    console.warn('Error reading from IndexedDB:', e);
  }
  return getLocalStorageObservations().sort((a, b) => b.created_at - a.created_at);
}

export async function saveObservation(obs: Observation): Promise<Observation> {
  try {
    const db = await getDB();
    if (db) {
      await db.put('observations', obs);
    }
  } catch (e) {
    console.warn('IndexedDB write error, saving to localStorage:', e);
  }
  // Always update LocalStorage backup
  const local = getLocalStorageObservations().filter((item) => item.id !== obs.id);
  local.push(obs);
  saveLocalStorageObservations(local);
  return obs;
}

export async function deleteObservation(id: string): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.delete('observations', id);
    }
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }
  const local = getLocalStorageObservations().filter((item) => item.id !== id);
  saveLocalStorageObservations(local);
}

export function exportToJSON(observations: Observation[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(observations, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `observations_oiseaux_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCSV(observations: Observation[]): void {
  if (observations.length === 0) return;

  const headers = ['id', 'bird_name', 'bird_latin', 'date', 'time', 'location', 'count', 'notes', 'created_at'];
  const csvRows = [headers.join(',')];

  for (const obs of observations) {
    const row = [
      `"${obs.id}"`,
      `"${(obs.bird_name || '').replace(/"/g, '""')}"`,
      `"${(obs.bird_latin || '').replace(/"/g, '""')}"`,
      `"${obs.date}"`,
      `"${obs.time}"`,
      `"${(obs.location || '').replace(/"/g, '""')}"`,
      obs.count,
      `"${(obs.notes || '').replace(/"/g, '""')}"`,
      obs.created_at
    ];
    csvRows.push(row.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `observations_oiseaux_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importFromJSON(jsonText: string): Promise<number> {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error('Le fichier doit contenir un tableau d\'observations.');

    let importedCount = 0;
    for (const item of parsed) {
      if (item.id && item.bird_name && item.date) {
        const obs: Observation = {
          id: item.id,
          bird_id: item.bird_id || 'unknown',
          bird_name: item.bird_name,
          bird_latin: item.bird_latin || '',
          date: item.date,
          time: item.time || '12:00',
          location: item.location || 'Inconnu',
          coordinates: item.coordinates,
          count: Number(item.count) || 1,
          notes: item.notes || '',
          created_at: item.created_at || Date.now(),
        };
        await saveObservation(obs);
        importedCount++;
      }
    }
    return importedCount;
  } catch (err) {
    throw new Error('Format JSON invalide : ' + (err as Error).message);
  }
}

// --- Custom Bird Species Persistence ---

function getLocalStorageCustomBirds(): Bird[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BIRDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageCustomBirds(birds: Bird[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_BIRDS_KEY, JSON.stringify(birds));
  } catch (e) {
    console.error('LocalStorage write error for custom birds', e);
  }
}

export async function getCustomBirds(): Promise<Bird[]> {
  try {
    const db = await getDB();
    if (db && db.objectStoreNames.contains('custom_birds')) {
      return await db.getAll('custom_birds');
    }
  } catch (e) {
    console.warn('Error reading custom birds from IndexedDB:', e);
  }
  return getLocalStorageCustomBirds();
}

export async function saveCustomBird(bird: Bird): Promise<Bird> {
  try {
    const db = await getDB();
    if (db && db.objectStoreNames.contains('custom_birds')) {
      await db.put('custom_birds', bird);
    }
  } catch (e) {
    console.warn('IndexedDB error saving custom bird:', e);
  }
  const local = getLocalStorageCustomBirds().filter((b) => b.id !== bird.id);
  local.push(bird);
  saveLocalStorageCustomBirds(local);
  return bird;
}

export async function importBirdsFromJSON(jsonText: string): Promise<Bird[]> {
  try {
    const parsed = JSON.parse(jsonText);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const importedBirds: Bird[] = [];

    for (const item of items) {
      if (!item.id || !item.name_common || !item.name_latin || !item.family) {
        throw new Error('Chaque espèce doit posséder au moins id, name_common, name_latin et family.');
      }
      const bird: Bird = {
        id: String(item.id).trim().toLowerCase().replace(/\s+/g, '-'),
        name_common: String(item.name_common),
        name_latin: String(item.name_latin),
        family: String(item.family),
        habitat: Array.isArray(item.habitat) ? item.habitat : ['Jardins'],
        size_category: item.size_category || 'moyen',
        size_cm: item.size_cm || '20-25 cm',
        main_colors: Array.isArray(item.main_colors) ? item.main_colors : ['brun'],
        beak_type: item.beak_type || 'court-fin',
        wingspan_cm: item.wingspan_cm || '30-40 cm',
        seasons: Array.isArray(item.seasons) ? item.seasons : ['toute-annee'],
        description: item.description || '',
        diet: item.diet || 'Omnivore',
        similar_species: Array.isArray(item.similar_species) ? item.similar_species : [],
        image: item.image || 'assets/images/birds/default-bird.webp',
      };
      await saveCustomBird(bird);
      importedBirds.push(bird);
    }

    return importedBirds;
  } catch (err) {
    throw new Error('Erreur de validation du Gabarit JSON Espèce : ' + (err as Error).message);
  }
}

