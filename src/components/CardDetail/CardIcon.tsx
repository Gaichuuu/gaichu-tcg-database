import { CDN_BASE_URL } from "@/services/Constants";

interface CardIconProps {
  series: string;
  name: string;
  extension?: "jpg" | "png";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
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
