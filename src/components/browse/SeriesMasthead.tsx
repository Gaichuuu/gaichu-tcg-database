import React from "react";
import type { CollectionSeries } from "@/types/CollectionSeries";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

interface SeriesMastheadProps {
  series: CollectionSeries;
}

interface LinkItem {
  href: string;
  label: string;
}

function seriesLinks(series: CollectionSeries): LinkItem[] {
  const links: LinkItem[] = [];
  if (series.website) links.push({ href: series.website, label: "Website" });
  if (series.patreon) links.push({ href: series.patreon, label: "Patreon" });
  if (series.instagram)
    links.push({ href: series.instagram, label: "Instagram" });
  if (series.discord) links.push({ href: series.discord, label: "Discord" });
  if (series.twitter) links.push({ href: series.twitter, label: "Twitter" });
  if (series.youtube) links.push({ href: series.youtube, label: "YouTube" });
  series.links?.forEach((l) => links.push({ href: l.url, label: l.label }));
  return links;
}

const SeriesMasthead: React.FC<SeriesMastheadProps> = ({ series }) => {
  const links = seriesLinks(series);

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="bevel-tile bevel-tile-static grid h-26 w-46 shrink-0 place-items-center p-2.5">
        <img
          src={cdnResized(series.logo, CDN_WIDTH.logo)}
          alt=""
          className="max-h-15 w-full object-contain"
        />
        <span className="series-code" aria-hidden>
          {series.short_name}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5">
        <h1 className="text-primaryText flex flex-wrap items-baseline gap-x-3.5 leading-[1.2]">
          {series.name}
          {series.name_ja && (
            <span
              lang="ja"
              className="font-jp text-accentAmber text-2xl font-normal text-shadow-none"
            >
              {series.name_ja}
            </span>
          )}
        </h1>
        {series.description && (
          <p className="text-secondaryText max-w-2xl text-sm leading-[1.6] text-pretty">
            {series.description}
          </p>
        )}
        {links.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {links.map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && (
                  <span className="text-mutedLabel" aria-hidden>
                    ·
                  </span>
                )}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-linkAlt hover:text-hoverText"
                >
                  {link.label} ↗
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SeriesMasthead;
