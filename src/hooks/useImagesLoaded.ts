import { useState, useEffect, useRef } from "react";

export function useImagesLoaded(urls: string[], threshold?: number): boolean {
  const count = threshold ?? urls.length;
  const [ready, setReady] = useState(false);
  const loadedRef = useRef(0);

  useEffect(() => {
    if (urls.length === 0 || count === 0) return;
    loadedRef.current = 0;
    setReady(false);

    const target = Math.min(count, urls.length);

    const onDone = () => {
      loadedRef.current += 1;
      if (loadedRef.current >= target) {
        setReady(true);
      }
    };

    const images = urls.slice(0, target).map((src) => {
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
  }, [urls, count]);

  return ready;
}
