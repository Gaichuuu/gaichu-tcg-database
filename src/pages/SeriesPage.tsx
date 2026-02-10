import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import SetsList from "@/components/ListComponent/SetListComponent";
import { PageError } from "@/components/PageStates";
import { useSeriesByShortName } from "@/hooks/useCollection";
import { getCardListPath } from "@/utils/RoutePathBuildUtils";
import { CollectionSeries } from "@/types/CollectionSeries";

interface LinkItem {
  href: string;
  label: string;
}

const SeriesLinks: React.FC<{ series: CollectionSeries }> = ({ series }) => {
  const links: LinkItem[] = [];

  if (series.website) links.push({ href: series.website, label: "Website" });
  if (series.patreon) links.push({ href: series.patreon, label: "Patreon" });
  if (series.instagram)
    links.push({ href: series.instagram, label: "Instagram" });
  if (series.discord) links.push({ href: series.discord, label: "Discord" });
  if (series.twitter) links.push({ href: series.twitter, label: "Twitter" });
  if (series.youtube) links.push({ href: series.youtube, label: "YouTube" });
  series.links?.forEach((link) =>
    links.push({ href: link.url, label: link.label }),
  );

  if (links.length === 0) return null;

  return (
    <div className="sm:border-l sm:border-secondaryBorder sm:pl-4">
      <h4 className="mb-1 text-sm">Links</h4>
      <div className="flex flex-wrap gap-x-1 gap-y-1">
        {links.map((link) => (
          <span key={link.href} className="inline-flex items-center gap-1">
            <span className="text-secondaryText">·</span>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-alt text-secondaryText inline-flex items-center gap-1 text-xs hover:underline"
            >
              {link.label}
              <FiExternalLink className="h-3 w-3" />
            </a>
          </span>
        ))}
      </div>
    </div>
  );
};

const SeriesPage: React.FC = () => {
  const { seriesShortName = "" } = useParams<"seriesShortName">();
  const seriesKey = decodeURIComponent(seriesShortName);

  const { data: seriesAndSet, error } = useSeriesByShortName(seriesKey);
  const navigate = useNavigate();

  if (error) return <PageError message="Failed to load series." />;

  if (!seriesAndSet) {
    return (
      <div className="container mx-auto animate-pulse p-0">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="bg-secondaryBorder h-20 w-40 rounded" />
            <div>
              <div className="bg-secondaryBorder h-6 w-48 rounded" />
              <div className="bg-secondaryBorder mt-2 h-4 w-80 rounded" />
            </div>
          </div>
        </div>
        <div className="bg-secondaryBorder mb-2 h-5 w-24 rounded" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-tileBg border-primaryBorder flex items-center justify-center rounded-lg border p-4 shadow-lg"
            >
              <div className="flex w-full flex-col items-center">
                <div className="bg-secondaryBorder h-24 w-full rounded" />
                <div className="bg-secondaryBorder mt-2 h-5 w-1/2 rounded" />
                <div className="bg-secondaryBorder mt-2 h-4 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { series, sets } = seriesAndSet;

  const pageTitle = `${series.name} - Gaichu`;
  const pageDescription =
    series.description || `Browse all ${series.name} card sets on Gaichu.`;

  return (
    <div className="container mx-auto p-0">
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {series.logo && <meta property="og:image" content={series.logo} />}

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <img
            src={series.logo}
            alt={series.name}
            className="h-20 w-auto object-contain"
          />
          <div>
            <h3 className="mb-0">{series.name}</h3>
            {series.description && (
              <p className="text-secondaryText mt-2 max-w-2xl text-sm">
                {series.description}
              </p>
            )}
          </div>
        </div>
        <SeriesLinks series={series} />
      </div>

      <h4 className="mb-2">Sets ({sets.length})</h4>
      <SetsList
        collectionSet={sets.map((set) => ({ set, cards: [] }))}
        onClickSet={(set) => {
          navigate(getCardListPath(seriesKey, set));
        }}
      />
    </div>
  );
};

export default SeriesPage;
