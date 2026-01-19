import CardIcon from "./CardIcon";

interface WeaknessEntry {
  type?: string;
  value?: string;
}

interface ResistanceEntry {
  type?: string;
  value?: string;
}

interface RetreatEntry {
  costs?: string[];
}

interface AttributesSectionProps {
  series: string;
  weakness?: WeaknessEntry[];
  resistance?: ResistanceEntry[];
  retreat?: RetreatEntry[];
}

export default function AttributesSection({
  series,
  weakness,
  resistance,
  retreat,
}: AttributesSectionProps) {
  const hasWeakness = weakness?.length;
  const hasResistance = resistance?.length;
  const hasRetreat = retreat?.some((r) => r?.costs?.length);

  if (!hasWeakness && !hasResistance && !hasRetreat) return null;

  return (
    <tr>
      <th>Attributes</th>
      <td>
        {hasWeakness ? (
          <div>
            <span>Weakness</span>{" "}
            <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
              {weakness!.map((w, i) => (
                <span key={`w-${i}`} className="inline-flex items-center gap-1">
                  {w.type && (
                    <CardIcon series={series} name={w.type} extension="jpg" />
                  )}
                  {w.value && <span className="align-middle">{w.value}</span>}
                </span>
              ))}
            </span>
          </div>
        ) : null}

        {hasResistance ? (
          <div>
            <span>Resistance</span>{" "}
            <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
              {resistance!.map((r, i) => (
                <span key={`r-${i}`} className="inline-flex items-center gap-1">
                  {r.type && (
                    <CardIcon series={series} name={r.type} extension="jpg" />
                  )}
                  {r.value && <span className="align-middle">{r.value}</span>}
                </span>
              ))}
            </span>
          </div>
        ) : null}

        {hasRetreat ? (
          <div>
            <span>Retreat</span>{" "}
            <span className="inline-flex flex-wrap items-center gap-2 align-middle">
              {(retreat ?? [])
                .flatMap((rr) => rr?.costs ?? [])
                .map((cost, i) => (
                  <CardIcon
                    key={`c-${i}`}
                    series={series}
                    name={cost}
                    extension="jpg"
                  />
                ))}
            </span>
          </div>
        ) : null}
      </td>
    </tr>
  );
}
