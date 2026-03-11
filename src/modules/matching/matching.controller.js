/* import { runMatching } from "./matching.service.js";

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

    const { ranking, aiCandidates } =
      await runMatching(offerId, aiTop);

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

} */