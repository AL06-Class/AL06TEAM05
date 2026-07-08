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

type TalentProfile = {
  readonly id: string;
  readonly displayName: string;
  readonly ageRange: string;
  readonly homeRegion: string;
  readonly preferredWorkRegions: readonly string[];
  readonly availableWorkTypes: readonly string[];
  readonly careerSummary: string;
  readonly availableSchedule: string;
  readonly distanceText: string;
  readonly verificationStatus: "confirmed" | "pending";
  readonly connectionStatus: "available" | "proposed";
  readonly matchReason: string;
  readonly mapPosition: {
    readonly top: string;
    readonly left: string;
  };
};

type PageView = "home" | "applicantSignup" | "recruiterSignup" | "talentMatches";

type SignupStep = "business" | "contact" | "hiring";

type ApplicantStepId = "start" | "face" | "idCard" | "story" | "resume";

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

const applicantSteps: Array<{ id: ApplicantStepId; title: string }> = [
  { id: "start", title: "시작" },
  { id: "face", title: "내 사진" },
  { id: "idCard", title: "신분증" },
  { id: "story", title: "말로 이력서" },
  { id: "resume", title: "확인" }
];

const applicantStoryText =
  "저는 마을 식당에서 8년 동안 주방 보조를 했고, 오전 근무를 선호합니다. 집 근처에서 오래 일할 수 있는 일을 찾고 있습니다.";

const applicantJobs = [
  "마을 급식소 주방 보조",
  "복지관 오전 안내 도우미",
  "지역 농산물 포장 보조"
] as const;

