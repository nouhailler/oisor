import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Bird, Observation } from '../types/bird';

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
      console.warn('IndexedDB indisponible, activation du secours haute capacité (OPFS / Cache Storage API)', err);
      return null as unknown as IDBPDatabase<OiseauxDB>;
    });
  }
  return dbPromise;
}

// Keys & URNs for Secondary High-Capacity Fallback
const CACHE_STORE_NAME = 'oiseaux_opfs_fallback_v1';
const OBSERVATIONS_URI = 'https://local-oisor.internal/data/observations.json';
const CUSTOM_BIRDS_URI = 'https://local-oisor.internal/data/custom_birds.json';
const LOCAL_STORAGE_KEY = 'oiseaux_observations_backup';
const LOCAL_STORAGE_BIRDS_KEY = 'oiseaux_custom_birds_backup';

// --- High-Capacity Secondary Storage Fallback Engine (OPFS & Web Cache API) ---
// Note: Discards LocalStorage's 5MB quota limit in favor of GB origin storage!

async function getOPFSDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
    try {
      return await navigator.storage.getDirectory();
    } catch (e) {
      console.warn('OPFS indisponible:', e);
    }
  }
  return null;
}

async function saveOPFSFile(fileName: string, content: string): Promise<boolean> {
  const root = await getOPFSDirectory();
  if (root) {
    try {
      const fileHandle = await root.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (e) {
      console.warn('OPFS write error:', e);
    }
  }
  return false;
}

async function readOPFSFile(fileName: string): Promise<string | null> {
  const root = await getOPFSDirectory();
  if (root) {
    try {
      const fileHandle = await root.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (e) {
      // File not found
    }
  }
  return null;
}

async function saveCacheStorageData(uri: string, content: string): Promise<boolean> {
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_STORE_NAME);
      const response = new Response(content, {
        headers: { 'Content-Type': 'application/json' },
      });
      await cache.put(uri, response);
      return true;
    } catch (e) {
      console.warn('Cache Storage write error:', e);
    }
  }
  return false;
}

async function readCacheStorageData(uri: string): Promise<string | null> {
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_STORE_NAME);
      const response = await cache.match(uri);
      if (response) {
        return await response.text();
      }
    } catch (e) {
      console.warn('Cache Storage read error:', e);
    }
  }
  return null;
}

async function getFallbackObservations(): Promise<Observation[]> {
  // 1. Try OPFS
  const opfs = await readOPFSFile('observations.json');
  if (opfs) {
    try { return JSON.parse(opfs); } catch {}
  }

  // 2. Try Web Cache Storage API
  const cache = await readCacheStorageData(OBSERVATIONS_URI);
  if (cache) {
    try { return JSON.parse(cache); } catch {}
  }

  // 3. Legacy LocalStorage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveFallbackObservations(obsList: Observation[]): Promise<void> {
  const json = JSON.stringify(obsList);
  const opfsOk = await saveOPFSFile('observations.json', json);
  const cacheOk = await saveCacheStorageData(OBSERVATIONS_URI, json);

  if (!opfsOk && !cacheOk) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, json);
    } catch (e) {
      console.warn('Erreur de quota LocalStorage en fallback:', e);
    }
  }
}

// --- Public Observations API ---

export async function getAllObservations(): Promise<Observation[]> {
  try {
    const db = await getDB();
    if (db) {
      const items = await db.getAllFromIndex('observations', 'by-date');
      return items.sort((a, b) => b.created_at - a.created_at);
    }
  } catch (e) {
    console.warn('Lecture IndexedDB échouée, bascule vers le stockage de secours Haute Capacité:', e);
  }
  const fallback = await getFallbackObservations();
  return fallback.sort((a, b) => b.created_at - a.created_at);
}

export async function saveObservation(obs: Observation): Promise<Observation> {
  let dbSuccess = false;
  try {
    const db = await getDB();
    if (db) {
      await db.put('observations', obs);
      dbSuccess = true;
    }
  } catch (e) {
    console.warn('Écriture IndexedDB échouée, secours OPFS / Cache Storage activé:', e);
  }

  // Synchronize high-capacity backup engine
  const current = await getFallbackObservations();
  const filtered = current.filter((item) => item.id !== obs.id);
  filtered.push(obs);
  await saveFallbackObservations(filtered);

  return obs;
}

export async function deleteObservation(id: string): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.delete('observations', id);
    }
  } catch (e) {
    console.warn('Suppression IndexedDB échouée:', e);
  }

  const current = await getFallbackObservations();
  const filtered = current.filter((item) => item.id !== id);
  await saveFallbackObservations(filtered);
}

// --- Import / Export Handlers ---

export function exportToJSON(observations: Observation[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(observations, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `observations_oiseaux_${new Date().toISOString().split('T')[0]}.json`);
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
      obs.created_at,
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

// --- Custom Bird Species High-Capacity Storage ---

async function getFallbackCustomBirds(): Promise<Bird[]> {
  const opfs = await readOPFSFile('custom_birds.json');
  if (opfs) {
    try { return JSON.parse(opfs); } catch {}
  }

  const cache = await readCacheStorageData(CUSTOM_BIRDS_URI);
  if (cache) {
    try { return JSON.parse(cache); } catch {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BIRDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveFallbackCustomBirds(birds: Bird[]): Promise<void> {
  const json = JSON.stringify(birds);
  const opfsOk = await saveOPFSFile('custom_birds.json', json);
  const cacheOk = await saveCacheStorageData(CUSTOM_BIRDS_URI, json);

  if (!opfsOk && !cacheOk) {
    try {
      localStorage.setItem(LOCAL_STORAGE_BIRDS_KEY, json);
    } catch (e) {
      console.warn('Erreur quota LocalStorage custom birds:', e);
    }
  }
}

export async function getCustomBirds(): Promise<Bird[]> {
  try {
    const db = await getDB();
    if (db && db.objectStoreNames.contains('custom_birds')) {
      return await db.getAll('custom_birds');
    }
  } catch (e) {
    console.warn('Erreur lecture custom_birds IndexedDB:', e);
  }
  return getFallbackCustomBirds();
}

export async function saveCustomBird(bird: Bird): Promise<Bird> {
  try {
    const db = await getDB();
    if (db && db.objectStoreNames.contains('custom_birds')) {
      await db.put('custom_birds', bird);
    }
  } catch (e) {
    console.warn('Erreur écriture custom_birds IndexedDB:', e);
  }

  const current = await getFallbackCustomBirds();
  const filtered = current.filter((b) => b.id !== bird.id);
  filtered.push(bird);
  await saveFallbackCustomBirds(filtered);

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

// --- Storage Quota Monitor API ---

export interface StorageEstimate {
  usageMB: string;
  quotaGB: string;
  percentUsed: string;
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = (estimate.usage || 0) / (1024 * 1024);
      const quota = (estimate.quota || 0) / (1024 * 1024 * 1024);
      const percent = estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0;

      return {
        usageMB: usage.toFixed(2),
        quotaGB: quota.toFixed(1),
        percentUsed: percent.toFixed(2),
      };
    } catch (e) {
      console.warn('Storage estimate indisponible:', e);
    }
  }
  return null;
}
