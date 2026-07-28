import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface PilotConfig {
  enabled: boolean;
  businessId: string;
}

const CACHE_KEY = 'pilot_config';
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry {
  data: PilotConfig;
  timestamp: number;
}

function readCache(): PilotConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(config: PilotConfig): void {
  const entry: CacheEntry = { data: config, timestamp: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

export function isDininggasanPilot(config: PilotConfig | null): boolean {
  return config?.enabled === true && config?.businessId === 'dininggasan-catarman';
}

export async function getPilotConfig(): Promise<PilotConfig> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const snap = await getDoc(doc(db, 'system', 'pilot'));
    if (snap.exists()) {
      const data = snap.data() as PilotConfig;
      const config: PilotConfig = { enabled: data.enabled ?? false, businessId: data.businessId ?? '' };
      writeCache(config);
      return config;
    }
    return { enabled: false, businessId: '' };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'system/pilot');
    return { enabled: false, businessId: '' };
  }
}
