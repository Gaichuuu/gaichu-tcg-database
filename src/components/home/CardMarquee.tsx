import React, { useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { slugify, buildCardDetailPath } from "@/utils/RoutePathBuildUtils";
import { useShowcaseCards } from "@/hooks/useShowcaseCards";

/** Pixels per second when auto-scrolling */
const AUTO_SPEED = 50;

/** Fraction of velocity remaining after 1 second (lower = faster decay) */
const MOMENTUM_DECAY = 0.03;

/** Minimum velocity (px/s) before switching back to auto-scroll */
const VELOCITY_THRESHOLD = 1;

/** Max drag velocity to prevent wild flings */
const MAX_VELOCITY = 2000;

/** Minimum drag distance (px) to suppress link navigation */
const DRAG_THRESHOLD = 5;

/** If no touchmove for this many ms before release, kill momentum */
const STALE_VELOCITY_MS = 100;

interface MarqueeState {
  offset: number;
  halfWidth: number;
  isDragging: boolean;
  isPaused: boolean;
  didDrag: boolean;
  dragStartX: number;
  dragStartOffset: number;
  velocity: number;
  lastDragX: number;
  lastDragTime: number;
  lastTime: number;
  animFrame: number;
}

const CardMarquee: React.FC = () => {
  const { cards, isLoading } = useShowcaseCards(24);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<MarqueeState>({
    offset: 0,
    halfWidth: 0,
    isDragging: false,
    isPaused: false,
    didDrag: false,
    dragStartX: 0,
    dragStartOffset: 0,
    velocity: 0,
    lastDragX: 0,
    lastDragTime: 0,
    lastTime: 0,
    animFrame: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || cards.length === 0) return;

    const s = stateRef.current;
    s.halfWidth = el.scrollWidth / 2;

    const ro = new ResizeObserver(() => {
      s.halfWidth = el.scrollWidth / 2;
    });
    ro.observe(el);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReduced = mql.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReduced = e.matches;
    };
    mql.addEventListener("change", onMotionChange);

    const tick = (time: number) => {
      if (s.lastTime === 0) s.lastTime = time;
      const dt = Math.min((time - s.lastTime) / 1000, 0.1);
      s.lastTime = time;

      if (!s.isDragging) {
        if (Math.abs(s.velocity) > VELOCITY_THRESHOLD) {
          s.offset += s.velocity * dt;
          s.velocity *= Math.pow(MOMENTUM_DECAY, dt);
        } else {
          s.velocity = 0;
          if (!s.isPaused && !prefersReduced) {
            s.offset -= AUTO_SPEED * dt;
          }
        }
      }

      if (s.halfWidth > 0) {
        while (s.offset <= -s.halfWidth) s.offset += s.halfWidth;
        while (s.offset > 0) s.offset -= s.halfWidth;
      }

      el.style.transform = `translate3d(${s.offset}px, 0, 0)`;
      s.animFrame = requestAnimationFrame(tick);
    };

    s.animFrame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(s.animFrame);
      ro.disconnect();
      mql.removeEventListener("change", onMotionChange);
      s.lastTime = 0;
    };
  }, [cards.length]);

  const dragStart = useCallback((x: number) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.didDrag = false;
    s.dragStartX = x;
    s.dragStartOffset = s.offset;
    s.velocity = 0;
    s.lastDragX = x;
    s.lastDragTime = performance.now();
  }, []);

  const dragMove = useCallback((x: number) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    const now = performance.now();
    const dt = (now - s.lastDragTime) / 1000;

    if (dt > 0) {
      s.velocity = (x - s.lastDragX) / dt;
    }

    if (Math.abs(x - s.dragStartX) > DRAG_THRESHOLD) {
      s.didDrag = true;
    }

    s.offset = s.dragStartOffset + (x - s.dragStartX);
    s.lastDragX = x;
    s.lastDragTime = now;
  }, []);

  const dragEnd = useCallback(() => {
    const s = stateRef.current;
    s.isDragging = false;

    if (performance.now() - s.lastDragTime > STALE_VELOCITY_MS) {
      s.velocity = 0;
    } else {
      s.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, s.velocity));
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => dragStart(e.touches[0].clientX),
    [dragStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => dragMove(e.touches[0].clientX),
    [dragMove],
  );

  const handleTouchEnd = useCallback(() => dragEnd(), [dragEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      dragStart(e.clientX);
      const el = containerRef.current;
      if (el) el.style.cursor = "grabbing";

      const onMouseMove = (ev: MouseEvent) => dragMove(ev.clientX);
      const onMouseUp = () => {
        dragEnd();
        if (el) el.style.cursor = "";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [dragStart, dragMove, dragEnd],
  );

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (stateRef.current.didDrag) {
      e.preventDefault();
      stateRef.current.didDrag = false;
    }
  }, []);

  const pause = useCallback(() => {
    stateRef.current.isPaused = true;
  }, []);

  const unpause = useCallback(() => {
    stateRef.current.isPaused = false;
  }, []);

  if (isLoading || cards.length === 0) return null;

  return (
    <div
      className="full-bleed marquee-fade overflow-hidden"
      role="region"
      aria-label="Showcase cards"
      onMouseEnter={pause}
      onMouseLeave={unpause}
      onFocus={pause}
      onBlur={unpause}
    >
      <div
        ref={containerRef}
        className="flex w-max cursor-grab touch-pan-y gap-3 py-6 will-change-transform select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {[...cards, ...cards].map((card, i) => (
          <Link
            key={`${i < cards.length ? "a" : "b"}-${card.series}-${card.sortBy}`}
            to={buildCardDetailPath(
              card.series,
              card.set,
              card.sortBy,
              slugify(card.name),
            )}
            className="group relative block shrink-0"
            title={card.name}
            draggable={false}
            onClick={handleClick}
          >
            <img
              src={card.image}
              alt={card.name}
              fetchPriority="low"
              className="border-secondaryBorder bg-secondaryBg aspect-5/7 h-56 rounded-xl border object-contain transition-transform duration-200 group-hover:scale-110 sm:h-72"
              draggable={false}
            />
            {card.averagePrice != null && card.averagePrice > 0 && (
              <span className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                ${card.averagePrice.toFixed(2)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CardMarquee;
