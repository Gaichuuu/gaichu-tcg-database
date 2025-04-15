import { CollectionCard } from "./CollectionCard";
import { CollectionSeries } from "./CollectionSeries";
import { CollectionSet } from "./CollectionSet";

export interface SeriesAndSet {
    series: CollectionSeries;
    sets: CollectionSet[];
}

export interface SetAndCard {
    set: CollectionSet;
    cards: CollectionCard[];
}
