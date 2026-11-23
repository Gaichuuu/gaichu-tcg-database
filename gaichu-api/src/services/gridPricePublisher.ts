import { getFirestore } from "./priceStore.js";
import { priceToPublish, type SourcePrice } from "./gridPriceRule.js";

export { toCents } from "./gridPriceRule.js";

export interface PublishPlan {
  updates: Array<{ id: string; value: number }>;
  unchanged: number;
  noPrice: number;
  thinSample: number;
  missing: number;
}

export function planPublish(
  sourcePrices: Map<string, SourcePrice>,
  targetPrices: Map<string, number | null | undefined>,
): PublishPlan {
  const plan: PublishPlan = {
    updates: [],
    unchanged: 0,
    noPrice: 0,
    thinSample: 0,
    missing: 0,
  };
  for (const [id, source] of sourcePrices) {
    if (typeof source.average !== "number" || !(source.average > 0)) {
      plan.noPrice++;
      continue;
    }
    if (!targetPrices.has(id)) {
      plan.missing++;
      continue;
    }
    const current = targetPrices.get(id);
    const value = priceToPublish(source, current);
    if (value === null) {
      plan.thinSample++;
      continue;
    }
    if (current === value) {
      plan.unchanged++;
      continue;
    }
    plan.updates.push({ id, value });
  }
  return plan;
}

async function publish(
  sourceCollection: "card_prices" | "pack_prices",
  idField: "card_id" | "set_id",
  targetCollection: "cards" | "sets",
  targetField: "average_price" | "pack_average_price",
): Promise<PublishPlan> {
  const db = getFirestore();

  const source = await db
    .collection(sourceCollection)
    .select(idField, "prices.average_price", "prices.sample_size")
    .get();
  const sourcePrices = new Map<string, SourcePrice>();
  for (const doc of source.docs) {
    const d = doc.data() as {
      prices?: { average_price?: number | null; sample_size?: number | null };
    } & Record<string, unknown>;
    const id = (d[idField] as string | undefined) ?? doc.id;
    sourcePrices.set(id, {
      average: d.prices?.average_price,
      sampleSize: d.prices?.sample_size,
    });
  }

  const target = await db
    .collection(targetCollection)
    .select(targetField)
    .get();
  const targetPrices = new Map<string, number | null | undefined>();
  for (const doc of target.docs) {
    targetPrices.set(doc.id, doc.get(targetField) as number | null | undefined);
  }

  const plan = planPublish(sourcePrices, targetPrices);

  const BATCH = 400;
  for (let i = 0; i < plan.updates.length; i += BATCH) {
    const batch = db.batch();
    for (const { id, value } of plan.updates.slice(i, i + BATCH)) {
      batch.update(db.collection(targetCollection).doc(id), {
        [targetField]: value,
      });
    }
    await batch.commit();
  }

  console.log(
    `${targetCollection}.${targetField}: ${plan.updates.length} updated, ` +
      `${plan.unchanged} unchanged, ${plan.thinSample} kept (under 2 sales), ` +
      `${plan.noPrice} without a price, ` +
      `${plan.missing} with no ${targetCollection} doc`,
  );
  return plan;
}

export async function publishGridPrices(): Promise<{
  cards: PublishPlan;
  packs: PublishPlan;
}> {
  const cards = await publish(
    "card_prices",
    "card_id",
    "cards",
    "average_price",
  );
  const packs = await publish(
    "pack_prices",
    "set_id",
    "sets",
    "pack_average_price",
  );
  return { cards, packs };
}
