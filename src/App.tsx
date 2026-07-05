import { type CSSProperties, useState } from "react";

type StepId = "start" | "face" | "idCard" | "story" | "resume";

type Step = {
  id: StepId;
  title: string;
};

const steps: Step[] = [
  { id: "start", title: "시작" },
  { id: "face", title: "내 사진" },
  { id: "idCard", title: "신분증" },
  { id: "story", title: "말로 이력서" },
  { id: "resume", title: "확인" }
];

const storyText =
  "저는 마을 식당에서 8년 동안 주방 보조를 했고, 오전 근무를 선호합니다. 집 근처에서 오래 일할 수 있는 일을 찾고 있습니다.";

const jobs = [
  "마을 급식소 주방 보조",
  "복지관 오전 안내 도우미",
  "지역 농산물 포장 보조"
];

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [faceReady, setFaceReady] = useState(false);
  const [idCardReady, setIdCardReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [storyReady, setStoryReady] = useState(false);
  const currentStep = steps[stepIndex];

  const goNext = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const canGoNext =
    currentStep.id === "start" ||
    (currentStep.id === "face" && faceReady) ||
    (currentStep.id === "idCard" && idCardReady) ||
    (currentStep.id === "story" && storyReady);

  const recordingButtonText = isRecording
    ? "녹음 완료"
    : storyReady
      ? "다시 녹음"
      : "녹음 시작";

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <header style={styles.header}>
          <p style={styles.kicker}>쉬운 이력서 만들기</p>
          <h1 style={styles.title}>사진을 찍고 말하면 이력서가 만들어져요</h1>
          <p style={styles.description}>
            어려운 글 입력은 줄이고, 일했던 곳과 원하는 일을 말로 남겨
            가까운 일자리와 연결할 수 있게 도와드립니다.
          </p>
        </header>

        <nav aria-label="등록 단계" style={styles.steps}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              style={{
                ...styles.stepItem,
                ...(index === stepIndex ? styles.stepItemActive : {}),
                ...(index < stepIndex ? styles.stepItemDone : {})
              }}
            >
              <span style={styles.stepNumber}>{index + 1}</span>
              <span>{step.title}</span>
            </div>
          ))}
        </nav>

        <section style={styles.content}>
          {currentStep.id === "start" && (
            <div style={styles.panel}>
              <p style={styles.panelLabel}>1단계</p>
              <h2 style={styles.panelTitle}>이력서 만들기를 시작합니다</h2>
              <p style={styles.panelText}>
                사진을 찍고, 하신 일을 말로 알려주시면 이력서 초안을
                만들어드립니다.
              </p>
              <button type="button" onClick={goNext} style={styles.primaryButton}>
                시작하기
              </button>
            </div>
          )}

          {currentStep.id === "face" && (
            <div style={styles.panel}>
              <p style={styles.panelLabel}>2단계</p>
              <h2 style={styles.panelTitle}>내 사진을 올려주세요</h2>
              <div style={styles.captureBox}>
                <span style={styles.captureText}>
                  {faceReady ? "내 사진 올리기 완료" : "내 사진 자리"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFaceReady(true)}
                style={styles.secondaryButton}
              >
                사진 올리기
              </button>
            </div>
          )}

          {currentStep.id === "idCard" && (
            <div style={styles.panel}>
              <p style={styles.panelLabel}>3단계</p>
              <h2 style={styles.panelTitle}>신분증 사진을 올려주세요</h2>
              <div style={styles.captureBox}>
                <span style={styles.captureText}>
                  {idCardReady ? "신분증 사진 올리기 완료" : "신분증 사진 자리"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIdCardReady(true)}
                style={styles.secondaryButton}
              >
                사진 올리기
              </button>
            </div>
          )}

          {currentStep.id === "story" && (
            <div style={styles.panel}>
              <p style={styles.panelLabel}>4단계</p>
              <h2 style={styles.panelTitle}>말로 이력서를 만듭니다</h2>
              <div style={styles.voiceBox}>
                <p style={styles.voiceTitle}>일했던 곳과 원하는 일을 말씀해주세요</p>
                <p style={styles.panelText}>
                  아래 버튼을 누르고, 해본 일과 일하고 싶은 시간대를 편하게
                  말씀해주세요.
                </p>
                <p style={isRecording ? styles.recordingOn : styles.recordingOff}>
                  {isRecording
                    ? "녹음 중입니다. 다 말했으면 완료를 눌러주세요."
                    : storyReady
                      ? "녹음이 완료됐습니다. 아래 내용을 확인해주세요."
                      : "녹음 시작 버튼을 눌러주세요."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    setStoryReady(true);
                    return;
                  }

                  setStoryReady(false);
                  setIsRecording(true);
                }}
                style={styles.secondaryButton}
              >
                {recordingButtonText}
              </button>
              {storyReady && <p style={styles.transcript}>{storyText}</p>}
            </div>
          )}

          {currentStep.id === "resume" && (
            <div style={styles.resumePanel}>
              <p style={styles.panelLabel}>완료</p>
              <h2 style={styles.panelTitle}>이력서 초안</h2>
              <dl style={styles.resumeList}>
                <div style={styles.resumeRow}>
                  <dt>이름</dt>
                  <dd>김도란</dd>
                </div>
                <div style={styles.resumeRow}>
                  <dt>희망 지역</dt>
                  <dd>집 근처 읍내</dd>
                </div>
                <div style={styles.resumeRow}>
                  <dt>주요 경력</dt>
                  <dd>마을 식당 주방 보조 8년</dd>
                </div>
                <div style={styles.resumeRow}>
                  <dt>희망 조건</dt>
                  <dd>오전 근무, 오래 일할 수 있는 곳</dd>
                </div>
              </dl>
              <section style={styles.jobSection}>
                <h3 style={styles.jobTitle}>연결 가능한 지역 일자리</h3>
                <ul style={styles.jobList}>
                  {jobs.map((job) => (
                    <li key={job} style={styles.jobItem}>
                      {job}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </section>

        {stepIndex > 0 && (
          <footer style={styles.footer}>
            <button type="button" onClick={goBack} style={styles.ghostButton}>
              이전
            </button>
            {currentStep.id !== "resume" && (
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                style={{
                  ...styles.primaryButton,
                  ...(!canGoNext ? styles.disabledButton : {})
                }}
              >
                다음
              </button>
            )}
          </footer>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "32px 16px",
    background: "#f4f7fb",
    color: "#17202a",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxSizing: "border-box"
  },
  shell: {
    width: "min(100%, 960px)",
    margin: "0 auto",
    display: "grid",
    gap: "20px"
  },
  header: {
    padding: "24px 0 4px"
  },
  kicker: {
    margin: "0 0 8px",
    color: "#1f5eff",
    fontSize: "16px",
    fontWeight: 800
  },
  title: {
    margin: "0 0 12px",
    color: "#13233a",
    fontSize: "clamp(30px, 5vw, 44px)",
    lineHeight: 1.2,
    letterSpacing: 0
  },
  description: {
    maxWidth: "720px",
    margin: 0,
    color: "#52606d",
    fontSize: "20px",
    lineHeight: 1.6
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "8px"
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "48px",
    padding: "8px 10px",
    border: "1px solid #d6deea",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#52606d",
    fontSize: "15px",
    fontWeight: 700
  },
  stepItemActive: {
    borderColor: "#1f5eff",
    color: "#123b8f",
    background: "#edf4ff"
  },
  stepItemDone: {
    borderColor: "#87a8e8",
    color: "#123b8f"
  },
  stepNumber: {
    display: "grid",
    placeItems: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#dfeaff",
    color: "#123b8f",
    flex: "0 0 auto"
  },
  content: {
    minHeight: "420px",
    display: "grid"
  },
  panel: {
    display: "grid",
    alignContent: "center",
    justifyItems: "start",
    gap: "18px",
    minHeight: "420px",
    padding: "32px",
    border: "1px solid #d9dee7",
    borderRadius: "8px",
    background: "#ffffff"
  },
  resumePanel: {
    display: "grid",
    gap: "20px",
    minHeight: "420px",
    padding: "32px",
    border: "1px solid #d9dee7",
    borderRadius: "8px",
    background: "#ffffff"
  },
  panelLabel: {
    margin: 0,
    color: "#1f5eff",
    fontSize: "16px",
    fontWeight: 800
  },
  panelTitle: {
    margin: 0,
    color: "#13233a",
    fontSize: "32px",
    lineHeight: 1.25,
    letterSpacing: 0
  },
  panelText: {
    maxWidth: "620px",
    margin: 0,
    color: "#52606d",
    fontSize: "20px",
    lineHeight: 1.6
  },
  primaryButton: {
    minHeight: "64px",
    padding: "0 28px",
    border: "1px solid #174fd6",
    borderRadius: "8px",
    background: "#1f5eff",
    color: "#ffffff",
    fontSize: "21px",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryButton: {
    minHeight: "62px",
    padding: "0 26px",
    border: "1px solid #1f5eff",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#123b8f",
    fontSize: "20px",
    fontWeight: 800,
    cursor: "pointer"
  },
  ghostButton: {
    minHeight: "52px",
    padding: "0 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "17px",
    fontWeight: 800,
    cursor: "pointer"
  },
  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed"
  },
  captureBox: {
    display: "grid",
    placeItems: "center",
    width: "min(100%, 340px)",
    minHeight: "240px",
    border: "2px dashed #8ca3c7",
    borderRadius: "8px",
    background: "#f8fafc"
  },
  captureText: {
    color: "#334155",
    fontSize: "20px",
    fontWeight: 800
  },
  voiceBox: {
    width: "min(100%, 560px)",
    padding: "24px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#f8fafc"
  },
  voiceTitle: {
    margin: "0 0 10px",
    color: "#13233a",
    fontSize: "22px",
    fontWeight: 800
  },
  recordingOff: {
    margin: "18px 0 0",
    padding: "14px 16px",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#52606d",
    fontSize: "18px",
    fontWeight: 800
  },
  recordingOn: {
    margin: "18px 0 0",
    padding: "14px 16px",
    borderRadius: "8px",
    background: "#fff1f2",
    color: "#be123c",
    fontSize: "18px",
    fontWeight: 800
  },
  transcript: {
    maxWidth: "680px",
    margin: 0,
    padding: "18px",
    borderLeft: "4px solid #1f5eff",
    background: "#edf4ff",
    color: "#13233a",
    fontSize: "18px",
    lineHeight: 1.6
  },
  resumeList: {
    display: "grid",
    gap: "10px",
    margin: 0
  },
  resumeRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "18px",
    lineHeight: 1.5
  },
  jobSection: {
    display: "grid",
    gap: "12px"
  },
  jobTitle: {
    margin: 0,
    color: "#13233a",
    fontSize: "22px"
  },
  jobList: {
    display: "grid",
    gap: "10px",
    margin: 0,
    padding: 0,
    listStyle: "none"
  },
  jobItem: {
    padding: "14px 16px",
    border: "1px solid #d9dee7",
    borderRadius: "8px",
    background: "#fbfcfe",
    color: "#334155",
    fontSize: "18px",
    fontWeight: 700
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    paddingBottom: "20px"
  }
};
