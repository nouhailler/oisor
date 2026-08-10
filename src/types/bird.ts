export type SizeCategory = 'très-petit' | 'petit' | 'moyen' | 'grand' | 'très-grand';
export type BeakType = 'court-fin' | 'conique' | 'crochu' | 'long' | 'plat';
export type SeasonType = 'toute-annee' | 'printemps-ete' | 'hiver' | 'migration';

export interface Bird {
  id: string;
  name_common: string;
  name_latin: string;
  family: string;
  habitat: string[];
  size_category: SizeCategory;
  size_cm: string;
  main_colors: string[];
  beak_type: BeakType;
  wingspan_cm: string;
  seasons: SeasonType[];
  description: string;
  diet: string;
  similar_species: string[];
  image: string;
}

export interface IdentificationFilters {
  size_category: SizeCategory | null;
  colors: string[];
  beak_type: BeakType | null;
  habitat: string | null;
}

export interface Observation {
  id: string;
  bird_id: string;
  bird_name: string;
  bird_latin?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  count: number;
  notes?: string;
  created_at: number;
}
