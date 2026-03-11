import openai from "./openai.API.js";

export async function evaluateTopCandidates(offer, candidates) {

  try {

    const candidatesData = candidates.map((c, index) => `
Candidate ${index + 1}
id: ${c.candidate_id}
match_score: ${c.final_match_percentage}
experience_years: ${c.experience_years}
english_level: ${c.english_level}
skills: ${c.matched_skills}
`).join("\n");


    const prompt = `
You are an expert technical recruiter.

Analyze the following job offer and the top candidates selected by the system.

JOB OFFER
Title: ${offer.title}
Description: ${offer.description}
Minimum experience: ${offer.min_experience_years}
Required English level: ${offer.required_english_level}

TOP CANDIDATES
${candidatesData}

Explain briefly why each candidate is a good or weak match.

Return ONLY valid JSON with this structure:

{
 "candidates": [
   {
     "candidate_id": "string",
     "fit_score": number,
     "insight": "short recruiter explanation",
     "strengths": ["string"],
     "risks": ["string"],
     "recommendation": "strong" | "moderate" | "weak"
   }
 ]
}
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
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

    return JSON.parse(content);

  } catch (error) {

    console.error("AI evaluation error:", error.message);
    return null;

  }

}