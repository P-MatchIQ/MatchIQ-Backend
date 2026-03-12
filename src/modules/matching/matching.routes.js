import { Router } from "express";
import { runMatchingController } from "./matching.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";

const router = Router();

router.get("/job-offers/:offerId/matches", authenticate, authorize("company", "admin"), runMatchingController);

export default router;