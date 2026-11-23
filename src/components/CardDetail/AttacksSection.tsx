import IconText from "@/components/IconText";
import CardIcon from "./CardIcon";
import { t, useLocale } from "@/i18n";

interface Attack {
  name: Partial<Record<"en" | "ja", string>>;
  effect: Partial<Record<"en" | "ja", string>>;
  damage?: string;
  costs?: string[];
}

interface AttacksSectionProps {
  attacks: Attack[];
  series: string;
}

export default function AttacksSection({
  attacks,
  series,
}: AttacksSectionProps) {
  const { locale } = useLocale();

  if (!attacks.length) return null;

  return (
    <>
      {attacks.map((attack, aIndex) => (
        <tr key={t(attack.name, "en") || aIndex}>
          <th>{t(attack.name, locale)}</th>
          <td>
            <div className="flex items-baseline justify-between gap-3">
              <span>
                {(attack.costs ?? []).map((cost, cIndex) => (
                  <CardIcon
                    key={`${t(attack.name, "en")}-cost-${cIndex}`}
                    series={series}
                    name={cost}
                    extension="jpg"
                    className={[
                      "mr-2 rounded-full",
                      series === "tygadu" && "border-hoverBorder border",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ))}
                <IconText
                  text={t(attack.effect, locale)}
                  series={series}
                  className="mx-1"
                />
              </span>
              {attack.damage && (
                <span className="font-display text-accentPink shrink-0 text-lg font-bold">
                  {attack.damage}
                </span>
              )}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
