import CardIcon from "./CardIcon";

interface StrengthEntry {
  type?: string[];
  value?: string;
}

interface ZooAttributesSectionProps {
  series: string;
  strength?: StrengthEntry[];
}

export default function ZooAttributesSection({
  series,
  strength,
}: ZooAttributesSectionProps) {
  const hasStrength = strength?.length;

  if (!hasStrength) return null;

  return (
    <tr>
      <th>Attributes</th>
      <td>
        <div>
          <span>Strong Against</span>{" "}
          <span className="mb-1 inline-flex flex-wrap items-center gap-2 align-middle">
            {strength!.map((s, i) => (
              <span key={`s-${i}`} className="inline-flex items-center gap-1">
                {s.type?.map((t, j) => (
                  <CardIcon
                    key={`s-${i}-t-${j}`}
                    series={series}
                    name={t}
                    extension="jpg"
                  />
                ))}
                {s.value && <span className="align-middle">{s.value}</span>}
              </span>
            ))}
          </span>
        </div>
      </td>
    </tr>
  );
}
