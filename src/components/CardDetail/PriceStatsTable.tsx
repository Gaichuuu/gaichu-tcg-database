import React from "react";
import type { EbayPriceData } from "@/hooks/useEbayPrices";
import { formatUsd } from "@/utils/money";
import { TWENTY_FOUR_HOURS } from "@/utils/TimeUtils";
import { buttonClasses } from "@/components/ui";

interface PriceStatsTableProps {
  data: EbayPriceData | null;
  isLoading: boolean;
  error: boolean;
  priced: boolean;
}

function formatPrice(price: number | null): string {
  if (price === null) return "N/A";
  return formatUsd(price);
}

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / TWENTY_FOUR_HOURS,
  );
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

function salesNote(data: EbayPriceData): string {
  if (data.last_sale_date) return `last sale ${timeAgo(data.last_sale_date)}`;
  return `checked ${timeAgo(data.last_updated)}`;
}

const Header: React.FC<{ note?: string }> = ({ note }) => (
  <div className="mb-2 flex items-baseline justify-between gap-3">
    <b className="text-primaryText text-xs tracking-[0.08em] whitespace-nowrap">
      SALES
    </b>
    {note && (
      <span className="text-mutedLabel shrink-0 text-[11px] italic">
        {note}
      </span>
    )}
  </div>
);

const Line: React.FC<{
  label: string;
  value: React.ReactNode;
  total?: boolean;
}> = ({ label, value, total }) => (
  <div className="flex items-baseline py-1.25 text-[13px]">
    <span className="text-secondaryText">{label}</span>
    <span
      aria-hidden
      className="border-bevelShadow2 mx-2 flex-1 -translate-y-1 border-b-2 border-dotted"
    />
    <span
      className={`font-display text-[13px] ${
        total ? "text-accentCyan" : "text-primaryText"
      }`}
    >
      {value}
    </span>
  </div>
);

const Message: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <Header />
    <p className="text-secondaryText text-sm italic">{children}</p>
  </div>
);

const PriceStatsTable: React.FC<PriceStatsTableProps> = ({
  data,
  isLoading,
  error,
  priced,
}) => {
  if (!priced) return <Message>Not available for this series</Message>;

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="animate-pulse space-y-2 py-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="bg-secondaryBorder h-3.5 w-16 rounded" />
              <div className="bg-secondaryBorder h-3.5 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return <Message>No price data available</Message>;
  if (data.sample_size === 0) return <Message>No recent sales found</Message>;

  return (
    <div className="flex h-full flex-col">
      <Header note={salesNote(data)} />

      <Line label="TOTAL SALES" value={data.sample_size} total />
      <Line label="LOW" value={formatPrice(data.min_price)} />
      <Line label="HIGH" value={formatPrice(data.max_price)} />
      <Line label="AVERAGE" value={formatPrice(data.average_price)} />

      {data.ebay_search_url && (
        <a
          href={data.ebay_search_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClasses()} mt-3 w-full pt-px md:mt-auto`}
        >
          View on eBay
        </a>
      )}
    </div>
  );
};

export default PriceStatsTable;
