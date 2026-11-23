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

export default function ZooAttackSection({
  attacks,
  series,
}: ZooAttackSectionProps) {
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
                <div className="flex items-center gap-2">
                  {statuses.map((s, sIdx) => (
                    <CardIcon
                      key={`status-${s}-${sIdx}`}
                      series={series}
                      name={s}
                      extension="png"
                    />
                  ))}
                  {atk.multiplier && (
                    <span className="text-secondaryText">
                      ({atk.multiplier})
                    </span>
                  )}
                  {atk.damage && (
                    <span className="font-display text-accentPink text-lg font-bold">
                      {atk.damage}
                    </span>
                  )}
                  {atk.bonus && (
                    <CardIcon
                      series={series}
                      name={atk.bonus}
                      extension="png"
                    />
                  )}
                </div>
                {atk.effect && (
                  <div className="mt-1">
                    <IconText text={atk.effect} series={series} />
                  </div>
                )}
              </td>
            </tr>
          </React.Fragment>
        );
      })}
    </>
  );
}
