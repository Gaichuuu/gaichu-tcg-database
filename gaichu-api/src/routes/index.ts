import { Router } from "express";
import cardsRouter from "./cards.js";
import seriesRouter from "./series.js";
import setsRouter from "./sets.js";
import illustratorsRouter from "./illustrators.js";
import rarityRouter from "./rarity.js";
import statsRouter from "./stats.js";
import pricesRouter from "./prices.js";

const router = Router();

router.use("/cards", cardsRouter);
router.use("/series", seriesRouter);
router.use("/sets", setsRouter);
router.use("/illustrators", illustratorsRouter);
router.use("/rarity", rarityRouter);
router.use("/stats", statsRouter);
router.use("/prices", pricesRouter);

export default router;
