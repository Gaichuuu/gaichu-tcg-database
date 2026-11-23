import { flushSync } from "react-dom";

export const CARD_ART_VT = "card-art";

export function withViewTransition(update: () => void): void {
  if (typeof document === "undefined" || !document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}

let pendingCommit: (() => void) | null = null;
const COMMIT_TIMEOUT_MS = 1500;

export function navigateWithTransition(go: () => void): void {
  if (typeof document === "undefined" || !document.startViewTransition) {
    go();
    return;
  }
  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          if (pendingCommit === done) pendingCommit = null;
          resolve();
        };
        pendingCommit = done;
        window.setTimeout(done, COMMIT_TIMEOUT_MS);
        go();
      }),
  );
}

export function signalRouteCommit(): void {
  pendingCommit?.();
}

export function tagCardArt(el: Element | null): void {
  if (el instanceof HTMLElement) {
    el.style.setProperty("view-transition-name", CARD_ART_VT);
  }
}

export function setPagingDirection(dir: "next" | "prev"): void {
  const root = document.documentElement;
  root.dataset.vtDir = dir;
  window.setTimeout(() => {
    if (root.dataset.vtDir === dir) delete root.dataset.vtDir;
  }, 700);
}
