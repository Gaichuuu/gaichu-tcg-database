import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import SeriesList from "@/components/ListComponent/SeriesListComponent";
import type { SeriesAndSet } from "@/types/MergedCollection";

const makeSeries = (
  short: string,
  name: string,
  setCount: number,
  name_ja?: string,
): SeriesAndSet =>
  ({
    series: {
      id: short,
      short_name: short,
      name,
      name_ja,
      logo: `https://gaichu.b-cdn.net/${short}/logo.png`,
      sort_by: 1,
    },
    sets: Array.from({ length: setCount }, (_, i) => ({ id: `${short}-${i}` })),
  }) as unknown as SeriesAndSet;

const renderList = (series: SeriesAndSet[]) =>
  render(
    <MemoryRouter>
      <SeriesList series={series} />
    </MemoryRouter>,
  );

describe("SeriesList", () => {
  it("links each tile to its series page", () => {
    renderList([makeSeries("wm", "WrennyMoo", 3, "レニムー")]);
    expect(screen.getByRole("link", { name: /WrennyMoo/ })).toHaveAttribute(
      "href",
      "/cards/wm",
    );
  });

  it("pluralises the release count", () => {
    renderList([
      makeSeries("mz", "MetaZoo", 1),
      makeSeries("ash", "After Skool Hobby", 4),
    ]);
    expect(screen.getByText("1 release")).toBeInTheDocument();
    expect(screen.getByText("4 releases")).toBeInTheDocument();
  });

  it("shows the Japanese name only when the series has one", () => {
    renderList([
      makeSeries("wm", "WrennyMoo", 3, "レニムー"),
      makeSeries("mz", "MetaZoo", 1),
    ]);
    expect(screen.getByText("レニムー")).toBeInTheDocument();
    expect(screen.getAllByText(/[゠-ヿ]/)).toHaveLength(1);
  });

  it("serves a resized CDN logo", () => {
    const { container } = renderList([makeSeries("wm", "WrennyMoo", 3)]);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://gaichu.b-cdn.net/wm/logo.png?width=480",
    );
  });

  it("shows an empty state when there are no series", () => {
    renderList([]);
    expect(screen.getByText("No series found.")).toBeInTheDocument();
  });
});
