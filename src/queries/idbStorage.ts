export interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const DB_NAME = "gaichu-cache";
const STORE = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = op(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const localStorageFallback: AsyncStorage = {
  getItem: async (key) => window.localStorage.getItem(key),
  setItem: async (key, value) => window.localStorage.setItem(key, value),
  removeItem: async (key) => window.localStorage.removeItem(key),
};

export function createIdbStorage(): AsyncStorage {
  if (typeof indexedDB === "undefined") return localStorageFallback;

  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => {
    dbPromise ??= openDb().catch((err) => {
      dbPromise = null;
      throw err;
    });
    return dbPromise;
  };

  return {
    getItem: async (key) =>
      ((await run(await db(), "readonly", (s) => s.get(key))) as
        | string
        | undefined) ?? null,
    setItem: async (key, value) => {
      await run(await db(), "readwrite", (s) => s.put(value, key));
    },
    removeItem: async (key) => {
      await run(await db(), "readwrite", (s) => s.delete(key));
    },
  };
}
