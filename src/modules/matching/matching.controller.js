// const matchingService = require('./matching.service');
// const {offerId} = req.params;
// const [aiTop] = req.query

// const results = await matchingService.runMatching(offerId, aiTop);

// async function runMatching(req, res, next) {
//   try {
//     const { offerId } = req.params;
//     const { aiTop } = req.query;

//     if (!offerId) {
//       return res.status(400).json({
//         success: false,
//         message: 'offerId is required',
//       });
//     }

//     // Ahora el service retorna un objeto
//     const { ranking, aiCandidates } =
//       await matchingService.runMatching(offerId, aiTop);

//     return res.status(200).json({
//       success: true,
//       message: 'Matching executed successfully',
//       total_candidates: ranking.length,
//       ranking,
//       ai_evaluation_candidates: aiCandidates
//     });

//   } catch (error) {
//     next(error);
//   }
// }

// module.exports = {
//     runMatching,
// }