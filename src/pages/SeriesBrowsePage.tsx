import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSets, useSeriesByShortName } from "@/hooks/useCollection";
import { PageError, PageNotFound } from "@/components/PageStates";
import CardList, {
  type GridItem,
} from "@/components/ListComponent/CardListComponent";
import {
  CARD_WIDTHS,
  CARD_RADII,
  type CardDensity,
} from "@/components/ListComponent/cardDensity";
import { Button, SegmentedControl } from "@/components/ui";
import { FiSliders } from "react-icons/fi";
import SeriesMasthead from "@/components/browse/SeriesMasthead";
import FilterSidebar from "@/components/browse/FilterSidebar";
import FilterChips from "@/components/browse/FilterChips";
import {
  flattenSeriesCards,
  collectVariants,
  collectRarities,
  filterCards,
  sortCards,
  comparePrices,
  inPriceRange,
  type BrowseFilters,
  type SortKey,
} from "@/utils/cardFilters";
import {
  getSetListPath,
  getCardDetailPath,
  getArtPath,
  SetImagePathType,
} from "@/utils/RoutePathBuildUtils";
import type { CollectionSet } from "@/types/CollectionSet";
import {
  navigateWithTransition,
  withViewTransition,
} from "@/utils/viewTransition";

const DENSITY_KEY = "gaichu.browse.density";

function readDensity(): CardDensity {
  try {
    const v = sessionStorage.getItem(DENSITY_KEY);
    return v === "s" || v === "m" || v === "l" ? v : "m";
  } catch (err) {
    console.warn("Grid density preference unavailable:", err);
    return "m";
  }
}
function writeDensity(d: CardDensity): void {
  try {
    sessionStorage.setItem(DENSITY_KEY, d);
  } catch (err) {
    console.warn("Couldn't save grid density preference:", err);
  }
}

