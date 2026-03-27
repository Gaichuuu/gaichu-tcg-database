import { useState } from "react";
import useCardTilt from "@/hooks/useCardTilt";

interface TiltableImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export default function TiltableImage({
  src,
  alt,
  className,
  imgClassName,
}: TiltableImageProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const {
    containerRef,
    overlayRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useCardTilt();

  return (
    <div style={{ perspective: "800px" }} className={className}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          overflow: "hidden",
          borderRadius: "inherit",
        }}
      >
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          onLoad={() => setImgLoaded(true)}
        />
        {imgLoaded && (
          <div
            ref={overlayRef}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              opacity: 0,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}
