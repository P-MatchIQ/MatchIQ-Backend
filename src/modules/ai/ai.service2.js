import openai from "./openAI.API.js";

export async function evaluateSingleCandidate(offer, candidates) {

  try {

    const candidatesData = candidates.map((c, index) => `
Candidate ${index + 1}:
id: ${c.candidate_id}
match_score: ${c.final_match_percentage}
experience_years: ${c.experience_years}
english_level: ${c.english_level}
skills: ${c.matched_skills}
missing_skills: ${c.missing_skills}
`).join("\n");

    const prompt = `
You are an expert technical recruiter.

Analyze the following job offer and ALL the candidates listed below.

JOB OFFER
Title: ${offer.title}
Description: ${offer.description}
Minimum experience: ${offer.min_experience_years}
Required English level: ${offer.required_english_level}

CANDIDATES
${candidatesData}

Based on the job offer requirements, analyze all candidates as a group and provide:
- A general overview of the candidate pool quality
- Which candidates stand out the most and why
- Which candidates are the best fit for this role

Return ONLY valid JSON with this exact structure:

{
  "general_feedback": "A paragraph explaining the overall quality of the candidate pool, common strengths, common weaknesses, and how well they fit the offer in general",
  "best_candidates": [
    {
    "candidate_id": "string",
    "fit_score": number,
    "insight": "short recruiter explanation",
    "strengths": ["string"],
    "opportunity_for_improvement": ["string"],
    "recommendation": "strong" | "moderate" | "weak"
      "candidate_id": "string",
      "reason": "Why this candidate stands out above the rest"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      //stream : true,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an expert technical recruiter."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      general_feedback: parsed.general_feedback || null,
      best_candidates: parsed.best_candidates || []
    };

  } catch (error) {

    console.error("AI evaluation error:", error.message);
    return { general_feedback: null, best_candidates: [] };

  }

}