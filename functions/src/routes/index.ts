import { Router } from "express";
import cardsRouter from "./cards.js";
import seriesRouter from "./series.js";
import setsRouter from "./sets.js";
import illustratorsRouter from "./illustrators.js";
import rarityRouter from "./rarity.js";
import statsRouter from "./stats.js";

const router = Router();

router.use("/cards", cardsRouter);
router.use("/series", seriesRouter);
router.use("/sets", setsRouter);
router.use("/illustrators", illustratorsRouter);
router.use("/rarity", rarityRouter);
router.use("/stats", statsRouter);

export default router;
