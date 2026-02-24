import { CDN_BASE_URL } from "@/services/Constants";

interface CardIconProps {
  series: string;
  name: string;
  extension?: "jpg" | "png";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-auto",
  md: "h-5 w-auto",
  lg: "h-6 w-auto",
};

export default function CardIcon({
  series,
  name,
  extension = "jpg",
  size = "md",
  className = "",
}: CardIconProps) {
  const src = `${CDN_BASE_URL}/${series}/icon${name}.${extension}`;
  const sizeClass = sizeClasses[size];

  return (
    <img
      src={src}
      alt={`${name} Icon`}
      className={`inline-block align-middle ${sizeClass} ${className}`}
    />
  );
}
