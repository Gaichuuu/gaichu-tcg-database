import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { useCardSearch } from "@/hooks/useCardSearch";
import { getCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { t, useLocale } from "@/i18n";
import type { CollectionCard } from "@/types/CollectionCard";

const SKELETON_COUNT = 3;

const CardSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLocale();
  const { results, isLoading, debouncedQuery } = useCardSearch(query);

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
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
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
      requestAnimationFrame(() => mobileInputRef.current?.focus());
    }
  }, [mobileOpen]);

  const navigateToCard = useCallback(
    (card: CollectionCard) => {
      navigate(getCardDetailPath(card));
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
    "bg-mainBg border-secondaryBorder focus:border-primaryBorder w-full rounded-lg border py-1.5 pl-8 pr-8 text-sm transition-colors focus:outline-none";

  const dropdownClasses =
    "bg-navBg border-secondaryBorder absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border shadow-lg";

  const renderDropdown = () => (
    <>
      {showLoading && (
        <div className={`${dropdownClasses} overflow-hidden`}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="bg-secondaryBorder h-14 w-10 shrink-0 animate-pulse rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="bg-secondaryBorder h-3.5 w-3/4 animate-pulse rounded" />
                <div className="bg-secondaryBorder h-3 w-1/2 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showNoResults && (
        <div className={`${dropdownClasses} p-4`}>
          <p className="text-secondaryText text-center text-sm">
            No results found.
          </p>
        </div>
      )}

      {showResults && (
        <ul
          id="card-search-results"
          role="listbox"
          className={`${dropdownClasses} max-h-112 overflow-y-auto`}
        >
          {results.map((card, index) => (
            <li
              key={`${card.series_short_name}-${card.set_short_name}-${card.sort_by}`}
              id={`card-search-result-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => navigateToCard(card)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors ${
                index === activeIndex ? "bg-tileBg" : "hover:bg-tileBg/50"
              }`}
            >
              {card.thumb && (
                <img
                  src={card.thumb}
                  alt=""
                  className="border-secondaryBorder h-14 w-auto shrink-0 rounded border object-contain"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-primaryText truncate text-sm font-medium">
                  {t(card.name, locale)}
                </p>
                <p className="text-secondaryText mt-0.5 text-[10px] tracking-wider uppercase">
                  {card.series_short_name} · {card.set_short_name}
                  {card.average_price != null && card.average_price > 0 && (
                    <span className="text-primaryText ml-1.5 normal-case">
                      ${card.average_price.toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: page-centered search bar */}
      <div
        ref={containerRef}
        className="absolute inset-0 hidden w-full items-center justify-center sm:flex"
      >
        <div className="relative w-86">
          <div className="relative">
            <FiSearch
              className="text-secondaryText pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
              size={14}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (debouncedQuery.trim() && results.length > 0)
                  setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search cards…"
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
                className="text-secondaryText hover:text-primaryText absolute top-1/2 right-2 -translate-y-1/2"
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
        onClick={() => setMobileOpen(true)}
        className="bg-mainBg border-secondaryBorder text-secondaryText flex w-28 rounded-lg border px-3 py-2 sm:hidden"
        aria-label="Open search"
      >
        <FiSearch size={16} />
      </button>

      {/* Mobile: overlay panel */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={closeMobile}
          />
          <div className="bg-navBg border-secondaryBorder/20 fixed inset-x-0 top-10.5 z-50 border-b px-4 py-2 sm:hidden">
            <div className="relative">
              <FiSearch
                className="text-secondaryText pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                size={14}
              />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search cards…"
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
                  className="text-secondaryText hover:text-primaryText absolute top-1/2 right-2 -translate-y-1/2"
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
