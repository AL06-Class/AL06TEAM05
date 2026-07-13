const getEnvValue = (name) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

const getAiRuntimeConfig = () => {
  const apiKey =
    getEnvValue("AI_API_KEY") ||
    getEnvValue("GEMINI_API_KEY") ||
    getEnvValue("OPENAI_API_KEY");

  return {
    hasApiKey: apiKey.length > 0,
    apiKey,
    model: getEnvValue("AI_MODEL") || "gemini-flash-latest"
  };
};

module.exports = {
  getAiRuntimeConfig
};
