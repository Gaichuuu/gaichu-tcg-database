import React from "react";
import IconText from "@/components/IconText";
import { Tile } from "@/components/ui";
import CardIcon from "./CardIcon";
import CardDetailRow from "./CardDetailRow";
import AttacksSection from "./AttacksSection";
import AttributesSection from "./AttributesSection";
import ZooAttackSection from "./ZooAttackSection";
import ZooAttributesSection from "./ZooAttributesSection";
import { t, useLocale } from "@/i18n";
import { hasI18nContent } from "@/types/CollectionCard";
import type { CollectionCard } from "@/types/CollectionCard";

interface CardStatsPanelProps {
  card: CollectionCard;
  seriesKey: string;
}

const CardStatsPanel: React.FC<CardStatsPanelProps> = ({ card, seriesKey }) => {
  const { locale } = useLocale();

  const resolveLocaleText = (
    value: Partial<Record<"en" | "ja", string>> | undefined,
  ): string => {
    if (!value) return "";
    return t(value, locale) ?? "";
  };

  return (
    <Tile className="px-5 py-1">
      <table className="card-dat">
        <tbody>
          {card.type && (
            <tr>
              <th>Type</th>
              <td>
                {card.color && (
                  <CardIcon
                    series={seriesKey}
                    name={card.color}
                    extension="jpg"
                    className="mr-2 rounded-full"
                  />
                )}
                {card.type}
              </td>
            </tr>
          )}

          {card.stage?.map((s, i) => {
            const text = [s.basic, s.evolution, s.description]
              .filter(Boolean)
              .join("\n");
            if (!text) return null;
            return (
              <CardDetailRow key={i} label="Stage">
                {text}
              </CardDetailRow>
            );
          })}

          {card.hp && (
            <tr>
              <th>HP</th>
              <td>
                <span className="font-display text-accentGreen text-3xl leading-none font-bold">
                  {card.hp}
                </span>
                <span className="text-secondaryText ml-2.5 text-xs">
                  hit points
                </span>
              </td>
            </tr>
          )}

          {card.lvl && <CardDetailRow label="Lv.">{card.lvl}</CardDetailRow>}

          {card.lp_alt && (
            <CardDetailRow label="LP">{card.lp_alt}</CardDetailRow>
          )}

          {card.measurement && (
            <CardDetailRow label="Measurements">
              Height {card.measurement.height}, Weight {card.measurement.weight}
            </CardDetailRow>
          )}

          {hasI18nContent(card.favorite_food) && (
            <CardDetailRow label="Favorite Food">
              {t(card.favorite_food, locale)}
            </CardDetailRow>
          )}

          <AttacksSection attacks={card.attacks ?? []} series={seriesKey} />

          {card.limit && (
            <tr>
              <th>Limit</th>
              <td>
                {card.limit}
                <span className="text-secondaryText ml-2 text-xs">
                  per spellbook
                </span>
              </td>
            </tr>
          )}

          {card.cost && (
            <CardDetailRow label="Cost">
              <span className="flex flex-wrap gap-2">
                {card.cost.map((cost) => (
                  <span
                    key={cost.aura}
                    className="bg-mainBg inline-flex items-center gap-1.5 px-2 py-1 font-mono text-xs"
                  >
                    {cost.total}
                    <CardIcon
                      series={seriesKey}
                      name={cost.aura}
                      extension="jpg"
                    />
                  </span>
                ))}
              </span>
            </CardDetailRow>
          )}

          {card.lp && (
            <tr>
              <th>LP</th>
              <td>
                <span className="font-display text-accentGreen text-3xl leading-none font-bold">
                  {card.lp}
                </span>
                <span className="text-secondaryText ml-2.5 text-xs">
                  life points
                </span>
              </td>
            </tr>
          )}

          {card.traits && (
            <CardDetailRow label="Traits">
              {card.traits.map((trait) => (
                <span key={trait} className="mr-2">
                  <CardIcon
                    series={seriesKey}
                    name={trait}
                    extension="png"
                    className="h-5"
                  />
                  {"  "}
                </span>
              ))}
            </CardDetailRow>
          )}

          {card.terra && (
            <CardDetailRow label="Terra">
              <span className="flex flex-wrap gap-2">
                {card.terra.map((terra, i) => (
                  <span
                    key={`${terra.icon}-${i}`}
                    className="bg-mainBg inline-flex items-center gap-1.5 px-2 py-1 font-mono text-xs"
                  >
                    {terra.attack && <span>{terra.attack}</span>}
                    <CardIcon
                      series={seriesKey}
                      name={terra.icon}
                      extension="png"
                      className="h-5"
                    />
                    {terra.lp && <span>{terra.lp}</span>}
                  </span>
                ))}
              </span>
            </CardDetailRow>
          )}

          {card.metadata && (
            <CardDetailRow label="Metadata">
              {card.metadata.discovered && (
                <>Discovered: {card.metadata.discovered}, </>
              )}
              {card.metadata.gps && <>GPS: {card.metadata.gps}, </>}
              {card.metadata.weight && <>Weight: {card.metadata.weight}, </>}
              {card.metadata.height && <>Height: {card.metadata.height}</>}
              {card.metadata.length && <>Length: {card.metadata.length}</>}
              {card.metadata.type && (
                <>
                  {card.metadata.type} {card.metadata.measurement}
                </>
              )}
            </CardDetailRow>
          )}

          {card.effect && (
            <CardDetailRow label="Effect">
              <IconText text={card.effect} series={seriesKey} />
            </CardDetailRow>
          )}

          <ZooAttackSection
            attacks={card.zoo_attack ?? []}
            series={seriesKey}
          />

          <AttributesSection
            series={seriesKey}
            weakness={card.weakness}
            resistance={card.resistance}
            retreat={card.retreat}
          />

          <ZooAttributesSection series={seriesKey} strength={card.strength} />

          {hasI18nContent(card.description) && (
            <tr>
              <th>Flavor Text</th>
              <td>
                <div className="bg-mainBg border-bevelShadow2 border px-3.5 py-3 text-[13.5px] leading-[1.65] text-pretty italic shadow-[inset_2px_2px_0_rgba(0,0,0,0.5)]">
                  {resolveLocaleText(card.description)}
                </div>
              </td>
            </tr>
          )}

          {card.rule?.map((s, i) => {
            const text = [s.name, s.description].filter(Boolean).join("\n");
            if (!text) return null;
            return (
              <CardDetailRow key={i} label="Rule">
                {text}
              </CardDetailRow>
            );
          })}

          {card.illustrators && (
            <CardDetailRow label="Illustrator">
              {card.illustrators[0]}
            </CardDetailRow>
          )}

          {card.note && <CardDetailRow label="Note">{card.note}</CardDetailRow>}
        </tbody>
      </table>
    </Tile>
  );
};

export default CardStatsPanel;
