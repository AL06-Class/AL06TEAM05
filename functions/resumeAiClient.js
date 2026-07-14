const { parseAiResumeResponse } = require("./resumeAiResponse");

const requestAiResumeDraft = async ({ answers, aiConfig, promptMessages }) => {
  void answers;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:generateContent?key=${aiConfig.apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: promptMessages.system }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: promptMessages.user }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            resumeText: {
              type: "OBJECT",
              properties: {
                wantedJob: { type: "STRING" },
                experience: { type: "STRING" },
                strength: { type: "STRING" },
                workTime: { type: "STRING" },
                workArea: { type: "STRING" }
              },
              required: [
                "wantedJob",
                "experience",
                "strength",
                "workTime",
                "workArea"
              ]
            }
          },
          required: ["resumeText"]
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error("Gemini resume request failed.");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const buildAiResumeDraft = async ({ answers, aiConfig, promptMessages }) => {
  const rawAiText = await requestAiResumeDraft({
    answers,
    aiConfig,
    promptMessages
  });

  return parseAiResumeResponse(rawAiText, answers);
};

module.exports = {
  buildAiResumeDraft
};
