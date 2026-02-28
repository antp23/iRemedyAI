import { openDB, type IDBPDatabase } from 'idb';
import type { DrugProduct } from '@/types';

const DB_NAME = 'iremedy-ai';
const STORE_NAME = 'products';
const DB_VERSION = 1;

// In-memory fallback when IndexedDB is unavailable
let memoryStore: Map<string, DrugProduct> | null = null;
let dbInstance: IDBPDatabase | null = null;

function useMemoryFallback(): Map<string, DrugProduct> {
  if (!memoryStore) {
    memoryStore = new Map();
  }
  return memoryStore;
}

/**
 * Initialize the IndexedDB database.
 * Falls back to an in-memory Map if IndexedDB is unavailable.
 */
export async function initDB(): Promise<IDBPDatabase | null> {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
    return dbInstance;
  } catch {
    console.warn('IndexedDB unavailable, falling back to in-memory storage');
    useMemoryFallback();
    return null;
  }
}

/**
 * Save a single product to the database.
 */
export async function saveProduct(product: DrugProduct): Promise<void> {
  const db = await initDB();
  if (db) {
    await db.put(STORE_NAME, product);
  } else {
    useMemoryFallback().set(product.id, product);
  }
}

/**
 * Save multiple products to the database in a single transaction.
 */
export async function saveProducts(products: DrugProduct[]): Promise<void> {
  const db = await initDB();
  if (db) {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all([
      ...products.map(p => tx.store.put(p)),
      tx.done,
    ]);
  } else {
    const store = useMemoryFallback();
    for (const product of products) {
      store.set(product.id, product);
    }
  }
}

/**
 * Get a single product by ID.
 */
export async function getProduct(id: string): Promise<DrugProduct | undefined> {
  const db = await initDB();
  if (db) {
    return db.get(STORE_NAME, id);
  }
  return useMemoryFallback().get(id);
}

/**
 * Get all products from the database.
 */
export async function getAllProducts(): Promise<DrugProduct[]> {
  const db = await initDB();
  if (db) {
    return db.getAll(STORE_NAME);
  }
  return Array.from(useMemoryFallback().values());
}

/**
 * Delete a single product by ID.
 */
export async function deleteProduct(id: string): Promise<void> {
  const db = await initDB();
  if (db) {
    await db.delete(STORE_NAME, id);
  } else {
    useMemoryFallback().delete(id);
  }
}

/**
 * Clear all products from the database.
 */
export async function clearAll(): Promise<void> {
  const db = await initDB();
  if (db) {
    await db.clear(STORE_NAME);
  } else {
    useMemoryFallback().clear();
  }
}

/**
 * Reset internal state (for testing).
 */
export function _resetForTesting(): void {
  dbInstance = null;
  memoryStore = null;
}
