const { onRequest } = require("firebase-functions/v2/https");
const { getAiRuntimeConfig } = require("./aiConfig");
const { buildAiResumeDraft } = require("./resumeAiClient");
const { parseAiResumeResponse } = require("./resumeAiResponse");
const { buildFallbackResumeText } = require("./resumeFallback");
const { buildResumePromptMessages } = require("./resumePrompt");

const buildMockResumeDraft = (answers) => ({
  promptMessages: buildResumePromptMessages(answers),
  resumeText: parseAiResumeResponse(
    JSON.stringify({ resumeText: buildFallbackResumeText(answers) }),
    answers
  ).resumeText
});

const buildResumeDraft = async (answers, aiConfig) => {
  const promptMessages = buildResumePromptMessages(answers);

  if (aiConfig.hasApiKey) {
    try {
      return await buildAiResumeDraft({
        answers,
        aiConfig,
        promptMessages
      });
    } catch {
      return buildMockResumeDraft(answers);
    }
  }

  return buildMockResumeDraft(answers);
};

exports.resumeDraft = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ message: "POST 요청만 사용할 수 있습니다." });
    return;
  }

  const answers = request.body?.answers ?? {};
  const draft = await buildResumeDraft(answers, getAiRuntimeConfig());

  response.json({
    resumeText: draft.resumeText
  });
});
