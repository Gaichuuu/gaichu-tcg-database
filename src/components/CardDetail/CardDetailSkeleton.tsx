import React from "react";
import { CARD_ART_VT } from "@/utils/viewTransition";

const bar = "bg-secondaryBorder";

const CardDetailSkeleton: React.FC<{ label?: string }> = ({
  label = "Loading card…",
}) => (
  <div
    role="status"
    aria-busy="true"
    className="grid animate-pulse gap-y-6 lg:grid-cols-[408px_minmax(0,1fr)] lg:gap-x-9 lg:gap-y-8"
  >
    <span className="sr-only">{label}</span>
    <div className="flex flex-col gap-3.5 lg:col-start-2 lg:row-start-1">
      <div className={`${bar} h-9 w-1/2 max-w-80`} />
      <div className="flex gap-2">
        <div className={`${bar} h-6 w-16`} />
        <div className={`${bar} h-6 w-14`} />
        <div className={`${bar} h-6 w-24`} />
      </div>
    </div>
    <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
      <div
        className={`${bar} mx-auto aspect-408/570 w-full max-w-102 rounded-[24px]`}
        style={{ viewTransitionName: CARD_ART_VT }}
      />
    </div>
    <div className="flex flex-col gap-8 lg:col-start-2 lg:row-start-2">
      <div className="tile h-72" />
      <div className="tile h-24" />
    </div>
  </div>
);

export default CardDetailSkeleton;
