import React from "react";

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
  {
    name: "MetaZoo NFTs",
    url: "https://metazoonfts.com/",
    description:
      "Check your MetaZoo NFT wallet's profit and loss and see how you rank.",
  },
];

function faviconUrl(siteUrl: string): string {
  const domain = new URL(siteUrl).hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const FriendsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {FRIENDS.map((friend) => (
        <a
          key={friend.name}
          href={friend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group tile tile-link flex items-start gap-3 p-4 font-normal"
        >
          <span className="bg-mainBg border-tileBorder grid size-8 shrink-0 place-items-center overflow-hidden border-2">
            <img
              src={faviconUrl(friend.url)}
              loading="lazy"
              decoding="async"
              alt=""
              width={20}
              height={20}
              className="block transition-transform duration-250 group-hover:scale-[1.12] group-focus-visible:scale-[1.12]"
            />
          </span>
          <span className="flex flex-col">
            <span className="text-linkAlt text-[15px] font-extrabold">
              {friend.name} ↗
            </span>
            <span className="text-secondaryText mt-1 text-[12.5px] leading-relaxed text-pretty">
              {friend.description}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
};

export default FriendsSection;
