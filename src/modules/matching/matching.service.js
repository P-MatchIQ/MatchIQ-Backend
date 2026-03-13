import db from "../../config/db.js";
import { evaluateSingleCandidate } from "../ai/ai.service.js";

export async function runMatching(offerId, aiTop = 3) {

  try {

    const query = `
      SELECT *
      FROM get_candidate_matches($1)
      ORDER BY final_match_percentage DESC
    `;

    const result = await db.query(query, [offerId]);
    const ranking = result.rows;

    if (!ranking || ranking.length === 0) {
      return { ranking: [], aiCandidates: [] };
    }

    const offerQuery = `
      SELECT id, title, description, min_experience_years, required_english_level
      FROM job_offers
      WHERE id = $1
    `;
    const offerResult = await db.query(offerQuery, [offerId]);
    const offer = offerResult.rows[0];

    const topCandidates = ranking.slice(0, aiTop);

    const aiResults = await Promise.all(
      topCandidates.map(candidate => evaluateSingleCandidate(offer, candidate))
    );

    for (let i = 0; i < topCandidates.length; i++) {
      const aiCandidate = aiResults[i];
      if (aiCandidate) {
        topCandidates[i].ai_feedback = aiCandidate;
        const adjustedScore =
          topCandidates[i].final_match_percentage * 0.9 +
          aiCandidate.fit_score * 0.1;
        topCandidates[i].adjusted_score = Number(adjustedScore.toFixed(2));
      }
    }

    return { ranking, aiCandidates: topCandidates };

  } catch (error) {
    console.error("Matching service error:", error);
    throw error;
  }
}

export async function notifyCandidate(offerId, candidateId, status) {

  const candidateQuery = `
    SELECT u.email, cp.first_name || ' ' || cp.last_name AS name
    FROM users u
    INNER JOIN candidate_profiles cp ON cp.user_id = u.id
    WHERE cp.id = $1
  `;
  const candidateResult = await db.query(candidateQuery, [candidateId]);
  const candidate = candidateResult.rows[0];

  if (!candidate) throw new Error("Candidato no encontrado");

  const offerQuery = `
    SELECT title FROM job_offers WHERE id = $1
  `;
  const offerResult = await db.query(offerQuery, [offerId]);
  const offer = offerResult.rows[0];

  if (!offer) throw new Error("Oferta no encontrada");

  const payload = {
    candidate_name: candidate.name,
    candidate_email: candidate.email,
    offer_title: offer.title,
    status
  };

  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`n8n webhook error: ${response.status}`);
  }

  return { notified: true, candidate_email: candidate.email };
}