import React, { useMemo } from "react";

// src/components/IconText.tsx
const ICON_URLS: Record<string, Record<string, string>> = {
  oz: {
    "4th_wall": "https://gaichu.b-cdn.net/oz/icon4thWall.png",
    burn: "https://gaichu.b-cdn.net/oz/iconBurn.png",
    convert: "https://gaichu.b-cdn.net/oz/iconConvert.png",
    dark: "https://gaichu.b-cdn.net/oz/iconDark.jpg",
    defender: "https://gaichu.b-cdn.net/oz/iconDefender.png",
    earth: "https://gaichu.b-cdn.net/oz/iconEarth.jpg",
    first_strike: "https://gaichu.b-cdn.net/oz/iconFirstStrike.png",
    flame: "https://gaichu.b-cdn.net/oz/iconFlame.jpg",
    fleet: "https://gaichu.b-cdn.net/oz/iconFleet.png",
    flight: "https://gaichu.b-cdn.net/oz/iconFlight.png",
    frozen: "https://gaichu.b-cdn.net/oz/iconFrozen.png",
    immortal: "https://gaichu.b-cdn.net/oz/iconImmortal.png",
    invisible: "https://gaichu.b-cdn.net/oz/iconInvisible.png",
    lake: "https://gaichu.b-cdn.net/oz/iconLake.png",
    lightning: "https://gaichu.b-cdn.net/oz/iconLightning.jpg",
    lightning_storm: "https://gaichu.b-cdn.net/oz/iconLightningStorm.png",
    magiproof: "https://gaichu.b-cdn.net/oz/iconMagiproof.png",
    neutral: "https://gaichu.b-cdn.net/oz/iconNeutral.jpg",
    nighttime: "https://gaichu.b-cdn.net/oz/iconNighttime.png",
    paralyze: "https://gaichu.b-cdn.net/oz/iconParalyze.png",
    raining: "https://gaichu.b-cdn.net/oz/iconRaining.png",
    spectral: "https://gaichu.b-cdn.net/oz/iconSpectral.png",
    spirit: "https://gaichu.b-cdn.net/oz/iconSpirit.jpg",
    water: "https://gaichu.b-cdn.net/oz/iconWater.jpg",
    winter: "https://gaichu.b-cdn.net/oz/iconWinter.png",
  },
  ash: {
    fighting: "https://gaichu.b-cdn.net/ash/iconFighting.jpg",
    fire: "https://gaichu.b-cdn.net/ash/iconFire.jpg",
    grass: "https://gaichu.b-cdn.net/ash/iconGrass.jpg",
    lightning: "https://gaichu.b-cdn.net/ash/iconLightning.jpg",
    psychic: "https://gaichu.b-cdn.net/ash/iconPsychic.jpg",
    water: "https://gaichu.b-cdn.net/ash/iconWater.jpg",
  },
  mz: {
    daytime: "https://gaichu.b-cdn.net/mz/iconDaytime.png",
    woodlands: "https://gaichu.b-cdn.net/mz/iconWoodlands.png",
  },
};

const ICON_TOKEN_PATTERN = /(\{icon:([^}]+)\})/g;

interface IconTextProps {
  text: string | null | undefined;
  series: string;
  className?: string;
  preserveNewlines?: boolean;
}

function getIconUrl(series: string, iconName: string): string | null {
  return ICON_URLS[series]?.[iconName] ?? null;
}

function formatIconName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function IconText({
  text,
  series,
  className = "",
  preserveNewlines = true,
}: IconTextProps) {
  const rendered = useMemo(() => {
    if (!text) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    ICON_TOKEN_PATTERN.lastIndex = 0;

    while ((match = ICON_TOKEN_PATTERN.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(
          <TextWithNewlines
            key={`text-${lastIndex}`}
            text={textBefore}
            preserveNewlines={preserveNewlines}
          />,
        );
      }

      const iconName = match[2];
      const iconUrl = getIconUrl(series, iconName);

      if (iconUrl) {
        parts.push(
          <img
            key={`icon-${match.index}`}
            src={iconUrl}
            alt={formatIconName(iconName)}
            width={20}
            style={{
              display: "inline",
              verticalAlign: "middle",
              margin: "0 2px",
            }}
          />,
        );
      } else {
        parts.push(
          <span
            key={`unknown-${match.index}`}
            title={`Unknown icon: ${iconName}`}
          >
            [{iconName}]
          </span>,
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <TextWithNewlines
          key={`text-${lastIndex}`}
          text={text.slice(lastIndex)}
          preserveNewlines={preserveNewlines}
        />,
      );
    }

    return parts;
  }, [text, series, preserveNewlines]);

  if (!rendered || rendered.length === 0) return null;

  return <span className={className}>{rendered}</span>;
}

function TextWithNewlines({
  text,
  preserveNewlines,
}: {
  text: string;
  preserveNewlines: boolean;
}) {
  if (!preserveNewlines) {
    return <>{text}</>;
  }

  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}
