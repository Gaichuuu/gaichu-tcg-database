// src/pages/CardBackMock.tsx
import React from "react";
const CardDetailPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center md:w-1/3">
          <img
            src={"https://gaichu.b-cdn.net/wm/set1/00.jpg"}
            className="border-secondaryBorder mb-4 block max-h-[600px] rounded-3xl border-1 object-contain shadow"
          />
          <div className="mt-0 flex w-full max-w-xs gap-4"></div>
        </div>
        <div className="md:w-2/3">
          <h2 className="mb-4 text-3xl">Card Back</h2>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <th className="py-2 pr-4 text-left">Text</th>
                <td className="py-2">Parody</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left">Note</th>
                <td className="py-2">
                  The illustration on the back was changed.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CardDetailPage;
