import db from "../../config/db.js";
import { evaluateSingleCandidate } from "../ai/ai.service.js";

// ─── queries reutilizables ───
const getOffer = (offerId) => db.query(`
  SELECT jo.id, jo.title, jo.description, jo.min_experience_years, 
         jo.required_english_level,
         cp.company_name
  FROM job_offers jo
  INNER JOIN company_profiles cp 
  ON cp.id = jo.company_id
  WHERE jo.id = $1
`, [offerId]);;

const getCandidate = (candidateId) => db.query(`
  SELECT u.email,
  COALESCE(
    NULLIF(TRIM(cp.first_name || ' ' || cp.last_name), ''),
    SPLIT_PART(u.email, '@', 1)
  ) AS name
  FROM users u
  INNER JOIN candidate_profiles cp ON cp.user_id = u.id
  WHERE cp.id = $1
`, [candidateId]);

// ─── matching principal ───
export async function runMatching(offerId, aiTop = 3) {

  const [rankingResult, offerResult] = await Promise.all([
    db.query(`
      SELECT * FROM get_candidate_matches($1)
      ORDER BY final_match_percentage DESC
    `, [offerId]),
    getOffer(offerId)
  ]);

  const ranking = rankingResult.rows;
  if (!ranking.length) return { ranking: [], aiResult: null };

  const offer = offerResult.rows[0];

  // Toma el top N para evaluar con IA
  const topCandidates = ranking.slice(0, aiTop);

  // Una sola llamada con todos los candidatos
  const aiResult = await evaluateSingleCandidate(offer, topCandidates);

  return {
    ranking,
    aiResult
  };
}

// ─── notificación ───
export async function notifyCandidate(offerId, candidateId, status) {

  const [candidateResult, offerResult] = await Promise.all([
    getCandidate(candidateId),
    getOffer(offerId)
  ]);

  const candidate = candidateResult.rows[0];
  const offer = offerResult.rows[0];

  if (!candidate) throw new Error("Candidato no encontrado");
  if (!offer) throw new Error("Oferta no encontrada");

  console.log("Payload a n8n:", {
  candidate_name: candidate.name,
  candidate_email: candidate.email,
  offer_title: offer.title,
  company_name: offer.company_name,
  status
});

  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      offer_title: offer.title,
      company_name: offer.company_name,
      status
    })
  });

  if (!response.ok) throw new Error(`n8n webhook error: ${response.status}`);

  return { notified: true, candidate_email: candidate.email };
}