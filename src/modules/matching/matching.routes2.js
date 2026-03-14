import { Router } from "express";
import {
  runMatchingController,
  notifyCandidateController
} from "./matching.controller.js";

const router = Router();

router.get("/job-offers/:offerId/matches", runMatchingController);
router.post("/job-offers/:offerId/candidates/:candidateId/notify", notifyCandidateController);

export default router;