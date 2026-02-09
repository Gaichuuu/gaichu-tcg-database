import { useState, useEffect, useMemo, useRef } from "react";

export function useImagesLoaded(urls: string[], threshold?: number): boolean {
  const count = threshold ?? urls.length;
  const [ready, setReady] = useState(false);
  const loadedRef = useRef(0);
  const urlsKey = urls.join("\0");
  const stableUrls = useMemo(() => urls, [urlsKey]);

  useEffect(() => {
    if (stableUrls.length === 0 || count === 0) return;
    loadedRef.current = 0;
    setReady(false);

    const target = Math.min(count, stableUrls.length);

    const onDone = () => {
      loadedRef.current += 1;
      if (loadedRef.current >= target) {
        setReady(true);
      }
    };

    const images = stableUrls.slice(0, target).map((src) => {
      const img = new Image();
      img.onload = onDone;
      img.onerror = onDone;
      img.src = src;
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [stableUrls, count]);

  return ready;
}
