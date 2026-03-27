import { useRef, useCallback } from "react";

const IDLE_TRANSFORM = "rotateX(0deg) rotateY(0deg) scale(1)";
const IDLE_OPACITY = "0";

export default function useCardTilt() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = rectRef.current;
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (!rect || !container) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 30;
      const ry = (x - 0.5) * 30;

      container.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;

      if (overlay) {
        overlay.style.background = `radial-gradient(farthest-corner circle at ${x * 100}% ${y * 100}%, hsla(0,0%,100%,0.8) 10%, hsla(0,0%,100%,0.65) 20%, hsla(0,0%,0%,0.5) 90%)`;
        overlay.style.opacity = "0.3";
      }
    },
    [],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      rectRef.current = e.currentTarget.getBoundingClientRect();
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (container) container.style.transition = "transform 0.15s ease-out";
      if (overlay) overlay.style.transition = "opacity 0.15s ease-out";
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    rectRef.current = null;
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (container) {
      container.style.transform = IDLE_TRANSFORM;
      container.style.transition =
        "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
    }
    if (overlay) {
      overlay.style.opacity = IDLE_OPACITY;
      overlay.style.transition =
        "opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
    }
  }, []);

  return {
    containerRef,
    overlayRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
}
