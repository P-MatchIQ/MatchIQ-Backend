import db from "../../config/db.js";
import { generateGorillaTest } from "../ai/gorilla.ai.service.js";

const GORILLA_TOP = 20;

/**
 * Generates a Gorilla Test for the top 20 matched candidates of a job offer.
 * Persists the test in the existing `tests` table using `description` as JSON storage.
 * If a test already exists for the offer, returns it without regenerating.
 */
export async function generateGorillaTestService(offerId, forceRegenerate = false) {

  // 1️⃣ Return existing test if already generated (unless force=true)
  if (!forceRegenerate) {
    const existingTest = await db.query(
      `SELECT * FROM tests WHERE offer_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [offerId]
    );

    if (existingTest.rows.length > 0) {
      return {
        message: "Test already exists for this offer",
        test: existingTest.rows[0],
        regenerated: false,
      };
    }
  }

  // 2️⃣ Fetch top 20 candidates by match percentage
  const rankingResult = await db.query(
    `SELECT * FROM get_candidate_matches($1)
     ORDER BY final_match_percentage DESC
     LIMIT $2`,
    [offerId, GORILLA_TOP]
  );

  const candidates = rankingResult.rows;

  if (!candidates || candidates.length === 0) {
    throw new Error(`No candidates found for offer ${offerId}`);
  }

  // 3️⃣ Fetch job offer data
  const offerResult = await db.query(
    `SELECT id, title, description, min_experience_years, required_english_level
     FROM job_offers WHERE id = $1`,
    [offerId]
  );

  const offer = offerResult.rows[0];
  if (!offer) throw new Error(`Job offer ${offerId} not found`);

  // 4️⃣ Generate test questions via AI
  const aiTest = await generateGorillaTest(offer, candidates);

  // 5️⃣ Persist in `tests` table
  // The full test (questions + answers + metadata) is stored as JSON in `description`
  const testPayload = JSON.stringify({
    test_title: aiTest.test_title,
    total_questions: aiTest.total_questions,
    questions: aiTest.questions,
    candidates_snapshot: candidates.map((c) => ({
      candidate_id: c.candidate_id,
      final_match_percentage: c.final_match_percentage,
    })),
    type: "gorilla",
  });

  const insertResult = await db.query(
    `INSERT INTO tests (offer_id, description, time_limit_minutes, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [offerId, testPayload, 30]
  );

  return {
    message: "Gorilla test generated successfully",
    test: insertResult.rows[0],
    regenerated: forceRegenerate,
    candidates_count: candidates.length,
  };
}

/**
 * Returns the active test for a job offer WITHOUT correct answers.
 * Safe to send directly to candidates.
 */
export async function getGorillaTestForCandidateService(offerId) {
  const result = await db.query(
    `SELECT id, offer_id, time_limit_minutes, created_at, description
     FROM tests
     WHERE offer_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [offerId]
  );

  if (result.rows.length === 0) {
    throw new Error(`No gorilla test found for offer ${offerId}`);
  }

  const row = result.rows[0];
  const parsed = JSON.parse(row.description);

  // Strip correct answers before returning to candidate
  const safeQuestions = parsed.questions.map(
    ({ correct_answer, explanation, gorilla_hint, ...q }) => q
  );

  return {
    id: row.id,
    offer_id: row.offer_id,
    test_title: parsed.test_title,
    total_questions: parsed.total_questions,
    time_limit_minutes: row.time_limit_minutes,
    created_at: row.created_at,
    questions: safeQuestions,
  };
}

/**
 * Returns the full test WITH correct answers and explanations.
 * For internal / admin use only.
 */
export async function getFullGorillaTestService(offerId) {
  const result = await db.query(
    `SELECT * FROM tests WHERE offer_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [offerId]
  );

  if (result.rows.length === 0) {
    throw new Error(`No gorilla test found for offer ${offerId}`);
  }

  const row = result.rows[0];
  const parsed = JSON.parse(row.description);

  return {
    id: row.id,
    offer_id: row.offer_id,
    test_title: parsed.test_title,
    total_questions: parsed.total_questions,
    time_limit_minutes: row.time_limit_minutes,
    created_at: row.created_at,
    questions: parsed.questions,
    candidates_snapshot: parsed.candidates_snapshot,
  };
}