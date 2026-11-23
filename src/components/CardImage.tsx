import React, { useState } from "react";
import { isPlaceholderImage } from "@/utils/cardImage";
import { cdnResized } from "@/utils/cdnImage";

interface CardImageProps {
  src: string | null | undefined;
  backSrc?: string;
  alt: string;
  imgClassName?: string;
  className?: string;
  radiusClassName?: string;
  textClassName?: string;
  children?: React.ReactNode;
  cdnWidth?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

const CardImage: React.FC<CardImageProps> = ({
  src,
  backSrc,
  alt,
  imgClassName,
  className,
  radiusClassName,
  textClassName,
  children,
  cdnWidth,
  loading = "lazy",
  fetchPriority,
}) => {
  const [backError, setBackError] = useState(false);

  const missing = isPlaceholderImage(src);
  const display = missing ? backSrc : src;
  const showFiller = missing && (!display || backError);

  return (
    <div className={`relative ${className ?? ""}`}>
      {showFiller ? (
        <div
          className={`bg-secondaryBorder aspect-[2.5/3.5] w-full ${radiusClassName ?? ""}`}
        />
      ) : (
        <img
          src={
            cdnWidth ? cdnResized(display, cdnWidth) : (display ?? undefined)
          }
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          className={imgClassName}
          onError={missing ? () => setBackError(true) : undefined}
        />
      )}

      {missing && (
        <div
          className={`bg-overlayBg/50 pointer-events-none absolute inset-0 flex items-center justify-center ${radiusClassName ?? ""}`}
        >
          <span
            className={`text-primaryText flex flex-col px-2 text-center font-mono leading-tight font-bold ${textClassName ?? "text-xl"}`}
          >
            <span>Image</span>
            <span>Coming</span>
            <span>Soon</span>
          </span>
        </div>
      )}

      {children}
    </div>
  );
};

export default CardImage;
