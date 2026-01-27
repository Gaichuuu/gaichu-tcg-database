import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { useEbayPrices } from "@/hooks/useEbayPrices";

interface PriceTableProps {
  cardId: string;
  seriesShortName: string;
}

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
  return `Updated ${Math.floor(diffDays / 30)} months ago`;
}

const PriceTable: React.FC<PriceTableProps> = ({ cardId, seriesShortName }) => {
  const { data, isLoading, error } = useEbayPrices(cardId, seriesShortName);

  if (!["ash", "wm"].includes(seriesShortName)) {
    return (
      <div className="border-secondaryBorder rounded-xl border p-3">
        <h4 className="text-secondaryText mb-2 text-xs font-medium uppercase tracking-wide">
          Sales
        </h4>
        <p className="text-secondaryText text-sm italic">
          Not available for this series
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border-secondaryBorder rounded-xl border p-3">
        <h4 className="text-secondaryText mb-3 text-xs font-medium uppercase tracking-wide">
          Sales
        </h4>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="bg-secondaryBorder h-4 w-16 rounded" />
              <div className="bg-secondaryBorder h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border-secondaryBorder rounded-xl border p-3">
        <h4 className="text-secondaryText mb-2 text-xs font-medium uppercase tracking-wide">
          Sales
        </h4>
        <p className="text-secondaryText text-sm italic">
          No price data available
        </p>
      </div>
    );
  }

  if (data.sample_size === 0) {
    return (
      <div className="border-secondaryBorder rounded-xl border p-3">
        <h4 className="text-secondaryText mb-2 text-xs font-medium uppercase tracking-wide">
          Sales
        </h4>
        <p className="text-secondaryText text-sm italic">
          No recent sales found
        </p>
      </div>
    );
  }

  return (
    <div className="border-secondaryBorder rounded-xl border p-3">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-secondaryText text-xs font-medium uppercase tracking-wide">
          Sales
        </h4>
        <span className="text-secondaryText text-xs italic">
          {formatTimeAgo(data.last_updated)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-secondaryText">Total</span>
          <span className="text-primaryText font-medium">
            {data.sample_size}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-secondaryText">Low</span>
          <span className="text-primaryText font-medium">
            {formatPrice(data.min_price)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-secondaryText">High</span>
          <span className="text-primaryText font-medium">
            {formatPrice(data.max_price)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-secondaryText">Average</span>
          <span className="text-primaryText font-medium">
            {formatPrice(data.average_price)}
          </span>
        </div>

      </div>

      {data.ebay_search_url && (
        <div className="mt-3 text-right">
          <a
            href={data.ebay_search_url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-alt inline-flex items-center gap-1 text-sm hover:underline"
          >
            View on eBay
            <FiExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export default PriceTable;
