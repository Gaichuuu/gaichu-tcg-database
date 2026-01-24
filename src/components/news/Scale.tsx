type Props = {
  score?: number;
  label?: string;
  className?: string;
};

export default function Score({ score, label = "Sus", className = "" }: Props) {
  if (typeof score !== "number") return null;
  const value = Math.max(1, Math.min(10, Math.round(score)));

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="meter"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={10}
      aria-valuenow={value}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span aria-hidden="true" className="tracking-tight">
        {"🚩".repeat(value)}
      </span>
    </div>
  );
}
