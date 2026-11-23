import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { searchSold, TrawlError, resetThrottle } from "./trawlClient.js";

const json = (
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

beforeEach(() => resetThrottle());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("searchSold", () => {
  it("sends the key in a header, never the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json(200, {
        count: 0,
        credits_charged: 0,
        next_cursor: null,
        results: [],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await searchSold(
      {
        query: "tygadu anya",
        exclude: "lot",
        category: "183454",
        dateFrom: "2026-08-01",
      },
      "sk_test",
    );

    const [url, init] = fetchMock.mock.calls[0];
    const u = new URL(url as string);
    expect(u.host).toBe("ebay-average-selling-price.p.rapidapi.com");
    expect(u.pathname).toBe("/search");
    expect(u.searchParams.get("page")).toBe("1");
    expect(u.searchParams.get("limit")).toBe("100");
    expect(u.searchParams.get("query")).toBe("tygadu anya");
    expect(u.searchParams.get("exclude")).toBe("lot");
    expect(u.searchParams.get("category")).toBe("183454");
    expect(u.searchParams.get("date_from")).toBe("2026-08-01");
    expect(u.searchParams.get("site")).toBe("EBAY_US");
    expect(u.toString()).not.toContain("sk_test");
    expect((init as RequestInit).headers).toEqual({
      "x-rapidapi-host": "ebay-average-selling-price.p.rapidapi.com",
      "x-rapidapi-key": "sk_test",
    });
  });

  it("pages until a short page, capped at maxPages", async () => {
    const full = Array.from({ length: 100 }, (_, i) => ({
      item_id: String(i),
    }));
    const page = (results: unknown[]) =>
      json(200, { page: 1, count: results.length, results });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(full))
      .mockResolvedValueOnce(page(full.slice(0, 7)))
      .mockResolvedValue(page(full));
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchSold({ query: "x", maxPages: 5 }, "k");
    expect(results).toHaveLength(107);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const pages = fetchMock.mock.calls.map(([u]) =>
      new URL(u as string).searchParams.get("page"),
    );
    expect(pages).toEqual(["1", "2"]);
  });

  it("stops at maxPages even when pages stay full", async () => {
    const full = Array.from({ length: 100 }, (_, i) => ({
      item_id: String(i),
    }));
    const fetchMock = vi
      .fn()
      .mockImplementation(async () =>
        json(200, { page: 1, count: 100, results: full }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await searchSold({ query: "x" }, "k");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats a 200 with no matches as an empty result, not an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(200, {
          count: 0,
          credits_charged: 0,
          next_cursor: null,
          results: [],
        }),
      ),
    );
    await expect(searchSold({ query: "nothing" }, "k")).resolves.toEqual([]);
  });

  it("surfaces RapidAPI's message on a non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          json(403, { message: "You are not subscribed to this API." }),
        ),
    );
    await expect(searchSold({ query: "x" }, "k")).rejects.toThrow(
      /not subscribed/,
    );
  });

  it("surfaces the API's error field on a non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json(400, { error: "exclude overlaps query" })),
    );
    await expect(searchSold({ query: "x" }, "k")).rejects.toThrow(
      /exclude overlaps query/,
    );
  });

  it("retries RapidAPI's per-second 429 (no Retry-After) with backoff", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        json(429, {
          message:
            "You have exceeded the rate limit per second for your plan, PRO, by the API provider",
        }),
      )
      .mockResolvedValueOnce(json(200, { page: 1, count: 0, results: [] }));
    vi.stubGlobal("fetch", fetchMock);
    const p = searchSold({ query: "x" }, "k");
    await vi.advanceTimersByTimeAsync(5000);
    await expect(p).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("retries a rate-limit 429 with Retry-After", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        json(429, { error: "slow down" }, { "retry-after": "1" }),
      )
      .mockResolvedValueOnce(
        json(200, {
          count: 0,
          credits_charged: 0,
          next_cursor: null,
          results: [],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const p = searchSold({ query: "x" }, "k");
    await vi.advanceTimersByTimeAsync(5000);
    await expect(p).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("does not retry a 429 without Retry-After (quota spent)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(json(429, { error: "monthly credits exhausted" }));
    vi.stubGlobal("fetch", fetchMock);
    const err = await searchSold({ query: "x" }, "k").catch((e) => e);
    expect(err).toBeInstanceOf(TrawlError);
    expect((err as TrawlError).status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
