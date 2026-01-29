import { ONE_HOUR, TWENTY_FOUR_HOURS } from "@/utils/TimeUtils";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { PERSIST_KEY } from "./persistenceKey";
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

const asyncLocalStorage = {
  getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key: string, value: string) =>
    Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key: string) =>
    Promise.resolve(window.localStorage.removeItem(key)),
};

export function setupQueryPersistence() {
  if (typeof window === "undefined") return;
  const persister = createAsyncStoragePersister({
    storage: asyncLocalStorage,
    key: PERSIST_KEY,
  });
  persistQueryClient({
    queryClient,
    persister,
    maxAge: TWENTY_FOUR_HOURS, // keep persisted cache 24h
  });
}
