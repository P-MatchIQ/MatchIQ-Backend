import { Router } from "express";
import { getMatchesByOffer } from "./matching.controller.js";

const router = Router();

router.get(
  "/job-offers/:offerId/matches",
  getMatchesByOffer
);

export default router;