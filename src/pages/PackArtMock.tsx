// src/pages/PackArtMock.tsx
import React, { useState } from "react";

const packImages = [
  {
    url: "https://gaichu.b-cdn.net/wm/set1/pack01.jpg",
    alt: "Front of Pack",
  },
  {
    url: "https://gaichu.b-cdn.net/wm/set2/pack01.jpg",
    alt: "Back of Pack",
  },
  // Add more images as needed
];

const PackArtMock: React.FC = () => {
  const [mainIndex, setMainIndex] = useState(0);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={packImages[mainIndex].url}
            alt={packImages[mainIndex].alt}
            className="border-secondaryBorder mb-4 block max-h-[600px] border-1 object-contain shadow"
          />
          {/* Thumbnails */}
          <div className="mt-2 flex gap-2">
            {packImages.map((img, idx) => (
              <button
                key={img.url}
                className={`rounded border-2 p-0.5 shadow-sm ${
                  idx === mainIndex
                    ? "border-blue-400"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                onClick={() => setMainIndex(idx)}
                tabIndex={0}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-16 w-16 rounded object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="md:w-2/3">
          <h2 className="mb-4 text-3xl">Pack Art</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <th className="py-2 pr-4 text-left">Front</th>
                <td className="py-2">
                  Mojiri Card Trading Cards. A rare holographic card has been
                  released. If no one buys this card, I'll be in big trouble. I
                  borrowed money from some shady people to make this card. I'm
                  scared.
                </td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left">Back</th>
                <td className="py-2">
                  Each of these? Amazing. 7 Trading cards.
                </td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left">Note</th>
                <td className="py-2">
                  Many things were changed on this pack art.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackArtMock;