const talentProfiles = [
  {
    id: "talent-1",
    displayName: "김OO",
    ageRange: "60대",
    homeRegion: "남원읍",
    preferredWorkRegions: ["남원읍", "표선면"],
    availableWorkTypes: ["매장 정리", "주방 보조", "포장"],
    careerSummary: "식당 보조 8년, 농산물 포장 3년",
    availableSchedule: "평일 오전 9시-오후 2시",
    distanceText: "가게에서 약 1.2km",
    verificationStatus: "confirmed",
    connectionStatus: "available",
    matchReason: "오전 근무 가능 시간이 맞고 가까운 지역을 희망합니다.",
    mapPosition: {
      top: "24%",
      left: "22%"
    }
  },
  {
    id: "talent-2",
    displayName: "박OO",
    ageRange: "50대",
    homeRegion: "대정읍",
    preferredWorkRegions: ["대정읍", "안덕면"],
    availableWorkTypes: ["카운터", "상품 진열", "고객 응대"],
    careerSummary: "마트 계산대 6년, 편의점 근무 2년",
    availableSchedule: "월/수/금 오후 1시-6시",
    distanceText: "가게에서 약 2.8km",
    verificationStatus: "confirmed",
    connectionStatus: "available",
    matchReason: "고객 응대 경험이 있고 주 3일 근무 조건에 맞습니다.",
    mapPosition: {
      top: "58%",
      left: "52%"
    }
  },
  {
    id: "talent-3",
    displayName: "이OO",
    ageRange: "70대",
    homeRegion: "표선면",
    preferredWorkRegions: ["표선면"],
    availableWorkTypes: ["청소", "분리수거", "간단 관리"],
    careerSummary: "숙박업 객실 정리 5년",
    availableSchedule: "주말 오전 가능",
    distanceText: "가게에서 약 3.5km",
    verificationStatus: "pending",
    connectionStatus: "proposed",
    matchReason: "주말 단기 근무 후보로 확인 중입니다.",
    mapPosition: {
      top: "30%",
      left: "76%"
    }
  }
] as const satisfies readonly TalentProfile[];

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
  const [pageView, setPageView] = useState<PageView>(
    window.location.hash === "#talent" ? "talentMatches" : "home"
  );
  const [selectedJobId, setSelectedJobId] = useState<LocalJob["id"]>(localJobs[0].id);
  const selectedJob = localJobs.find((job) => job.id === selectedJobId) ?? localJobs[0];

  if (pageView === "applicantSignup") {
    return <ApplicantSignup onBack={() => setPageView("home")} />;
  }

  if (pageView === "recruiterSignup") {
    return <RecruiterSignup onBack={() => setPageView("home")} />;
  }

  if (pageView === "talentMatches") {
    return <TalentMatches onBack={() => setPageView("home")} />;
  }

  return (
    <main className="app-shell">
      <header className="top-bar" aria-label="서비스 상단 메뉴">
        <a className="brand" href="#home" aria-label="메인페이지로 이동">
          메인페이지
        </a>
        <div className="top-actions" aria-label="주요 등록 화면">
          <button
            className="top-action-button"
            type="button"
            onClick={() => setPageView("applicantSignup")}
          >
            구직자 등록
          </button>
          <button
            className="top-action-button"
            type="button"
            onClick={() => setPageView("recruiterSignup")}
          >
            구인자 등록
          </button>
          <button
            className="top-action-button top-action-button-secondary"
            type="button"
            onClick={() => setPageView("talentMatches")}
          >
            지역 인재 보기
          </button>
          <button className="login-button" type="button">
            로그인
          </button>
        </div>
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
              <button
                className="primary-action"
                type="button"
                onClick={() => setPageView("talentMatches")}
              >
                연결 가능한 인재 보기
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
                if (action.label === "구직자 등록") {
                  setPageView("applicantSignup");
                }

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

function ApplicantSignup({ onBack }: { onBack: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [faceReady, setFaceReady] = useState(false);
  const [idCardReady, setIdCardReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [storyReady, setStoryReady] = useState(false);
  const currentStep = applicantSteps[stepIndex];

  const canGoNext =
    currentStep.id === "start" ||
    (currentStep.id === "face" && faceReady) ||
    (currentStep.id === "idCard" && idCardReady) ||
    (currentStep.id === "story" && storyReady);

  const goNext = () => {
    setStepIndex((current) => Math.min(current + 1, applicantSteps.length - 1));
  };

  const goBack = () => {
    if (stepIndex === 0) {
      onBack();
      return;
    }

    setStepIndex((current) => Math.max(current - 1, 0));
  };

  return (
    <main style={applicantStyles.page}>
      <section style={applicantStyles.shell} aria-labelledby="applicant-title">
        <header style={applicantStyles.header}>
          <button type="button" style={applicantStyles.backLink} onClick={onBack}>
            메인으로 돌아가기
          </button>
          <p style={applicantStyles.eyebrow}>Blogle2 구직자 등록</p>
          <h1 id="applicant-title" style={applicantStyles.title}>
            사진을 찍고 말하면 이력서가 만들어져요.
          </h1>
          <p style={applicantStyles.description}>
            어려운 글 입력 대신 사진과 음성으로 경력, 희망 조건, 가까운 일자리 연결 정보를
            남길 수 있습니다.
          </p>
        </header>

        <nav aria-label="구직자 등록 단계" style={applicantStyles.steps}>
          {applicantSteps.map((step, index) => (
            <div
              key={step.id}
              style={{
                ...applicantStyles.stepItem,
                ...(index === stepIndex ? applicantStyles.activeStepItem : {}),
                ...(index < stepIndex ? applicantStyles.completeStepItem : {})
              }}
            >
              <span style={applicantStyles.stepNumber}>{index + 1}</span>
              <span>{step.title}</span>
            </div>
          ))}
        </nav>

        <section style={applicantStyles.panel}>
          {currentStep.id === "start" && (
            <>
              <p style={applicantStyles.panelLabel}>1단계</p>
              <h2 style={applicantStyles.panelTitle}>이력서 만들기를 시작합니다</h2>
              <p style={applicantStyles.panelText}>
                내 사진, 신분증 사진, 말로 남긴 경력을 차례대로 등록합니다.
              </p>
            </>
          )}

          {currentStep.id === "face" && (
            <>
              <p style={applicantStyles.panelLabel}>2단계</p>
              <h2 style={applicantStyles.panelTitle}>내 사진을 올려주세요</h2>
              <div style={applicantStyles.captureBox}>
                {faceReady ? "내 사진 올리기 완료" : "내 사진 자리"}
              </div>
              <button
                type="button"
                style={applicantStyles.secondaryButton}
                onClick={() => setFaceReady(true)}
              >
                사진 올리기
              </button>
            </>
          )}

          {currentStep.id === "idCard" && (
            <>
              <p style={applicantStyles.panelLabel}>3단계</p>
              <h2 style={applicantStyles.panelTitle}>신분증 사진을 올려주세요</h2>
              <div style={applicantStyles.captureBox}>
                {idCardReady ? "신분증 사진 올리기 완료" : "신분증 사진 자리"}
              </div>
              <button
                type="button"
                style={applicantStyles.secondaryButton}
                onClick={() => setIdCardReady(true)}
              >
                사진 올리기
              </button>
            </>
          )}

          {currentStep.id === "story" && (
            <>
              <p style={applicantStyles.panelLabel}>4단계</p>
              <h2 style={applicantStyles.panelTitle}>말로 이력서를 만듭니다</h2>
              <p style={applicantStyles.panelText}>
                해본 일, 일하고 싶은 시간, 원하는 지역을 편하게 말해주세요.
              </p>
              <p style={isRecording ? applicantStyles.recordingOn : applicantStyles.recordingOff}>
                {isRecording
                  ? "녹음 중입니다. 다 말했으면 완료를 눌러주세요."
                  : storyReady
                    ? "녹음이 완료됐습니다."
                    : "녹음 시작 버튼을 눌러주세요."}
              </p>
              <button
                type="button"
                style={applicantStyles.secondaryButton}
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    setStoryReady(true);
                    return;
                  }

                  setStoryReady(false);
                  setIsRecording(true);
                }}
              >
                {isRecording ? "녹음 완료" : storyReady ? "다시 녹음" : "녹음 시작"}
              </button>
              {storyReady && <p style={applicantStyles.transcript}>{applicantStoryText}</p>}
            </>
          )}

          {currentStep.id === "resume" && (
            <>
              <p style={applicantStyles.panelLabel}>완료</p>
              <h2 style={applicantStyles.panelTitle}>이력서 초안</h2>
              <dl style={applicantStyles.resumeList}>
                <div style={applicantStyles.resumeRow}>
                  <dt>이름</dt>
                  <dd>김도란</dd>
                </div>
                <div style={applicantStyles.resumeRow}>
                  <dt>주요 경력</dt>
                  <dd>마을 식당 주방 보조 8년</dd>
                </div>
                <div style={applicantStyles.resumeRow}>
                  <dt>희망 조건</dt>
                  <dd>집 근처 오전 근무</dd>
                </div>
              </dl>
              <h3 style={applicantStyles.jobTitle}>연결 가능한 지역 일자리</h3>
              <ul style={applicantStyles.jobList}>
                {applicantJobs.map((job) => (
                  <li key={job} style={applicantStyles.jobItem}>
                    {job}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <footer style={applicantStyles.footer}>
          <button type="button" style={applicantStyles.secondaryButton} onClick={goBack}>
            {stepIndex === 0 ? "메인으로" : "이전"}
          </button>
          {currentStep.id !== "resume" && (
            <button
              type="button"
              style={{
                ...applicantStyles.primaryButton,
                ...(!canGoNext ? applicantStyles.disabledButton : {})
              }}
              disabled={!canGoNext}
              onClick={goNext}
            >
              {stepIndex === 0 ? "시작하기" : "다음"}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

function TalentMatches({ onBack }: { onBack: () => void }) {
  const [isNearbyMapOpen, setIsNearbyMapOpen] = useState(true);

  return (
    <main style={talentStyles.page}>
      <section style={talentStyles.shell} aria-labelledby="talent-title">
        <header style={talentStyles.header}>
          <div>
            <button type="button" style={talentStyles.backLink} onClick={onBack}>
              메인으로 돌아가기
            </button>
            <p style={talentStyles.eyebrow}>자영업자 페이지</p>
            <h1 id="talent-title" style={talentStyles.title}>
              연결 가능한 지역 인재
            </h1>
            <p style={talentStyles.description}>
              가까운 지역에서 바로 일할 수 있는 시니어 구직자를 조건에 맞춰 추천합니다.
            </p>
          </div>
          <button
            type="button"
            style={talentStyles.primaryButton}
            aria-expanded={isNearbyMapOpen}
            onClick={() => setIsNearbyMapOpen((current) => !current)}
          >
            {isNearbyMapOpen ? "목록만 보기" : "가까운 구직자 보기"}
          </button>
        </header>

        {isNearbyMapOpen && (
          <section aria-label="가까운 구직자 지도" style={talentStyles.mapPanel}>
            <div style={talentStyles.mapGuide} />
            <div style={talentStyles.storeMarker} aria-label="내 가게 위치" />
            <p style={talentStyles.storeLabel}>내 가게</p>
            {talentProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                title={`${profile.displayName} ${profile.distanceText}`}
                style={{
                  ...talentStyles.talentMarker,
                  top: profile.mapPosition.top,
                  left: profile.mapPosition.left
                }}
              >
                <span style={talentStyles.markerShape} aria-hidden="true" />
              </button>
            ))}
            <aside style={talentStyles.mapSummary}>
              <strong>주변 구직자 3명</strong>
              <span>필요 업무와 거리에 맞는 후보를 확인할 수 있습니다.</span>
            </aside>
          </section>
        )}

        <div style={talentStyles.filterRow} aria-label="추천 조건">
          {["남원읍 기준", "오전 근무", "주방/매장 업무", "기관 확인"].map((filter) => (
            <button key={filter} type="button" style={talentStyles.filterButton}>
              {filter}
            </button>
          ))}
        </div>

        <section style={talentStyles.list} aria-label="추천 구직자 목록">
          {talentProfiles.map((profile) => (
            <article key={profile.id} style={talentStyles.card}>
              <div style={talentStyles.cardHeader}>
                <div>
                  <div style={talentStyles.badgeRow}>
                    <span style={talentStyles.distanceBadge}>{profile.distanceText}</span>
                    <span
                      style={
                        profile.verificationStatus === "confirmed"
                          ? talentStyles.confirmedBadge
                          : talentStyles.pendingBadge
                      }
                    >
                      {profile.verificationStatus === "confirmed" ? "주민센터 확인" : "기관 확인 중"}
                    </span>
                  </div>
                  <h2 style={talentStyles.profileName}>
                    {profile.displayName} · {profile.ageRange} · {profile.homeRegion}
                  </h2>
                  <p style={talentStyles.matchReason}>{profile.matchReason}</p>
                </div>
                <span style={talentStyles.statusText}>
                  {profile.connectionStatus === "available" ? "연결 가능" : "연결 제안됨"}
                </span>
              </div>

              <dl style={talentStyles.profileDetails}>
                <div>
                  <dt>가능 업무</dt>
                  <dd>{profile.availableWorkTypes.join(", ")}</dd>
                </div>
                <div>
                  <dt>경력</dt>
                  <dd>{profile.careerSummary}</dd>
                </div>
                <div>
                  <dt>가능 시간</dt>
                  <dd>{profile.availableSchedule}</dd>
                </div>
                <div>
                  <dt>희망 지역</dt>
                  <dd>{profile.preferredWorkRegions.join(", ")}</dd>
                </div>
              </dl>

              <button type="button" style={talentStyles.requestButton}>
                연결 요청
              </button>
            </article>
          ))}
        </section>
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

const applicantStyles: Record<string, CSSProperties> = {
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
    display: "grid",
    gap: "20px"
  },
  header: {
    maxWidth: "760px"
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
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px"
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
    background: "#ffffff",
    fontSize: "16px",
    fontWeight: 700
  },
  activeStepItem: {
    borderColor: "#1769aa",
    color: "#102a43",
    background: "#eef6ff"
  },
  completeStepItem: {
    borderColor: "#9fc4e8",
    color: "#0f5fa8",
    background: "#f6fbff"
  },
  stepNumber: {
    display: "grid",
    width: "30px",
    height: "30px",
    placeItems: "center",
    borderRadius: "50%",
    background: "#e9f3ff",
    color: "#0f5f9f",
    fontWeight: 800
  },
  panel: {
    display: "grid",
    gap: "16px",
    minHeight: "360px",
    padding: "28px",
    border: "1px solid #d8e1ec",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 18px 45px rgba(18, 38, 63, 0.08)"
  },
  panelLabel: {
    margin: 0,
    color: "#1769aa",
    fontSize: "16px",
    fontWeight: 800
  },
  panelTitle: {
    margin: 0,
    color: "#102a43",
    fontSize: "30px",
    lineHeight: 1.25
  },
  panelText: {
    margin: 0,
    color: "#52606d",
    fontSize: "18px",
    lineHeight: 1.65
  },
  captureBox: {
    display: "grid",
    minHeight: "160px",
    placeItems: "center",
    border: "2px dashed #b8c7d9",
    borderRadius: "8px",
    background: "#f8fbff",
    color: "#52606d",
    fontSize: "18px",
    fontWeight: 800
  },
  recordingOn: {
    margin: 0,
    padding: "14px",
    borderRadius: "8px",
    background: "#fff3cd",
    color: "#614b00",
    fontWeight: 800
  },
  recordingOff: {
    margin: 0,
    padding: "14px",
    borderRadius: "8px",
    background: "#eef6ff",
    color: "#0f5fa8",
    fontWeight: 800
  },
  transcript: {
    margin: 0,
    padding: "16px",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#405261",
    fontSize: "17px",
    lineHeight: 1.65
  },
  resumeList: {
    display: "grid",
    gap: "10px",
    margin: 0
  },
  resumeRow: {
    display: "grid",
    gridTemplateColumns: "120px minmax(0, 1fr)",
    gap: "12px",
    padding: "14px",
    borderRadius: "8px",
    background: "#f8fbff"
  },
  jobTitle: {
    margin: "12px 0 0",
    color: "#102a43",
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
    padding: "14px",
    border: "1px solid #d8e1ec",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#17202a",
    fontWeight: 800
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap"
  },
  primaryButton: {
    minHeight: "48px",
    border: "1px solid #0f5f9f",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "#176eb6",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryButton: {
    minHeight: "48px",
    border: "1px solid #b8c7d9",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "#ffffff",
    color: "#17202a",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  disabledButton: {
    cursor: "not-allowed",
    opacity: 0.5
  }
};

const talentStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "24px 14px",
    background: "#f4f7fb",
    color: "#17202a",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  shell: {
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
    overflowX: "hidden"
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  backLink: {
    margin: "0 0 10px",
    padding: 0,
    border: 0,
    color: "#1769aa",
    background: "transparent",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer"
  },
  eyebrow: {
    margin: "0 0 6px",
    color: "#1f6fb2",
    fontSize: "15px",
    fontWeight: 800
  },
  title: {
    margin: "0 0 8px",
    color: "#10233f",
    fontSize: "32px",
    lineHeight: 1.25,
    letterSpacing: 0
  },
  description: {
    margin: 0,
    color: "#52606d",
    fontSize: "18px",
    lineHeight: 1.55
  },
  primaryButton: {
    minHeight: "48px",
    border: 0,
    borderRadius: "8px",
    padding: "12px 18px",
    background: "#1266b0",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  mapPanel: {
    position: "relative",
    minHeight: "260px",
    marginBottom: "18px",
    overflow: "hidden",
    border: "1px solid #c9d7e8",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #eef6fb 0%, #ffffff 48%, #edf7ef 100%)",
    boxShadow: "0 1px 2px rgba(16, 35, 63, 0.08)"
  },
  mapGuide: {
    position: "absolute",
    inset: "22px",
    border: "1px dashed #b9c8d8",
    borderRadius: "8px"
  },
  storeMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "18px",
    height: "18px",
    border: "4px solid #d9ecfb",
    borderRadius: "999px",
    background: "#1266b0",
    transform: "translate(-50%, -50%)"
  },
  storeLabel: {
    position: "absolute",
    top: "calc(50% + 16px)",
    left: "50%",
    margin: 0,
    color: "#10233f",
    fontSize: "15px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    transform: "translateX(-50%)"
  },
  talentMarker: {
    position: "absolute",
    display: "grid",
    width: "48px",
    height: "48px",
    placeItems: "center",
    border: 0,
    background: "transparent",
    cursor: "pointer",
    filter: "drop-shadow(0 2px 3px rgba(16, 35, 63, 0.25))",
    transform: "translate(-50%, -50%)"
  },
  markerShape: {
    display: "block",
    width: "34px",
    height: "34px",
    background: "#ffc400",
    clipPath:
      "polygon(50% 0%, 62% 34%, 98% 35%, 69% 56%, 79% 91%, 50% 70%, 21% 91%, 31% 56%, 2% 35%, 38% 34%)"
  },
  mapSummary: {
    position: "absolute",
    right: "20px",
    bottom: "18px",
    display: "grid",
    gap: "6px",
    width: "min(280px, calc(100% - 40px))",
    padding: "14px 16px",
    border: "1px solid #d7e0ea",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#52606d",
    fontSize: "15px",
    lineHeight: 1.5,
    boxShadow: "0 8px 20px rgba(16, 35, 63, 0.08)"
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "16px"
  },
  filterButton: {
    minHeight: "42px",
    border: "1px solid #c9d7e8",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#10233f",
    fontSize: "15px",
    fontWeight: 800,
    whiteSpace: "normal",
    wordBreak: "keep-all"
  },
  list: {
    display: "grid",
    gap: "14px"
  },
  card: {
    position: "relative",
    display: "grid",
    gap: "14px",
    padding: "18px",
    border: "1px solid #d7e0ea",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 1px 2px rgba(16, 35, 63, 0.06)"
  },
  cardHeader: {
    display: "grid",
    alignItems: "flex-start",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "12px"
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "8px"
  },
  distanceBadge: {
    color: "#1266b0",
    fontSize: "13px",
    fontWeight: 800
  },
  confirmedBadge: {
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#e7f7ed",
    color: "#147a3d",
    fontSize: "13px",
    fontWeight: 800
  },
  pendingBadge: {
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#fff4cf",
    color: "#8a6500",
    fontSize: "13px",
    fontWeight: 800
  },
  profileName: {
    margin: "0 0 8px",
    color: "#10233f",
    fontSize: "22px",
    lineHeight: 1.25
  },
  matchReason: {
    margin: 0,
    color: "#52606d",
    fontSize: "16px",
    lineHeight: 1.55
  },
  statusText: {
    color: "#147a3d",
    fontSize: "14px",
    fontWeight: 800
  },
  profileDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px 18px",
    margin: 0
  },
  requestButton: {
    justifySelf: "stretch",
    minHeight: "48px",
    minWidth: 0,
    border: "1px solid #1266b0",
    borderRadius: "8px",
    background: "#1266b0",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer"
  }
};

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
