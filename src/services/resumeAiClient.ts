import type { ResumeAiRequest } from "./resumeAiRequest";

export type ResumeAiResponse = {
  resumeText: {
    wantedJob: string;
    experience: string;
    strength: string;
    workTime: string;
    workArea: string;
  };
};

const defaultEndpoint = "/api/resume-draft";

export const requestResumeDraft = async (
  request: ResumeAiRequest,
  endpoint = defaultEndpoint
): Promise<ResumeAiResponse> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error("이력서 생성 요청에 실패했습니다.");
  }

  return response.json() as Promise<ResumeAiResponse>;
};
