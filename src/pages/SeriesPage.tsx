// src/pages/SeriesPage.tsx
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
    <div>
      <h4 className="mb-1 text-sm">Links</h4>
      <ul className="text-secondaryText list-disc pl-4 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-alt inline-flex items-center gap-1 text-xs hover:underline"
            >
              {link.label}
              <FiExternalLink className="h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SeriesPage: React.FC = () => {
  const { seriesShortName = "" } = useParams<"seriesShortName">();
  const seriesKey = decodeURIComponent(seriesShortName);

  const { data: seriesAndSet, error } = useSeriesByShortName(seriesKey);
  const navigate = useNavigate();

  if (error) return <PageError message="Failed to load series." />;
  if (!seriesAndSet) return null;

  const { series, sets } = seriesAndSet;

  // SEO metadata
  const pageTitle = `${series.name} - Gaichu`;
  const pageDescription =
    series.description || `Browse all ${series.name} card sets on Gaichu.`;

  return (
    <div className="container mx-auto p-0">
      {/* React 19 native metadata */}
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
              <p className="text-secondaryText max-w-2xl text-sm">
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
