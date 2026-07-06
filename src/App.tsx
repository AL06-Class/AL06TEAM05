import { FormEvent, useMemo, useState, type CSSProperties } from "react";

type ActionLink = {
  readonly label: string;
  readonly description: string;
};

type LocalJob = {
  readonly id: string;
  readonly title: string;
  readonly region: string;
  readonly workType: string;
  readonly schedule: string;
  readonly partner: string;
  readonly distance: string;
  readonly pay: string;
  readonly fit: string;
  readonly markerClass: "marker-north" | "marker-west" | "marker-south";
};

type PageView = "home" | "recruiterSignup";

type SignupStep = "business" | "contact" | "hiring";

type RecruiterSignupForm = {
  companyName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  hiringRegion: string;
  workType: string;
  note: string;
};

const initialRecruiterForm: RecruiterSignupForm = {
  companyName: "",
  representativeName: "",
  businessRegistrationNumber: "",
  businessAddress: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  hiringRegion: "",
  workType: "",
  note: ""
};

const signupSteps: Array<{ id: SignupStep; label: string; title: string }> = [
  { id: "business", label: "1", title: "사업장 확인" },
  { id: "contact", label: "2", title: "담당자 정보" },
  { id: "hiring", label: "3", title: "구인 조건" }
];

const mainActions = [
  {
    label: "구직자 등록",
    description: "말로 경력과 희망 조건을 남깁니다."
  },
  {
    label: "구인자 등록",
    description: "지역 일자리 정보를 쉽게 올립니다."
  }
] as const satisfies readonly ActionLink[];

const localJobs = [
  {
    id: "local-job-1",
    title: "마을 급식 보조",
    region: "청양읍",
    workType: "오전 근무",
    schedule: "주 3일",
    partner: "청양 복지관",
    distance: "1.2km",
    pay: "월 48만원",
    fit: "서서 오래 일하지 않아도 되는 보조 업무",
    markerClass: "marker-west"
  },
  {
    id: "local-job-2",
    title: "농산물 포장 지원",
    region: "정산면",
    workType: "가벼운 손작업",
    schedule: "하루 4시간",
    partner: "정산 주민센터",
    distance: "2.8km",
    pay: "일 4만원",
    fit: "앉아서 할 수 있는 단순 포장 업무",
    markerClass: "marker-north"
  },
  {
    id: "local-job-3",
    title: "공공시설 안내",
    region: "운곡면",
    workType: "방문객 안내",
    schedule: "주 2일",
    partner: "운곡면사무소",
    distance: "3.4km",
    pay: "시간당 1만원",
    fit: "사람 응대 경험을 살릴 수 있는 안내 업무",
    markerClass: "marker-south"
  }
] as const satisfies readonly LocalJob[];

const processSteps = [
  "사진 또는 주민등록 인식으로 기본 정보를 확인합니다.",
  "음성으로 경력과 가능한 업무를 남깁니다.",
  "가까운 지역 일자리 후보를 바로 확인합니다."
] as const;

