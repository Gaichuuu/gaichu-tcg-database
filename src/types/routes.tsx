// src/types/routes.ts
export type CollectionParamKeys =
  | "seriesShortName"
  | "setShortName"
  | "sortByAndCardName";

export type CollectionParams = {
  seriesShortName?: string;
  setShortName?: string;
  sortByAndCardName?: string;
};

export type ArtParamKeys = "seriesShortName" | "setShortName";

export type ArtParams = {
  seriesShortName?: string;
  setShortName?: string;
};
