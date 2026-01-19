// src/pages/SeriesPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import SetsList from "@/components/ListComponent/SetListComponent";
import { PageError } from "@/components/PageStates";
import { useSeriesByShortName } from "@/hooks/useCollection";
import { getCardListPath } from "@/utils/RoutePathBuildUtils";
import { CollectionSeries } from "@/types/CollectionSeries";

const SocialLink: React.FC<{
  href: string | undefined;
  label: string;
}> = ({ href, label }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="secondary-button"
    >
      {label}
    </a>
  );
};

const SeriesLinks: React.FC<{ series: CollectionSeries }> = ({ series }) => {
  const hasAnyLink =
    series.website ||
    series.patreon ||
    series.instagram ||
    series.discord ||
    series.twitter ||
    series.youtube ||
    (series.links && series.links.length > 0);

  if (!hasAnyLink) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <SocialLink href={series.website} label="Website" />
      <SocialLink href={series.patreon} label="Patreon" />
      <SocialLink href={series.instagram} label="Instagram" />
      <SocialLink href={series.discord} label="Discord" />
      <SocialLink href={series.twitter} label="Twitter" />
      <SocialLink href={series.youtube} label="YouTube" />
      {series.links?.map((link) => (
        <SocialLink key={link.url} href={link.url} label={link.label} />
      ))}
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

  return (
    <div className="container mx-auto p-0">
      <div className="mb-4 flex gap-4">
        <img
          src={series.logo}
          alt={series.name}
          className="h-20 w-auto object-contain"
        />
        <div className="flex flex-col justify-center">
          <h3 className="mb-1">{series.name}</h3>
          {series.description && (
            <p className="text-secondaryText text-sm">{series.description}</p>
          )}
          <SeriesLinks series={series} />
        </div>
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
