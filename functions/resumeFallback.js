const getAnswer = (value, fallback) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || fallback;
};

const hasAnswer = (value) => typeof value === "string" && value.trim().length > 0;

const toSentence = (value) =>
  /[.!?。！？]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`;

const buildFallbackResumeText = (answers) => {
  const wantedJob = getAnswer(answers.wantedJob, "");
  const experience = getAnswer(answers.experience, "");
  const strength = getAnswer(
    answers.strength,
    "맡은 일을 성실하고 책임감 있게 해낼 수 있습니다"
  );
  const workTime = getAnswer(answers.workTime, "");
  const workArea = getAnswer(answers.workArea, "집에서 다니기 편한 지역");

  return {
    wantedJob: hasAnswer(answers.wantedJob)
      ? `${wantedJob} 업무를 희망합니다.`
      : "희망 업무는 상담을 통해 알맞게 정리하겠습니다.",
    experience: hasAnswer(answers.experience)
      ? `${toSentence(experience)} 이러한 경험을 바탕으로 맡은 일을 차분히 수행할 수 있습니다.`
      : "그동안 해오신 일과 경험은 상담을 통해 차근차근 정리할 예정입니다.",
    strength: `${toSentence(strength)} 함께 일하는 분들과 원만하게 소통하며 책임감 있게 일하겠습니다.`,
    workTime: hasAnswer(answers.workTime)
      ? `${workTime} 근무를 희망하며, 자세한 일정은 상담 후 조율할 수 있습니다.`
      : "근무 가능 시간은 상담을 통해 조율할 수 있습니다.",
    workArea: `${workArea}에서 근무하기를 희망합니다. 출퇴근이 가능한 범위 안에서 성실히 일하겠습니다.`
  };
};

module.exports = {
  buildFallbackResumeText
};
