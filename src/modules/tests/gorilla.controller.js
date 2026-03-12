import {
  getGorillaTestForCandidateService,
  getFullGorillaTestService,
  getTestByOfferIdService,
} from "./gorilla.test.service.js";

import {
  submitGorillaTestService,
  getTestSubmissionsService,
  getCandidateSubmissionService,
} from "./gorilla.submission.service.js";

// ─────────────────────────────────────────────────────────────
// GET /tests/job-offers/:offerId/gorilla-test
// Returns test WITHOUT correct answers — for candidates
// ─────────────────────────────────────────────────────────────
export async function getGorillaTestController(req, res) {
  try {
    const test = await getGorillaTestForCandidateService(req.params.offerId);
    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error("[GorillaTest] getGorillaTestController:", error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /tests/job-offers/:offerId/gorilla-test/full
// Returns test WITH correct answers — admin only
// ─────────────────────────────────────────────────────────────
export async function getFullGorillaTestController(req, res) {
  try {
    const test = await getFullGorillaTestService(req.params.offerId);
    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error("[GorillaTest] getFullGorillaTestController:", error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /tests/job-offers/:offerId/test-info
// Returns test id + metadata for a given offer — used by n8n
// ─────────────────────────────────────────────────────────────
export async function getTestByOfferIdController(req, res) {
  try {
    const test = await getTestByOfferIdService(req.params.offerId);
    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error("[GorillaTest] getTestByOfferIdController:", error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /tests/gorilla-tests/:testId/submit
// Candidate submits answers — evaluated immediately
// Body: { candidate_id, answers: { "1": "A", "2": "C", ... } }
// ─────────────────────────────────────────────────────────────
export async function submitGorillaTestController(req, res) {
  try {
    const { testId } = req.params;
    const { candidate_id, answers } = req.body;

    if (!candidate_id) {
      return res.status(400).json({ success: false, message: "candidate_id is required" });
    }
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'answers must be an object e.g. { "1": "A", "2": "C", ... }',
      });
    }

    const result = await submitGorillaTestService(testId, candidate_id, answers);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[GorillaTest] submitGorillaTestController:", error.message);
    const isConflict = error.message.includes("already submitted");
    return res.status(isConflict ? 409 : 500).json({
      success: false,
      message: error.message,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /tests/gorilla-tests/:testId/submissions
// All submissions ranked by score DESC
// ─────────────────────────────────────────────────────────────
export async function getTestSubmissionsController(req, res) {
  try {
    const submissions = await getTestSubmissionsService(req.params.testId);
    return res.status(200).json({ success: true, total: submissions.length, submissions });
  } catch (error) {
    console.error("[GorillaTest] getTestSubmissionsController:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /tests/gorilla-tests/:testId/submissions/:candidateId
// Detailed result for one candidate
// ─────────────────────────────────────────────────────────────
export async function getCandidateSubmissionController(req, res) {
  try {
    const { testId, candidateId } = req.params;
    const submission = await getCandidateSubmissionService(testId, candidateId);
    return res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error("[GorillaTest] getCandidateSubmissionController:", error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
} 