import React from "react";
import { formatUsd } from "@/utils/money";

export interface PriceTagProps {
  value: number;
  size?: "sm" | "md";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "px-1.5 py-0.5 text-[10.5px]",
  md: "px-1.75 py-0.75 text-[11px]",
} as const;

export const PriceTag: React.FC<PriceTagProps> = ({
  value,
  size = "sm",
  className = "",
}) => (
  <span
    className={`bg-overlayBg/80 text-primaryAltText font-display pointer-events-none inline-block leading-none ${SIZE_CLASSES[size]} ${className}`}
  >
    {formatUsd(value)}
  </span>
);

export default PriceTag;
