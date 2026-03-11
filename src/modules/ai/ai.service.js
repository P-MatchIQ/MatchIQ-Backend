/* import openai from "./OpenAI.API.js";

export async function evaluateCandidate(offer, candidate, baseScore) {

  try {

    const prompt = `
Eres un experto en reclutamiento técnico.

Oferta:
Título: ${offer.title}
Descripción: ${offer.description}
Experiencia mínima: ${offer.min_experience_years}
Nivel inglés requerido: ${offer.required_english_level}

Candidato:
Experiencia: ${candidate.experience_years}
Nivel inglés: ${candidate.english_level}
Skills: ${candidate.skills?.join(", ")}

Score matemático inicial: ${baseScore}

Devuelve SOLO JSON válido:

{
 "fit_score": number,
 "summary": string,
 "strengths": string[],
 "risks": string[],
 "recommendation": "strong" | "moderate" | "weak"
}
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Eres un experto en reclutamiento técnico."
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

    console.error("OpenAI evaluation error:", error.message);
    return null;

  }

} */