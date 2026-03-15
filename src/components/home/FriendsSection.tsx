import React from "react";
import { FiExternalLink } from "react-icons/fi";

interface Friend {
  name: string;
  url: string;
  description: string;
}

const FRIENDS: Friend[] = [
  {
    name: "OpenZoo Card Creator",
    url: "https://openzootcg.com/",
    description: "Web-based card creator for the OpenZoo trading card game.",
  },
  {
    name: "MetaZaurus",
    url: "https://metazaurus.com/",
    description:
      "Ultimate PDA reader application for MetaZoo: Cryptid Nation lore.",
  },
  {
    name: "MetaZoo Cryptids",
    url: "https://www.metazoocryptids.com/",
    description:
      "Complete card database and cryptid encyclopedia for vintage MetaZoo.",
  },
];

function faviconUrl(siteUrl: string): string {
  const domain = new URL(siteUrl).hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const FriendsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {FRIENDS.map((friend) => (
        <a
          key={friend.name}
          href={friend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group border-secondaryBorder hover:border-hoverBorder flex items-start gap-3 rounded-lg border p-4 transition-colors"
        >
          <img
            src={faviconUrl(friend.url)}
            alt=""
            width={24}
            height={24}
            className="mt-1 shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-linkAlt group-hover:text-linkAltHover inline-flex items-center gap-1.5 font-bold">
              {friend.name}
              <FiExternalLink className="text-linkAlt group-hover:text-linkAltHover h-3.5 w-3.5" />
            </span>
            <span className="text-secondaryText mt-1 text-sm">
              {friend.description}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default FriendsSection;
