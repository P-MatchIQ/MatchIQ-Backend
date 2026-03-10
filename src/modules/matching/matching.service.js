import db from "../../config/db.js";
import aiService from "../ai/ai.service.js";

/**
 * Matching usando la función SQL optimizada
 */
export async function runMatching(offerId, aiTop = 3) {

  try {

    // Obtener ranking desde PostgreSQL
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

    //Evaluación IA (opcional)
    for (const candidate of topCandidates) {

      const aiResult = await aiService.evaluateCandidate(
        offerId,
        candidate.candidate_id,
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
}

module.exports = {
  runMatching,
};