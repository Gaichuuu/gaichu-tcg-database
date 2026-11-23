import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/__test__/testUtils";
import PriceStatsTable from "@/components/CardDetail/PriceStatsTable";
import type { EbayPriceData } from "@/hooks/useEbayPrices";

const EBAY_URL = "https://www.ebay.com/sch/i.html?_nkw=charizard";

const priceData = (over: Partial<EbayPriceData> = {}): EbayPriceData => ({
  average_price: 20,
  median_price: 20,
  min_price: 10,
  max_price: 30,
  sample_size: 3,
  last_updated: new Date().toISOString(),
  last_sale_date: null,
  ebay_search_url: EBAY_URL,
  ...over,
});

const noSales = priceData({
  average_price: null,
  median_price: null,
  min_price: null,
  max_price: null,
  sample_size: 0,
});

describe("PriceStatsTable", () => {
  it("shows sales stats and the eBay link when there are recent sales", () => {
    renderWithProviders(
      <PriceStatsTable
        data={priceData()}
        isLoading={false}
        error={false}
        priced
      />,
    );
    expect(screen.getByText("TOTAL SALES")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View on eBay" })).toHaveAttribute(
      "href",
      EBAY_URL,
    );
  });

  it("keeps the last known price and eBay link when no sales are in the window", () => {
    renderWithProviders(
      <PriceStatsTable
        data={noSales}
        isLoading={false}
        error={false}
        priced
        lastKnownPrice={50}
      />,
    );
    expect(screen.getByText("LAST KNOWN")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(
      screen.getByText("No sales in the last 90 days"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View on eBay" })).toHaveAttribute(
      "href",
      EBAY_URL,
    );
  });

  it("omits the last known line when there is no prior price", () => {
    renderWithProviders(
      <PriceStatsTable data={noSales} isLoading={false} error={false} priced />,
    );
    expect(screen.queryByText("LAST KNOWN")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View on eBay" }),
    ).toBeInTheDocument();
  });

  it("still shows the last known price when the price API fails", () => {
    renderWithProviders(
      <PriceStatsTable
        data={null}
        isLoading={false}
        error
        priced
        lastKnownPrice={12.5}
      />,
    );
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("No price data available")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View on eBay" })).toBeNull();
  });
});
