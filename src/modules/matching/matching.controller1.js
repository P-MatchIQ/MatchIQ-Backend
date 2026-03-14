import { runMatching, notifyCandidate } from "./matching.service.js";

export async function runMatchingController(req, res, next) {
  try {

    const { offerId } = req.params;
    const { aiTop } = req.query;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: "offerId is required"
      });
    }

    const { ranking, aiCandidates } = await runMatching(offerId, aiTop);

    return res.status(200).json({
      success: true,
      message: "Matching executed successfully",
      total_candidates: ranking.length,
      ranking,
      ai_evaluation_candidates: aiCandidates
    });

  } catch (error) {
    console.error("Matching controller error:", error);
    next(error);
  }
}

export async function notifyCandidateController(req, res, next) {
  try {

    const { offerId, candidateId } = req.params;
    const { status } = req.body;

    if (!offerId || !candidateId || !status) {
      return res.status(400).json({
        success: false,
        message: "offerId, candidateId y status son requeridos"
      });
    }

    const validStatuses = ["technical_test", "approved", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status debe ser uno de: ${validStatuses.join(", ")}`
      });
    }

    const result = await notifyCandidate(offerId, candidateId, status);

    return res.status(200).json({
      success: true,
      message: "Notificación enviada correctamente",
      ...result
    });

  } catch (error) {
    console.error("Notify controller error:", error);
    next(error);
  }
}