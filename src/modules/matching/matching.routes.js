import { Router } from "express";
import { runMatchingController, notifyCandidateController } from "./matching.controller.js";


const router = Router();

router.get("/job-offers/:offerId/matches", runMatchingController);

// NUEVA ruta de notificación
// La empresa llama a este endpoint cuando selecciona un candidato
router.post("/job-offers/:offerId/candidates/:candidateId/notify", notifyCandidateController);

export default router;