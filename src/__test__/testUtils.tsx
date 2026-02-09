import React, { type ReactElement, type ReactNode } from "react";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { LocaleProvider } from "@/i18n/locale";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

function createWrapper(options: WrapperOptions = {}) {
  const {
    initialEntries = ["/"],
    queryClient = createTestQueryClient(),
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <LocaleProvider>{children}</LocaleProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

export function renderWithProviders(
  ui: ReactElement,
  options: WrapperOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  const { initialEntries, queryClient, ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ initialEntries, queryClient }),
    ...renderOptions,
  });
}

export function renderHookWithProviders<TResult>(
  hook: () => TResult,
  options: WrapperOptions = {},
) {
  return renderHook(hook, {
    wrapper: createWrapper(options),
  });
}