export default function App() {
  const [pageView, setPageView] = useState<PageView>("home");
  const [selectedJobId, setSelectedJobId] = useState<LocalJob["id"]>(localJobs[0].id);
  const selectedJob = localJobs.find((job) => job.id === selectedJobId) ?? localJobs[0];

  if (pageView === "recruiterSignup") {
    return <RecruiterSignup onBack={() => setPageView("home")} />;
  }

  return (
    <main className="app-shell">
      <header className="top-bar" aria-label="서비스 상단 메뉴">
        <a className="brand" href="#home" aria-label="메인페이지로 이동">
          메인페이지
        </a>
        <button className="login-button" type="button">
          로그인
        </button>
      </header>

      <section className="hero hero-map-only" id="home" aria-label="지역 일자리 지도">
        <div className="match-panel" aria-label="지역 일자리 지도">
          <div className="match-map" aria-label="등록된 일자리 위치">
            <div className="map-copy">
              <strong>일자리</strong>
              <span>등록 일자리 표시</span>
            </div>
            {localJobs.map((job) => (
              <button
                aria-label={`${job.region} ${job.title}`}
                aria-pressed={selectedJobId === job.id}
                className={`map-marker ${job.markerClass} ${
                  selectedJobId === job.id ? "is-selected" : ""
                }`}
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                type="button"
              >
                <span className="marker-star" aria-hidden="true" />
              </button>
            ))}
            <button className="map-action" type="button">
              내 주변 일자리 보기
            </button>
          </div>
          <div className="match-content">
            <article className="selected-job" aria-live="polite">
              <p className="section-kicker">선택한 일자리</p>
              <h2>{selectedJob.title}</h2>
              <dl className="job-meta">
                <div>
                  <dt>거리</dt>
                  <dd>{selectedJob.distance}</dd>
                </div>
                <div>
                  <dt>근무</dt>
                  <dd>{selectedJob.schedule}</dd>
                </div>
                <div>
                  <dt>급여</dt>
                  <dd>{selectedJob.pay}</dd>
                </div>
              </dl>
              <p>{selectedJob.fit}</p>
              <button className="primary-action" type="button">
                이 일자리로 구직자 등록
              </button>
            </article>
            <ul className="job-list">
              {localJobs.map((job) => (
                <li className="job-item" key={job.id}>
                  <button
                    aria-pressed={selectedJobId === job.id}
                    className={selectedJobId === job.id ? "job-card is-selected" : "job-card"}
                    onClick={() => setSelectedJobId(job.id)}
                    type="button"
                  >
                    <span>
                      <strong>{job.title}</strong>
                      <small>{job.distance}</small>
                    </span>
                    <span>
                      {job.region} · {job.workType}
                    </span>
                    <p>
                      {job.schedule} · {job.partner}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="quick-start" aria-labelledby="quick-start-title">
        <div>
          <p className="section-kicker">처음 오셨나요?</p>
          <h2 id="quick-start-title">원하는 방식으로 바로 시작할 수 있습니다</h2>
        </div>
        <div className="action-grid">
          {mainActions.map((action) => (
            <button
              className="action-card"
              key={action.label}
              onClick={() => {
                if (action.label === "구인자 등록") {
                  setPageView("recruiterSignup");
                }
              }}
              type="button"
            >
              <strong>{action.label}</strong>
              <span>{action.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="flow-section" aria-labelledby="flow-title">
        <div>
          <p className="section-kicker">3단계 흐름</p>
          <h2 id="flow-title">등록부터 매칭까지 짧게 안내합니다</h2>
        </div>
        <ol className="step-list">
          {processSteps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function RecruiterSignup({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState<SignupStep>("business");
  const [form, setForm] = useState<RecruiterSignupForm>(initialRecruiterForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentStepIndex = signupSteps.findIndex((step) => step.id === currentStep);
  const progressWidth = `${((currentStepIndex + 1) / signupSteps.length) * 100}%`;

  const isCurrentStepReady = useMemo(() => {
    if (currentStep === "business") {
      return (
        form.companyName.trim() &&
        form.representativeName.trim() &&
        form.businessRegistrationNumber.trim() &&
        form.businessAddress.trim()
      );
    }

    if (currentStep === "contact") {
      return form.contactName.trim() && form.contactPhone.trim() && form.contactEmail.trim();
    }

    return form.hiringRegion.trim() && form.workType.trim();
  }, [currentStep, form]);

  const updateField = (field: keyof RecruiterSignupForm, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  const goNext = () => {
    const nextStep = signupSteps[currentStepIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const goBack = () => {
    const previousStep = signupSteps[currentStepIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep.id);
      return;
    }

    onBack();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep !== "hiring") {
      goNext();
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main style={signupStyles.page}>
        <section style={signupStyles.successPanel} aria-labelledby="success-title">
          <p style={signupStyles.eyebrow}>가입 신청 완료</p>
          <h1 id="success-title" style={signupStyles.successTitle}>
            구인자 회원가입 신청이 접수되었습니다.
          </h1>
          <p style={signupStyles.successDescription}>
            담당자가 사업장 정보를 확인한 뒤 지역 일자리 등록을 도와드립니다. 확인 연락은
            입력하신 담당자 연락처로 안내됩니다.
          </p>
          <dl style={signupStyles.summaryList}>
            <div style={signupStyles.summaryItem}>
              <dt>사업장</dt>
              <dd>{form.companyName}</dd>
            </div>
            <div style={signupStyles.summaryItem}>
              <dt>구인 지역</dt>
              <dd>{form.hiringRegion}</dd>
            </div>
            <div style={signupStyles.summaryItem}>
              <dt>필요 업무</dt>
              <dd>{form.workType}</dd>
            </div>
          </dl>
          <div style={signupStyles.actions}>
            <button type="button" style={signupStyles.secondaryButton} onClick={onBack}>
              메인으로
            </button>
            <button
              type="button"
              style={signupStyles.primaryButton}
              onClick={() => {
                setForm(initialRecruiterForm);
                setCurrentStep("business");
                setIsSubmitted(false);
              }}
            >
              새 가입 신청 작성
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={signupStyles.page}>
      <section style={signupStyles.shell} aria-labelledby="signup-title">
        <div style={signupStyles.header}>
          <button type="button" style={signupStyles.backLink} onClick={onBack}>
            메인으로 돌아가기
          </button>
          <p style={signupStyles.eyebrow}>Blogle2 구인자 회원가입</p>
          <h1 id="signup-title" style={signupStyles.title}>
            지역 일자리를 등록할 사업장 정보를 입력해주세요.
          </h1>
          <p style={signupStyles.description}>
            복잡한 절차를 줄이고, 주민센터·복지관과 연결할 수 있는 기본 정보만 먼저
            확인합니다.
          </p>
        </div>

        <div style={signupStyles.progressBox} aria-label="가입 단계">
          <div style={signupStyles.progressTrack}>
            <div style={{ ...signupStyles.progressBar, width: progressWidth }} />
          </div>
          <ol style={signupStyles.stepList}>
            {signupSteps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = index < currentStepIndex;

              return (
                <li
                  key={step.id}
                  style={{
                    ...signupStyles.stepItem,
                    ...(isActive ? signupStyles.activeStepItem : {}),
                    ...(isComplete ? signupStyles.completeStepItem : {})
                  }}
                >
                  <span style={signupStyles.stepNumber}>{step.label}</span>
                  <span>{step.title}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <form style={signupStyles.form} onSubmit={handleSubmit}>
          {currentStep === "business" && (
            <div style={signupStyles.formGrid}>
              <SignupField
                label="사업장 이름"
                value={form.companyName}
                placeholder="예: 도란식당"
                onChange={(value) => updateField("companyName", value)}
              />
              <SignupField
                label="대표자 이름"
                value={form.representativeName}
                placeholder="예: 안미선"
                onChange={(value) => updateField("representativeName", value)}
              />
              <SignupField
                label="사업자등록번호"
                value={form.businessRegistrationNumber}
                placeholder="예: 123-45-67890"
                onChange={(value) => updateField("businessRegistrationNumber", value)}
              />
              <SignupField
                label="사업장 주소"
                value={form.businessAddress}
                placeholder="예: 충북 옥천군 옥천읍 중앙로 10"
                onChange={(value) => updateField("businessAddress", value)}
              />
            </div>
          )}

          {currentStep === "contact" && (
            <div style={signupStyles.formGrid}>
              <SignupField
                label="담당자 이름"
                value={form.contactName}
                placeholder="예: 김담당"
                onChange={(value) => updateField("contactName", value)}
              />
              <SignupField
                label="담당자 연락처"
                value={form.contactPhone}
                placeholder="예: 010-1234-5678"
                onChange={(value) => updateField("contactPhone", value)}
              />
              <SignupField
                label="담당자 이메일"
                type="email"
                value={form.contactEmail}
                placeholder="예: hello@company.co.kr"
                onChange={(value) => updateField("contactEmail", value)}
              />
              <div style={signupStyles.noticeBox}>
                입력한 연락처는 가입 승인과 구인 등록 안내에만 사용됩니다.
              </div>
            </div>
          )}

          {currentStep === "hiring" && (
            <div style={signupStyles.formGrid}>
              <SignupField
                label="구인 희망 지역"
                value={form.hiringRegion}
                placeholder="예: 옥천읍, 이원면, 동이면"
                onChange={(value) => updateField("hiringRegion", value)}
              />
              <SignupField
                label="필요한 업무"
                value={form.workType}
                placeholder="예: 주방 보조, 농산물 포장, 매장 정리"
                onChange={(value) => updateField("workType", value)}
              />
              <label style={{ ...signupStyles.field, ...signupStyles.fullWidthField }}>
                <span style={signupStyles.label}>추가 요청 사항</span>
                <textarea
                  value={form.note}
                  placeholder="근무 시간, 필요한 인원, 우대 조건을 적어주세요."
                  onChange={(event) => updateField("note", event.target.value)}
                  style={{ ...signupStyles.input, ...signupStyles.textarea }}
                />
              </label>
            </div>
          )}

          <div style={signupStyles.actions}>
            <button type="button" style={signupStyles.secondaryButton} onClick={goBack}>
              이전
            </button>
            <button
              type="submit"
              style={{
                ...signupStyles.primaryButton,
                ...(!isCurrentStepReady ? signupStyles.disabledButton : {})
              }}
              disabled={!isCurrentStepReady}
            >
              {currentStep === "hiring" ? "가입 신청 완료" : "다음"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

type SignupFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
};

function SignupField({
  label,
  value,
  placeholder,
  type = "text",
  onChange
}: SignupFieldProps) {
  return (
    <label style={signupStyles.field}>
      <span style={signupStyles.label}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={signupStyles.input}
      />
    </label>
  );
}

const signupStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background: "#f4f7fb",
    color: "#17202a",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  shell: {
    width: "min(100%, 960px)",
    margin: "0 auto",
    padding: "32px",
    border: "1px solid #d8e1ec",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 18px 45px rgba(18, 38, 63, 0.08)"
  },
  header: {
    maxWidth: "720px",
    marginBottom: "28px"
  },
  backLink: {
    margin: "0 0 18px",
    padding: 0,
    border: 0,
    color: "#1769aa",
    background: "transparent",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  eyebrow: {
    margin: "0 0 10px",
    color: "#0f5fa8",
    fontSize: "16px",
    fontWeight: 800
  },
  title: {
    margin: "0 0 14px",
    color: "#102a43",
    fontSize: "38px",
    lineHeight: 1.22,
    letterSpacing: 0
  },
  description: {
    margin: 0,
    color: "#52606d",
    fontSize: "19px",
    lineHeight: 1.65
  },
  progressBox: {
    marginBottom: "28px"
  },
  progressTrack: {
    height: "10px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#dbe7f3"
  },
  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background: "#1769aa",
    transition: "width 180ms ease"
  },
  stepList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    margin: "14px 0 0",
    padding: 0,
    listStyle: "none"
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "48px",
    padding: "10px 12px",
    border: "1px solid #d8e1ec",
    borderRadius: "8px",
    color: "#52606d",
    background: "#f8fafc",
    fontSize: "16px",
    fontWeight: 700
  },
  activeStepItem: {
    borderColor: "#1769aa",
    color: "#102a43",
    background: "#eef6ff"
  },
  completeStepItem: {
    borderColor: "#9cc7ea",
    color: "#174a7c",
    background: "#f3f8fc"
  },
  stepNumber: {
    display: "inline-grid",
    placeItems: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    color: "#ffffff",
    background: "#1769aa",
    fontSize: "15px",
    flex: "0 0 auto"
  },
  form: {
    display: "grid",
    gap: "26px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: "18px"
  },
  field: {
    display: "grid",
    gap: "8px"
  },
  fullWidthField: {
    gridColumn: "1 / -1"
  },
  label: {
    color: "#243b53",
    fontSize: "18px",
    fontWeight: 800
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "58px",
    padding: "14px 16px",
    border: "1px solid #bcccdc",
    borderRadius: "8px",
    color: "#17202a",
    background: "#ffffff",
    font: "inherit",
    fontSize: "18px",
    outlineColor: "#1769aa"
  },
  textarea: {
    minHeight: "132px",
    resize: "vertical",
    lineHeight: 1.55
  },
  noticeBox: {
    display: "grid",
    alignContent: "center",
    minHeight: "58px",
    padding: "16px",
    border: "1px solid #f0d8a8",
    borderRadius: "8px",
    color: "#684b12",
    background: "#fff8e8",
    fontSize: "17px",
    lineHeight: 1.55
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    paddingTop: "6px"
  },
  primaryButton: {
    minHeight: "58px",
    minWidth: "156px",
    padding: "0 24px",
    border: 0,
    borderRadius: "8px",
    color: "#ffffff",
    background: "#1769aa",
    fontSize: "18px",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryButton: {
    minHeight: "58px",
    minWidth: "112px",
    padding: "0 22px",
    border: "1px solid #bcccdc",
    borderRadius: "8px",
    color: "#243b53",
    background: "#ffffff",
    fontSize: "18px",
    fontWeight: 800,
    cursor: "pointer"
  },
  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed"
  },
  successPanel: {
    width: "min(100%, 720px)",
    margin: "0 auto",
    padding: "36px",
    border: "1px solid #d8e1ec",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 18px 45px rgba(18, 38, 63, 0.08)"
  },
  successTitle: {
    margin: "0 0 14px",
    color: "#102a43",
    fontSize: "38px",
    lineHeight: 1.25,
    letterSpacing: 0
  },
  successDescription: {
    margin: "0 0 24px",
    color: "#52606d",
    fontSize: "19px",
    lineHeight: 1.65
  },
  summaryList: {
    display: "grid",
    gap: "12px",
    margin: "0 0 26px"
  },
  summaryItem: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid #e6edf5",
    fontSize: "18px"
  }
};
