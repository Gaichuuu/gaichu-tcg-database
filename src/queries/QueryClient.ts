import { ONE_HOUR, TWENTY_FOUR_HOURS } from "@/utils/TimeUtils";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { PERSIST_KEY } from "./persistenceKey";
import { createIdbStorage } from "./idbStorage";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TWENTY_FOUR_HOURS,
      gcTime: ONE_HOUR,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

export function setupQueryPersistence() {
  if (typeof window === "undefined") return;

  const usesIndexedDb = typeof indexedDB !== "undefined";
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith("gaichu-query-cache-")) continue;
      if (!usesIndexedDb && key === PERSIST_KEY) continue;
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.error("Failed to clear legacy query cache from localStorage", err);
  }

  const persister = createAsyncStoragePersister({
    storage: createIdbStorage(),
    key: PERSIST_KEY,
    throttleTime: 3000,
  });
  persistQueryClient({
    queryClient,
    persister,
    maxAge: TWENTY_FOUR_HOURS, // keep persisted cache 24h
  });
}
