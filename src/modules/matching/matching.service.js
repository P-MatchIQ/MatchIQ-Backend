/* import db from "../../config/db.js";
import { evaluateCandidate } from "../ai/ai.service.js";

export async function runMatching(offerId, aiTop = 3) {

  try {

    // Obtener ranking desde la función SQL
    const query = `
      SELECT *
      FROM get_candidate_matches($1)
      ORDER BY final_match_percentage DESC
    `;

    const result = await db.query(query, [offerId]);

    const ranking = result.rows;

    if (!ranking.length) {
      return {
        ranking: [],
        aiCandidates: []
      };
    }

    // Top candidatos para IA
    const topCandidates = ranking.slice(0, aiTop);

    // Obtener oferta para contexto IA
    const offerQuery = `
      SELECT *
      FROM job_offers
      WHERE id = $1
    `;

    const offerResult = await db.query(offerQuery, [offerId]);
    const offer = offerResult.rows[0];

    // Evaluación IA
    for (const candidate of topCandidates) {

      const aiResult = await evaluateCandidate(
        offer,
        candidate,
        candidate.final_match_percentage
      );

      if (aiResult) {

        candidate.ai_feedback = aiResult;

        const adjustedScore =
          candidate.final_match_percentage * 0.9 +
          aiResult.fit_score * 0.1;

        candidate.adjusted_score =
          Number(adjustedScore.toFixed(2));

      }

    }

    return {
      ranking,
      aiCandidates: topCandidates
    };

  } catch (error) {

    console.error("Matching service error:", error);

    throw error;

  }

} */