const SeriesBrowsePage: React.FC = () => {
  const { seriesShortName = "", setShortName } = useParams();
  const series = decodeURIComponent(seriesShortName);
  const activeSetShort = setShortName ? decodeURIComponent(setShortName) : null;

  const { data: setsData, isLoading, error } = useSets(series);
  const { data: seriesMeta } = useSeriesByShortName(series);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [density, setDensityState] = useState<CardDensity>(readDensity);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const setDensity = (d: CardDensity) => {
    writeDensity(d);
    withViewTransition(() => setDensityState(d));
  };

  const variant = searchParams.get("variant");
  const rarity = searchParams.get("rarity");
  const sort = (searchParams.get("sort") as SortKey) || "number";
  const q = searchParams.get("q") ?? "";
  const numParam = (key: string): number | null => {
    const v = searchParams.get(key);
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const minPrice = numParam("minPrice");
  const maxPrice = numParam("maxPrice");

  const patchQuery = (patch: Record<string, string | null>) => {
    const apply = () =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === "") next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      );
    const TYPED = ["q", "minPrice", "maxPrice"];
    const typing = Object.keys(patch).every((k) => TYPED.includes(k));
    if (typing) apply();
    else navigateWithTransition(apply);
  };

  const allSets = useMemo(() => setsData ?? [], [setsData]);
  const allCards = useMemo(() => flattenSeriesCards(allSets), [allSets]);
  const variants = useMemo(() => collectVariants(allCards), [allCards]);
  const rarities = useMemo(() => collectRarities(allCards), [allCards]);

  const defaultSetIds = useMemo(
    () => allSets.filter((s) => !s.set.default_hidden).map((s) => s.set.id),
    [allSets],
  );

  const activeSet = activeSetShort
    ? allSets.find((s) => s.set.short_name === activeSetShort)?.set
    : undefined;
  const setNotFound = !!activeSetShort && !!setsData && !activeSet;

  const selectedSetIds = useMemo(() => {
    const param = searchParams.get("sets");
    if (param === "-") return [];
    if (param) {
      const shorts = param.split(",").filter(Boolean);
      return allSets
        .filter((s) => shorts.includes(s.set.short_name))
        .map((s) => s.set.id);
    }
    if (activeSet) return [activeSet.id];
    return defaultSetIds;
  }, [searchParams, allSets, activeSet, defaultSetIds]);

  const writeSelection = (ids: string[]) => {
    const shorts = allSets
      .filter((s) => ids.includes(s.set.id))
      .map((s) => s.set.short_name);
    const next = new URLSearchParams(searchParams);
    next.set("sets", shorts.length ? shorts.join(",") : "-");
    navigateWithTransition(() =>
      navigate(`${getSetListPath(series)}?${next.toString()}`, {
        replace: true,
      }),
    );
  };
  const toggleSet = (id: string) =>
    writeSelection(
      selectedSetIds.includes(id)
        ? selectedSetIds.filter((x) => x !== id)
        : [...selectedSetIds, id],
    );

  const filteredCards = useMemo(() => {
    const filters: BrowseFilters = {
      setIds: selectedSetIds,
      variant,
      rarity,
      minPrice,
      maxPrice,
      q,
    };
    return filterCards(allCards, filters);
  }, [allCards, selectedSetIds, variant, rarity, minPrice, maxPrice, q]);

  const gridItems = useMemo<GridItem[]>(() => {
    const selectedSets = allSets
      .filter((s) => selectedSetIds.includes(s.set.id))
      .sort((a, b) => a.set.sort_by - b.set.sort_by);
    const showPack = (set: CollectionSet) =>
      !!set.pack_art &&
      inPriceRange(set.pack_average_price, { minPrice, maxPrice });

    if (sort === "number") {
      const items: GridItem[] = [];
      const placed = new Set<string>();
      for (const { set } of selectedSets) {
        const setCards = sortCards(
          filteredCards.filter(
            (c) => !placed.has(c.id) && (c.set_ids ?? []).includes(set.id),
          ),
          "number",
        );
        if (setCards.length === 0) continue;
        if (showPack(set)) items.push({ type: "pack-art", set });
        for (const card of setCards) {
          items.push({ type: "card", card });
          placed.add(card.id);
        }
      }
      return items;
    }

    const packs: GridItem[] =
      filteredCards.length > 0
        ? selectedSets
            .filter(({ set }) => showPack(set))
            .map(({ set }) => ({ type: "pack-art", set }))
        : [];
    const cards: GridItem[] = sortCards(filteredCards, sort).map((card) => ({
      type: "card",
      card,
    }));

    if (sort === "price-asc" || sort === "price-desc") {
      const priceOfItem = (item: GridItem) =>
        item.type === "card"
          ? item.card.average_price
          : item.set.pack_average_price;
      return [...packs, ...cards].sort((a, b) =>
        comparePrices(priceOfItem(a), priceOfItem(b), sort),
      );
    }
    return [...packs, ...cards];
  }, [allSets, selectedSetIds, filteredCards, sort, minPrice, maxPrice]);

  const resetFilters = () => {
    navigateWithTransition(() =>
      navigate(getSetListPath(series), { replace: true }),
    );
  };

  const openPackArt = (set: CollectionSet) =>
    navigate(getArtPath(set, SetImagePathType.PackArt));

  const chips = [
    variant && {
      key: "variant",
      label: `Variant: ${variant}`,
      onClear: () => patchQuery({ variant: null }),
    },
    rarity && {
      key: "rarity",
      label: `Rarity: ${rarity}`,
      onClear: () => patchQuery({ rarity: null }),
    },
    minPrice != null && {
      key: "minPrice",
      label: `Min $${minPrice}`,
      onClear: () => patchQuery({ minPrice: null }),
    },
    maxPrice != null && {
      key: "maxPrice",
      label: `Max $${maxPrice}`,
      onClear: () => patchQuery({ maxPrice: null }),
    },
    q && {
      key: "q",
      label: `Find: ${q}`,
      onClear: () => patchQuery({ q: null }),
    },
  ].filter(Boolean) as { key: string; label: string; onClear: () => void }[];

  if (error) return <PageError message="Failed to load series." />;
  if (setNotFound) return <PageNotFound message="Set not found." />;

  const seriesName = seriesMeta?.series.name;
  const pageTitle = activeSet
    ? `${activeSet.name} - ${seriesName ?? series} - Gaichu`
    : seriesName
      ? `${seriesName} - Gaichu`
      : "Gaichu";
  const pageDescription =
    activeSet?.description ||
    seriesMeta?.series.description ||
    `Browse all ${seriesName ?? ""} cards on Gaichu.`;
  const pageImage = activeSet?.logo || seriesMeta?.series.logo;

  return (
    <div className="container mx-auto p-0">
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}

      {seriesMeta && <SeriesMasthead series={seriesMeta.series} />}

      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-7">
        <div className="lg:w-64 lg:shrink-0">
          <Button
            variant={filtersOpen ? "primary" : "ghost"}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="browse-filters"
            className="gap-2 lg:hidden"
          >
            <FiSliders aria-hidden className="size-3.5" />
            {filtersOpen ? "Hide filters" : "Filters"}
            {chips.length > 0 && (
              <span className="font-display">({chips.length})</span>
            )}
          </Button>
          <div
            id="browse-filters"
            className={`${filtersOpen ? "anim-unroll mt-3" : "hidden"} lg:mt-0 lg:block`}
          >
            {isLoading && !setsData ? (
              <div className="bg-secondaryBorder h-96 w-full animate-pulse" />
            ) : (
              <FilterSidebar
                sets={allSets}
                selectedSetIds={selectedSetIds}
                onToggleSet={toggleSet}
                variants={variants}
                variant={variant}
                onVariant={(v) => patchQuery({ variant: v })}
                rarities={rarities}
                rarity={rarity}
                onRarity={(v) => patchQuery({ rarity: v })}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPrice={(n) =>
                  patchQuery({ minPrice: n != null ? String(n) : null })
                }
                onMaxPrice={(n) =>
                  patchQuery({ maxPrice: n != null ? String(n) : null })
                }
                sort={sort}
                onSort={(s) => patchQuery({ sort: s === "number" ? null : s })}
                q={q}
                onQ={(val) => patchQuery({ q: val })}
                onReset={resetFilters}
              />
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="border-bevelShadow2 flex flex-wrap items-center justify-between gap-3 border-b border-dashed pb-3">
            <p className="flex items-baseline gap-2.5">
              <span className="font-display text-primaryText text-lg">
                {filteredCards.length}
              </span>
              <span className="font-display text-mutedLabel text-[13px]">
                / {allCards.length}
              </span>
              <span className="sr-only">cards</span>
              <span
                className="font-jp text-accentAmber text-xs"
                lang="ja"
                aria-hidden
              >
                枚
              </span>
            </p>
            <SegmentedControl
              ariaLabel="card density"
              options={[
                { value: "s", label: "S" },
                { value: "m", label: "M" },
                { value: "l", label: "L" },
              ]}
              value={density}
              onChange={(d) => setDensity(d as CardDensity)}
            />
          </div>

          <FilterChips chips={chips} />

          {isLoading && !setsData ? (
            <div
              className="grid gap-x-2.5 gap-y-3.5"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTHS[density]}, 1fr))`,
              }}
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className={`bg-secondaryBorder aspect-[2.5/3.5] w-full animate-pulse ${CARD_RADII[density]}`}
                />
              ))}
            </div>
          ) : selectedSetIds.length === 0 ? (
            <div className="text-secondaryText py-12 text-center">
              No sets selected. Tick a set in the filters to see its cards.
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-secondaryText py-12 text-center">
              No cards match these filters.
            </div>
          ) : (
            <CardList
              items={gridItems}
              transitionNames={gridItems.length <= 100}
              onClick={(card) =>
                navigateWithTransition(() => navigate(getCardDetailPath(card)))
              }
              onOpenPackArt={openPackArt}
              density={density}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesBrowsePage;
