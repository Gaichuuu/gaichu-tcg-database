import { CollectionSeries } from "./CollectionSeries";
import { CollectionSet } from "./CollectionSet";

export interface MergedCollectionSeries {
    series: CollectionSeries;
    sets: CollectionSet[];
}