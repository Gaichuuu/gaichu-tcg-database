// src/hooks/useQueryParam.ts
import { useSearchParams } from "react-router-dom";

export function useQueryParam(key: string, fallback = "") {
  const [sp, setSp] = useSearchParams();
  const value = sp.get(key) ?? fallback;
  const setValue = (v: string) => {
    const next = new URLSearchParams(sp);
    if (v) {
      next.set(key, v);
    } else {
      next.delete(key);
    }
    setSp(next, { replace: true });
  };
  return [value, setValue] as const;
}
