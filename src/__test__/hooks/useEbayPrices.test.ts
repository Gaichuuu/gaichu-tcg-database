import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../testUtils";
import { useEbayPrices, type EbayPriceData } from "@/hooks/useEbayPrices";

function mockFetchResponse(data: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
      }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useEbayPrices", () => {
  it("returns data on successful fetch for ash series", async () => {
    const mockData: EbayPriceData = {
      average_price: 12.5,
      median_price: 10.0,
      min_price: 5.0,
      max_price: 25.0,
      sample_size: 10,
      last_updated: "2026-02-08T00:00:00Z",
      ebay_search_url: "https://ebay.com/search",
    };

    mockFetchResponse({ success: true, data: mockData });

    const { result } = renderHookWithProviders(() =>
      useEbayPrices("card-123", "ash"),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it("returns data on successful fetch for wm series", async () => {
    const mockData: EbayPriceData = {
      average_price: 8.75,
      median_price: 8.0,
      min_price: 3.0,
      max_price: 15.0,
      sample_size: 5,
      last_updated: "2026-02-08T00:00:00Z",
    };

    mockFetchResponse({ success: true, data: mockData });

    const { result } = renderHookWithProviders(() =>
      useEbayPrices("card-456", "wm"),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it("returns null on 404 response", async () => {
    mockFetchResponse({ success: false, data: null }, 404);

    const { result } = renderHookWithProviders(() =>
      useEbayPrices("card-789", "ash"),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it("does not fetch for non-supported series", () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHookWithProviders(() =>
      useEbayPrices("card-999", "mz"),
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when cardId is empty string", () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHookWithProviders(() => useEbayPrices("", "ash"));

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("throws on non-404 error response", async () => {
    mockFetchResponse({ success: false, data: null }, 500);

    const { result } = renderHookWithProviders(() =>
      useEbayPrices("card-error", "ash"),
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 },
    );

    expect(result.current.error?.message).toContain("Failed to fetch prices");
  });

  it("does not fetch when both cardId is empty and series is unsupported", () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHookWithProviders(() => useEbayPrices("", "mz"));

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
