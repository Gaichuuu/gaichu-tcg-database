export type CardDensity = "s" | "m" | "l";

export const CARD_WIDTHS: Record<CardDensity, string> = {
  s: "96px",
  m: "132px",
  l: "176px",
};

export const CARD_RADII: Record<CardDensity, string> = {
  s: "rounded-[4px]",
  m: "rounded-[8px]",
  l: "rounded-[12px]",
};
