import db from "../../config/db.js";
import { evaluateTopCandidates } from "../ai/ai.service.js";

export async function runMatching(offerId, aiTop = 5) {

  try {

    // =========================================
    // 1️⃣ Obtener ranking desde PostgreSQL
    // (tu función ya trae LIMIT 20)
    // =========================================

    const query = `
      SELECT *
      FROM get_candidate_matches($1)
      ORDER BY final_match_percentage DESC
    `;

    const result = await db.query(query, [offerId]);

    const ranking = result.rows;

    if (!ranking || ranking.length === 0) {
      return {
        ranking: [],
        aiCandidates: []
      };
    }

    // =========================================
    // 2️⃣ Obtener datos de la oferta
    // =========================================

    const offerQuery = `
      SELECT id, title, description, min_experience_years, required_english_level
      FROM job_offers
      WHERE id = $1
    `;

    const offerResult = await db.query(offerQuery, [offerId]);
    const offer = offerResult.rows[0];

    // =========================================
    // 3️⃣ Tomar Top candidatos para IA
    // =========================================

    const topCandidates = ranking.slice(0, aiTop);

    // =========================================
    // 4️⃣ Enviar candidatos a la IA
    // =========================================

    const aiResult = await evaluateTopCandidates(
      offer,
      topCandidates
    );

    // =========================================
    // 5️⃣ Integrar feedback de IA
    // =========================================

    if (aiResult && aiResult.candidates) {

      for (const candidate of topCandidates) {

        const aiCandidate = aiResult.candidates.find(
          c => c.candidate_id === candidate.candidate_id
        );

        if (aiCandidate) {

          candidate.ai_feedback = aiCandidate;

          // score combinado
          const adjustedScore =
            candidate.final_match_percentage * 0.9 +
            aiCandidate.fit_score * 0.1;

          candidate.adjusted_score =
            Number(adjustedScore.toFixed(2));

        }

      }

    }

    // =========================================
    // 6️⃣ Retornar resultados
    // =========================================

    return {
      ranking,
      aiCandidates: topCandidates
    };

  } catch (error) {

    console.error("Matching service error:", error);

    throw error;

  }

}