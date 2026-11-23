import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { useCardSearch } from "@/hooks/useCardSearch";
import { getCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { formatUsd } from "@/utils/money";
import { highlightMatch } from "@/utils/highlightMatch";
import { t, useLocale } from "@/i18n";
import type { CollectionCard } from "@/types/CollectionCard";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";
import { navigateWithTransition } from "@/utils/viewTransition";

const SKELETON_COUNT = 3;

const CardSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLocale();
  const [searchEngaged, setSearchEngaged] = useState(false);
  const engageSearch = useCallback(() => setSearchEngaged(true), []);
  const { results, isLoading, debouncedQuery } = useCardSearch(
    query,
    searchEngaged || query.length > 0,
  );

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setQuery("");
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current?.contains(target)) return;
      if (mobileContainerRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim() && results.length > 0) {
      setIsOpen(true);
    }
  }, [results, debouncedQuery]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  useEffect(() => {
    if (activeIndex >= 0) {
      document
        .getElementById(`card-search-result-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => mobileInputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navigateToCard = useCallback(
    (card: CollectionCard) => {
      navigateWithTransition(() => navigate(getCardDetailPath(card)));
      setIsOpen(false);
      setQuery("");
      setMobileOpen(false);
      inputRef.current?.blur();
      mobileInputRef.current?.blur();
    },
    [navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        if (mobileOpen) {
          closeMobile();
        } else {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigateToCard(results[activeIndex]);
        }
        break;
    }
  };

  const hasQuery = isOpen && !!debouncedQuery.trim();
  const showLoading = hasQuery && results.length === 0 && isLoading;
  const showNoResults = hasQuery && results.length === 0 && !isLoading;
  const showResults = isOpen && results.length > 0;

  const inputClasses =
    "min-w-0 flex-1 h-5 leading-5 bg-transparent text-accentGreen placeholder:text-accentGreen/50 font-display text-base sm:text-sm outline-none";

  const wrapperClasses =
    "bg-insetBg border-tileBorder shadow-inset relative flex items-center gap-2 border-2 px-3 py-1.25";

  const dropdownClasses =
    "tile absolute left-0 right-0 top-full z-50 mt-1 shadow-[6px_6px_0_rgba(0,0,0,0.6)]";

  const panelHeader = (count?: number) => (
    <div className="border-bevelShadow2 flex items-baseline justify-between border-b border-dashed px-3 pt-2 pb-1.5">
      <span className="font-jp text-accentAmber text-xs" lang="ja">
        検索結果
        <span className="sr-only">Search results</span>
      </span>
      {count != null && (
        <span className="font-display text-mutedLabel text-[11px]">
          {count} {count === 1 ? "card" : "cards"}
        </span>
      )}
    </div>
  );

  const renderDropdown = () => (
    <>
      {showLoading && (
        <div className={`${dropdownClasses} overflow-hidden`}>
          {panelHeader()}
          <div className="py-1">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1.75">
                <div className="bg-secondaryBorder size-12 shrink-0 animate-pulse rounded-[3px]" />
                <div className="flex-1 space-y-1.5">
                  <div className="bg-secondaryBorder h-3.5 w-3/4 animate-pulse" />
                  <div className="bg-secondaryBorder h-3 w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNoResults && (
        <div
          className={`${dropdownClasses} text-secondaryText px-3 py-4.5 text-center text-[13px]`}
        >
          No results for “{debouncedQuery.trim()}”.
        </div>
      )}

      {showResults && (
        <div key={debouncedQuery} className={`${dropdownClasses} anim-settle`}>
          {panelHeader(results.length)}
          <ul
            id="card-search-results"
            role="listbox"
            className="max-h-98 overflow-y-auto py-1"
          >
            {results.map((card, index) => {
              const active = index === activeIndex;
              const name = t(card.name, locale);
              const parts = highlightMatch(name, debouncedQuery);
              return (
                <li
                  key={`${card.series_short_name}-${card.set_short_name}-${card.sort_by}`}
                  id={`card-search-result-${index}`}
                  role="option"
                  aria-selected={active}
                  onClick={() => navigateToCard(card)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-1.75 ${
                    active ? "bg-tileBg" : ""
                  }`}
                >
                  {card.thumb ? (
                    <img
                      src={cdnResized(card.thumb, CDN_WIDTH.thumb)}
                      alt=""
                      className="border-secondaryBorder size-12 shrink-0 rounded-[3px] border object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="bg-secondaryBorder size-12 shrink-0 rounded-[3px]" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-primaryText truncate text-sm font-medium">
                      {parts.pre}
                      {parts.match && (
                        <mark className="bg-accentAmber text-mainBg px-px font-bold">
                          {parts.match}
                        </mark>
                      )}
                      {parts.post}
                    </p>
                    <p className="text-secondaryText flex items-baseline gap-1.5 text-[10px] tracking-[0.08em] uppercase">
                      <span>
                        {card.series_short_name} · {card.set_short_name}
                      </span>
                      {card.average_price != null && card.average_price > 0 && (
                        <>
                          <span className="text-mutedLabel">·</span>
                          <span className="font-display text-accentGreen text-[11px] tracking-normal normal-case">
                            {formatUsd(card.average_price)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  {active && (
                    <span
                      aria-hidden
                      className="font-display text-mutedLabel shrink-0 text-xs"
                    >
                      ↵
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: page-centered search bar */}
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-10 hidden place-items-center sm:grid"
      >
        <div className="pointer-events-auto relative w-120 max-w-[calc(100%-21rem)]">
          <div className={wrapperClasses}>
            <span
              className="bg-accentGreen text-mainBg font-jp px-1.25 text-xs select-none"
              aria-hidden
              lang="ja"
            >
              検索
            </span>
            <span
              className="text-accentGreen font-display font-bold select-none"
              aria-hidden
            >
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPointerEnter={engageSearch}
              onFocus={() => {
                engageSearch();
                if (debouncedQuery.trim() && results.length > 0)
                  setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="search cards"
              className={inputClasses}
              aria-label="Search cards"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls="card-search-results"
              aria-activedescendant={
                activeIndex >= 0
                  ? `card-search-result-${activeIndex}`
                  : undefined
              }
              role="combobox"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="text-accentGreen/70 hover:text-accentGreen shrink-0"
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          {renderDropdown()}
        </div>
      </div>

      {/* Mobile: search pill trigger */}
      <button
        type="button"
        onClick={() => {
          engageSearch();
          setMobileOpen(true);
        }}
        className="text-accentGreen bg-insetBg border-tileBorder shadow-inset flex items-center gap-2 border-2 px-3 py-1 sm:hidden"
        aria-label="Open search"
      >
        <span className="font-display font-bold" aria-hidden>
          &gt;
        </span>
        <FiSearch size={16} />
      </button>

      {/* Mobile: overlay panel */}
      {mobileOpen && (
        <>
          <div
            className="bg-overlayBg/50 fixed inset-0 z-40 sm:hidden"
            onClick={closeMobile}
          />
          <div
            ref={mobileContainerRef}
            className="anim-unroll bg-navBg border-tileBorder fixed inset-x-0 top-13.5 z-50 border-b-2 px-4 py-2 sm:hidden"
          >
            <div className={wrapperClasses}>
              <span
                className="bg-accentGreen text-mainBg font-jp px-1.25 text-xs select-none"
                aria-hidden
                lang="ja"
              >
                検索
              </span>
              <span
                className="text-accentGreen font-display font-bold select-none"
                aria-hidden
              >
                &gt;
              </span>
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="search cards"
                className={inputClasses}
                aria-label="Search cards"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls="card-search-results"
                aria-activedescendant={
                  activeIndex >= 0
                    ? `card-search-result-${activeIndex}`
                    : undefined
                }
                role="combobox"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                    mobileInputRef.current?.focus();
                  }}
                  className="text-accentGreen/70 hover:text-accentGreen shrink-0"
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            <div className="relative">{renderDropdown()}</div>
          </div>
        </>
      )}
    </>
  );
};

export default CardSearch;
