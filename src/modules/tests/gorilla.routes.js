import { Router } from "express";
import {
  generateGorillaTestController,
  getGorillaTestController,
  getFullGorillaTestController,
  submitGorillaTestController,
  getTestSubmissionsController,
  getCandidateSubmissionController,
} from "./gorilla.controller.js";

const router = Router();

// ── Job Offer routes ──────────────────────────────────────────────────────────

/**
 * POST /api/job-offers/:offerId/gorilla-test/generate
 * Generates a Gorilla Test for the top 20 candidates of the offer.
 * Add ?force=true to regenerate even if a test already exists.
 */
router.post(
  "/job-offers/:offerId/gorilla-test/generate",
  generateGorillaTestController
);

/**
 * GET /api/job-offers/:offerId/gorilla-test
 * Returns the test WITHOUT correct answers — intended for candidates.
 */
router.get(
  "/job-offers/:offerId/gorilla-test",
  getGorillaTestController
);

/**
 * GET /api/job-offers/:offerId/gorilla-test/full
 * Returns the full test WITH correct answers and explanations — admin only.
 */
router.get(
  "/job-offers/:offerId/gorilla-test/full",
  getFullGorillaTestController
);

// ── Test submission routes ────────────────────────────────────────────────────

/**
 * POST /api/gorilla-tests/:testId/submit
 * Candidate submits answers. Evaluated immediately by the AI engine.
 *
 * Body:
 * {
 *   "candidate_id": "uuid",
 *   "answers": { "1": "A", "2": "C", "3": "B", ... "15": "D" }
 * }
 */
router.post(
  "/gorilla-tests/:testId/submit",
  submitGorillaTestController
);

/**
 * GET /api/gorilla-tests/:testId/submissions
 * Returns all submissions for a test, ranked by score DESC.
 * Includes candidate name, seniority, english_level, attention_level.
 */
router.get(
  "/gorilla-tests/:testId/submissions",
  getTestSubmissionsController
);

/**
 * GET /api/gorilla-tests/:testId/submissions/:candidateId
 * Returns the detailed result for a specific candidate.
 */
router.get(
  "/gorilla-tests/:testId/submissions/:candidateId",
  getCandidateSubmissionController
);

export default router;