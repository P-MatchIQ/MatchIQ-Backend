import {
  generateGorillaTestService,
  getGorillaTestForCandidateService,
  getFullGorillaTestService,
} from "./gorilla.test.service.js";

import {
  submitGorillaTestService,
  getTestSubmissionsService,
  getCandidateSubmissionService,
} from "./gorilla.submission.service.js";

// ─────────────────────────────────────────────────────────────
// POST /job-offers/:offerId/gorilla-test/generate
// Generates a Gorilla Test for the top 20 matched candidates
// Query: ?force=true to regenerate even if one already exists
// ─────────────────────────────────────────────────────────────
export async function generateGorillaTestController(req, res) {
  try {
    const { offerId } = req.params;
    const forceRegenerate = req.query.force === "true";

    const result = await generateGorillaTestService(offerId, forceRegenerate);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error("[GorillaTest] generateGorillaTestController:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /job-offers/:offerId/gorilla-test
// Returns the test WITHOUT correct answers — safe for candidates
// ─────────────────────────────────────────────────────────────
export async function getGorillaTestController(req, res) {
  try {
    const { offerId } = req.params;
    const test = await getGorillaTestForCandidateService(offerId);
    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error("[GorillaTest] getGorillaTestController:", error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /job-offers/:offerId/gorilla-test/full
// Returns the full test WITH correct answers — admin only
// ─────────────────────────────────────────────────────────────
export async function getFullGorillaTestController(req, res) {
  try {
    const { offerId } = req.params;
    const test = await getFullGorillaTestService(offerId);
    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error("[GorillaTest] getFullGorillaTestController:", error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /gorilla-tests/:testId/submit
// Candidate submits their answers — evaluated immediately
//
// Body: {
//   "candidate_id": "uuid",
//   "answers": { "1": "A", "2": "C", "3": "B", ... "15": "D" }
// }
// ─────────────────────────────────────────────────────────────
export async function submitGorillaTestController(req, res) {
  try {
    const { testId } = req.params;
    const { candidate_id, answers } = req.body;

    if (!candidate_id) {
      return res.status(400).json({
        success: false,
        message: "candidate_id is required",
      });
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
// GET /gorilla-tests/:testId/submissions
// Returns all candidate submissions ranked by score DESC
// ─────────────────────────────────────────────────────────────
export async function getTestSubmissionsController(req, res) {
  try {
    const { testId } = req.params;
    const submissions = await getTestSubmissionsService(testId);
    return res.status(200).json({
      success: true,
      total: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("[GorillaTest] getTestSubmissionsController:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /gorilla-tests/:testId/submissions/:candidateId
// Returns the detailed result for a specific candidate
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