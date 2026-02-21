import { Router } from "express"
import { candidateController } from "./candidate.controller.js"

const router = Router();

router.post("/create", candidateController.createCandidate)
router.get("/get-all", candidateController.getAllCandidates)
router.get("/get-by-id/:id", candidateController.getCandidateById)
router.put("/update/:id", candidateController.updateCandidate)


export default router