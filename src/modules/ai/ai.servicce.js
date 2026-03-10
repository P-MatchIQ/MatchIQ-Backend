// const openAI = require('openai');

// const openai = new openAI.OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function evaluateCandidates(offer, candidate, baseScore) {
//     try {
//         const prompt = `
//         Eres un experto en reclutamiento técnico.

//         Analiza la siguiente oferta y candidato.

//         Oferta:
//         Título: ${offer.title}
//         Descripción: ${offer.description}
//         Experiencia mínima: ${offer.min_experience_years}
//         Nivel inglés requerido: ${offer.required_english_level}

//         Candidato:
//         Experiencia: ${candidate.experience_years}
//         Nivel inglés: ${candidate.english_level}
//         Skills: ${candidate.skills.join(', ')}

//         score matemático inicial: ${baseScore}

//         devuelve solo un json válido con esta estructura:

//         {
//         "fit_score": number (0-100),
//         "summary": string,
//         "strengths": string[],
//         "risks": string[],
//         "recommendation": "strong" | "moderate" | "weak"
//         }
//         `;

//         const response = await openai.chat.completions.create({
//             model: process.env.OPENAI_MODEL || "gpt-4-mini",
//             temperature: 0.2,
//             response_format: {type: 'json_object'},
//             messages: [
//                 {role: 'system', content: 'Eres un experto en reclutamiento técnico.'},
//                 {role: 'user', content: prompt}
//             ]
//         });

//         const content = response.choices[0].message.content;

//         return json.parse(content);

//     } catch (error) {
//         console.error("OpenAI evaluation error:", error.message);
//         return null;
//     }
// }

// module.exports = {
//     evaluateCandidates,
// }