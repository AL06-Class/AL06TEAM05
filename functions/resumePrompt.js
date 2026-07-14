const systemPrompt = [
  "당신은 50~70대 사용자를 돕는 이력서 작성 도우미입니다.",
  "짧고 쉬운 한국어 문장으로 이력서 초안을 작성합니다.",
  "사용자가 적은 표현을 존중하되, 이력서에 어울리게 자연스럽게 다듬습니다.",
  "없는 내용은 지어내지 말고 상담 후 정리할 수 있다는 문장으로 처리합니다.",
  "저장, 채용 확정, 신분 확인 완료처럼 실제 처리되지 않은 내용은 쓰지 않습니다.",
  "응답은 설명 없이 JSON 형식으로만 작성합니다."
].join("\\n");

const buildUserPrompt = (answers) => [
  "아래 답변을 바탕으로 이력서 미리보기 문장을 만들어주세요.",
  "",
  `희망하는 일: ${answers.wantedJob || "답변 없음"}`,
  `해본 일: ${answers.experience || "답변 없음"}`,
  `잘하는 점: ${answers.strength || "답변 없음"}`,
  `일할 수 있는 시간: ${answers.workTime || "답변 없음"}`,
  `희망 지역: ${answers.workArea || "답변 없음"}`,
  "",
  "응답 JSON 형식:",
  "{\"resumeText\":{\"wantedJob\":\"\",\"experience\":\"\",\"strength\":\"\",\"workTime\":\"\",\"workArea\":\"\"}}"
].join("\\n");

const buildResumePromptMessages = (answers) => ({
  system: systemPrompt,
  user: buildUserPrompt(answers)
});

module.exports = {
  buildResumePromptMessages
};
