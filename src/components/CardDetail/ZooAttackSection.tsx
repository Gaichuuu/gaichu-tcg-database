import React from "react";
import IconText from "@/components/IconText";
import CardIcon from "./CardIcon";

interface ZooAttack {
  name: string;
  effect?: string;
  damage: string;
  status?: string[];
  multiplier?: string;
  bonus?: string;
}

interface ZooAttackSectionProps {
  attacks: ZooAttack[];
  series: string;
}

export default function ZooAttackSection({ attacks, series }: ZooAttackSectionProps) {
  if (!attacks.length) return null;

  return (
    <>
      {attacks.map((atk, idx) => {
        const statuses = Array.isArray(atk.status)
          ? atk.status
          : atk.status
            ? [atk.status]
            : [];

        return (
          <React.Fragment key={`${atk.name ?? "atk"}-${idx}`}>
            <tr>
              <th>{atk.name}</th>
              <td>
                {statuses.length > 0 && (
                  <span className="mr-2 inline-flex items-center gap-1 align-middle">
                    {statuses.map((s, sIdx) => (
                      <CardIcon
                        key={`status-${s}-${sIdx}`}
                        series={series}
                        name={s}
                        extension="png"
                      />
                    ))}
                  </span>
                )}
                {atk.multiplier && (
                  <span className="mr-2 align-middle">({atk.multiplier})</span>
                )}
                <span className="mr-2 align-middle font-medium">
                  {atk.damage}
                </span>
                {atk.bonus && (
                  <CardIcon series={series} name={atk.bonus} extension="png" />
                )}
                {atk.effect && <IconText text={atk.effect} series={series} />}
              </td>
            </tr>
          </React.Fragment>
        );
      })}
    </>
  );
}
