const { buildFallbackResumeText } = require("./resumeFallback");

const resumeTextFields = [
  "wantedJob",
  "experience",
  "strength",
  "workTime",
  "workArea"
];

const parseAiResumeJson = (rawText) => {
  if (typeof rawText !== "string" || rawText.trim().length === 0) {
    return {};
  }

  const trimmed = rawText.trim();

  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    const objectText = extractFirstJsonObject(trimmed);

    if (!objectText) {
      return {};
    }

    try {
      const parsed = JSON.parse(objectText);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
};

const extractFirstJsonObject = (text) => {
  const start = text.indexOf("{");

  if (start === -1) {
    return "";
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return "";
};

const normalizeResumeText = (rawResumeText, answers) => {
  const fallback = buildFallbackResumeText(answers);
  const source =
    rawResumeText && typeof rawResumeText === "object" ? rawResumeText : {};

  return resumeTextFields.reduce((resumeText, field) => {
    const value = source[field];
    const trimmed = typeof value === "string" ? value.trim() : "";

    return {
      ...resumeText,
      [field]: trimmed || fallback[field]
    };
  }, {});
};

const parseAiResumeResponse = (rawText, answers) => {
  const parsed = parseAiResumeJson(rawText);

  return {
    resumeText: normalizeResumeText(parsed.resumeText ?? parsed, answers)
  };
};

module.exports = {
  normalizeResumeText,
  parseAiResumeResponse
};
