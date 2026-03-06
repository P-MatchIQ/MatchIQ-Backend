const {
  JobOffer,
  CandidateProfile,
  OfferSkill,
  CandidateSkill,
  OfferCategory,
  CandidateCategory
} = require('../../models');

const aiService = require('../ai/ai.service');
const pLimit = require('p-limit');

/**
 * Matching optimizado y preparado para volumen alto
 */
async function runMatching(offerId, aiTop = 3) {
  try {

    // =====================================================
    // 1️⃣ Obtener oferta
    // =====================================================
    const offer = await JobOffer.findByPk(offerId);
    if (!offer) throw new Error('Offer not found');

    // =====================================================
    // 2️⃣ Categorías de la oferta
    // =====================================================
    const offerCategories = await OfferCategory.findAll({
      where: { offer_id: offerId }
    });

    const offerCategoryIds = offerCategories.map(c => c.category_id);

    // =====================================================
    // 3️⃣ Filtrar candidatos por categoría
    // =====================================================
    const candidateCategories = await CandidateCategory.findAll({
      where: { category_id: offerCategoryIds }
    });

    const candidateIds = [
      ...new Set(candidateCategories.map(c => c.candidate_id))
    ];

    if (candidateIds.length === 0) {
      return { ranking: [], aiCandidates: [] };
    }

    const candidates = await CandidateProfile.findAll({
      where: { id: candidateIds }
    });

    // =====================================================
    // 4️⃣ Skills requeridas
    // =====================================================
    const offerSkills = await OfferSkill.findAll({
      where: { offer_id: offerId }
    });

    const requiredSkillsMap = {};
    offerSkills.forEach(skill => {
      requiredSkillsMap[skill.skill_id] = skill.required_level;
    });

    // =====================================================
    // 5️⃣ Skills de candidatos
    // =====================================================
    const candidateSkills = await CandidateSkill.findAll({
      where: { candidate_id: candidateIds }
    });

    const skillsMap = {};
    candidateSkills.forEach(cs => {
      if (!skillsMap[cs.candidate_id]) {
        skillsMap[cs.candidate_id] = [];
      }

      skillsMap[cs.candidate_id].push({
        skill_id: cs.skill_id,
        level: cs.level
      });
    });

    // =====================================================
    // 6️⃣ Crear mapa de candidatos (O(1))
    // =====================================================
    const candidateMap = {};
    candidates.forEach(c => {
      candidateMap[c.id] = c;
    });

    // =====================================================
    // 7️⃣ Calcular score matemático
    // =====================================================
    const results = [];

    for (const candidate of candidates) {

      let skillScoreTotal = 0;
      let maxSkillScore = 0;

      const candidateSkillList = skillsMap[candidate.id] || [];

      for (const skillId in requiredSkillsMap) {

        const requiredLevel = requiredSkillsMap[skillId];
        maxSkillScore++;

        const candidateSkill = candidateSkillList
          .find(s => s.skill_id === Number(skillId));

        if (!candidateSkill) continue;

        if (candidateSkill.level >= requiredLevel) {
          skillScoreTotal += 1;
        } else {
          skillScoreTotal += candidateSkill.level / requiredLevel;
        }
      }

      const skillScore =
        maxSkillScore > 0
          ? (skillScoreTotal / maxSkillScore) * 60
          : 0;

      const experienceScore =
        offer.min_experience_years > 0
          ? Math.min(candidate.experience_years / offer.min_experience_years, 1) * 20
          : 0;

      const englishLevels = {
        A1: 1, A2: 2,
        B1: 3, B2: 4,
        C1: 5, C2: 6
      };

      const candidateEnglish = englishLevels[candidate.english_level] || 0;
      const requiredEnglish = englishLevels[offer.required_english_level] || 0;

      const englishScore =
        requiredEnglish > 0
          ? Math.min(candidateEnglish / requiredEnglish, 1) * 20
          : 0;

      const baseScore = Number(
        (skillScore + experienceScore + englishScore).toFixed(2)
      );

      results.push({
        candidate_id: candidate.id,
        base_score: baseScore
      });
    }

    // =====================================================
    // 8️⃣ Ordenar ranking
    // =====================================================
    const sortedResults = results.sort(
      (a, b) => b.base_score - a.base_score
    );

    // =====================================================
    // 9️⃣ Top N para IA
    // =====================================================
    const aiLimit = Number(aiTop) || 3;
    const topCandidatesForAI = sortedResults.slice(0, aiLimit);

    // =====================================================
    // 🔟 IA con limitador de concurrencia
    // =====================================================
    const limit = pLimit(3); // máximo 3 requests simultáneos

    await Promise.all(
      topCandidatesForAI.map(candidateMatch =>
        limit(async () => {

          const candidate = candidateMap[candidateMatch.candidate_id];

          candidate.skills =
            (skillsMap[candidate.id] || []).map(s => s.skill_id);

          const aiResult = await aiService.evaluateCandidate(
            offer,
            candidate,
            candidateMatch.base_score
          );

          if (aiResult) {
            candidateMatch.ai_feedback = aiResult;
            candidateMatch.ai_score = aiResult.fit_score;

            const adjustedScore =
              candidateMatch.base_score * 0.9 +
              aiResult.fit_score * 0.1;

            candidateMatch.adjusted_score =
              Number(adjustedScore.toFixed(2));
          }

        })
      )
    );

    return {
      ranking: sortedResults,
      aiCandidates: topCandidatesForAI
    };

  } catch (error) {
    console.error('Matching service error:', error.message);
    throw error;
  }
}

module.exports = {
  runMatching,
};