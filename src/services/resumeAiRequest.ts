export type ResumeAiAnswers = {
  wantedJob: string;
  experience: string;
  strength: string;
  workTime: string;
  workArea: string;
};

export type ResumeAiPhoto = {
  provided: boolean;
  fileName: string | null;
};

export type ResumeAiRequest = {
  version: "resume-draft-v1";
  language: "ko";
  targetReader: "easy-senior";
  photos: {
    face: ResumeAiPhoto;
    identity: ResumeAiPhoto;
  };
  answers: ResumeAiAnswers;
  output: {
    format: "resume-preview";
    tone: "clear-and-friendly";
  };
};

type BuildResumeAiRequestParams = {
  answers: ResumeAiAnswers;
  facePhotoFileName: string | null;
  identityPhotoFileName: string | null;
};

const clean = (value: string) => value.trim();

export const buildResumeAiRequest = ({
  answers,
  facePhotoFileName,
  identityPhotoFileName
}: BuildResumeAiRequestParams): ResumeAiRequest => ({
  version: "resume-draft-v1",
  language: "ko",
  targetReader: "easy-senior",
  photos: {
    face: {
      provided: Boolean(facePhotoFileName),
      fileName: facePhotoFileName
    },
    identity: {
      provided: Boolean(identityPhotoFileName),
      fileName: identityPhotoFileName
    }
  },
  answers: {
    wantedJob: clean(answers.wantedJob),
    experience: clean(answers.experience),
    strength: clean(answers.strength),
    workTime: clean(answers.workTime),
    workArea: clean(answers.workArea)
  },
  output: {
    format: "resume-preview",
    tone: "clear-and-friendly"
  }
});
