import { FormEvent, useMemo, useState } from "react";

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

const initialForm: RecruiterSignupForm = {
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

const steps: Array<{ id: SignupStep; label: string; title: string }> = [
  { id: "business", label: "1", title: "사업장 확인" },
  { id: "contact", label: "2", title: "담당자 정보" },
  { id: "hiring", label: "3", title: "구인 조건" }
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<SignupStep>("business");
  const [form, setForm] = useState<RecruiterSignupForm>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progressWidth = `${((currentStepIndex + 1) / steps.length) * 100}%`;

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
      return (
        form.contactName.trim() &&
        form.contactPhone.trim() &&
        form.contactEmail.trim()
      );
    }

    return form.hiringRegion.trim() && form.workType.trim();
  }, [currentStep, form]);

  const updateField = (field: keyof RecruiterSignupForm, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  const goNext = () => {
    const nextStep = steps[currentStepIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const goBack = () => {
    const previousStep = steps[currentStepIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep.id);
    }
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
      <main style={styles.page}>
        <section style={styles.successPanel} aria-labelledby="success-title">
          <p style={styles.eyebrow}>가입 신청 완료</p>
          <h1 id="success-title" style={styles.successTitle}>
            구인자 회원가입 신청이 접수되었습니다.
          </h1>
          <p style={styles.successDescription}>
            담당자가 사업장 정보를 확인한 뒤 지역 일자리 등록을 도와드립니다.
            확인 연락은 입력하신 담당자 연락처로 안내됩니다.
          </p>
          <dl style={styles.summaryList}>
            <div style={styles.summaryItem}>
              <dt>사업장</dt>
              <dd>{form.companyName}</dd>
            </div>
            <div style={styles.summaryItem}>
              <dt>구인 지역</dt>
              <dd>{form.hiringRegion}</dd>
            </div>
            <div style={styles.summaryItem}>
              <dt>필요 업무</dt>
              <dd>{form.workType}</dd>
            </div>
          </dl>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => {
              setForm(initialForm);
              setCurrentStep("business");
              setIsSubmitted(false);
            }}
          >
            새 가입 신청 작성
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.shell} aria-labelledby="page-title">
        <div style={styles.header}>
          <p style={styles.eyebrow}>Blogle2 구인자 회원가입</p>
          <h1 id="page-title" style={styles.title}>
            지역 일자리를 등록할 사업장 정보를 입력해주세요.
          </h1>
          <p style={styles.description}>
            복잡한 절차를 줄이고, 주민센터·복지관과 연결할 수 있는 기본
            정보만 먼저 확인합니다.
          </p>
        </div>

        <div style={styles.progressBox} aria-label="가입 단계">
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: progressWidth }} />
          </div>
          <ol style={styles.stepList}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = index < currentStepIndex;

              return (
                <li
                  key={step.id}
                  style={{
                    ...styles.stepItem,
                    ...(isActive ? styles.activeStepItem : {}),
                    ...(isComplete ? styles.completeStepItem : {})
                  }}
                >
                  <span style={styles.stepNumber}>{step.label}</span>
                  <span>{step.title}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {currentStep === "business" && (
            <div style={styles.formGrid}>
              <FormField
                label="사업장 이름"
                value={form.companyName}
                placeholder="예: 도란식당"
                onChange={(value) => updateField("companyName", value)}
              />
              <FormField
                label="대표자 이름"
                value={form.representativeName}
                placeholder="예: 안미선"
                onChange={(value) => updateField("representativeName", value)}
              />
              <FormField
                label="사업자등록번호"
                value={form.businessRegistrationNumber}
                placeholder="예: 123-45-67890"
                onChange={(value) =>
                  updateField("businessRegistrationNumber", value)
                }
              />
              <FormField
                label="사업장 주소"
                value={form.businessAddress}
                placeholder="예: 충북 옥천군 옥천읍 중앙로 10"
                onChange={(value) => updateField("businessAddress", value)}
              />
            </div>
          )}

          {currentStep === "contact" && (
            <div style={styles.formGrid}>
              <FormField
                label="담당자 이름"
                value={form.contactName}
                placeholder="예: 김담당"
                onChange={(value) => updateField("contactName", value)}
              />
              <FormField
                label="담당자 연락처"
                value={form.contactPhone}
                placeholder="예: 010-1234-5678"
                onChange={(value) => updateField("contactPhone", value)}
              />
              <FormField
                label="담당자 이메일"
                type="email"
                value={form.contactEmail}
                placeholder="예: hello@company.co.kr"
                onChange={(value) => updateField("contactEmail", value)}
              />
              <div style={styles.noticeBox}>
                입력한 연락처는 가입 승인과 구인 등록 안내에만 사용됩니다.
              </div>
            </div>
          )}

          {currentStep === "hiring" && (
            <div style={styles.formGrid}>
              <FormField
                label="구인 희망 지역"
                value={form.hiringRegion}
                placeholder="예: 옥천읍, 이원면, 동이면"
                onChange={(value) => updateField("hiringRegion", value)}
              />
              <FormField
                label="필요한 업무"
                value={form.workType}
                placeholder="예: 주방 보조, 농산물 포장, 매장 정리"
                onChange={(value) => updateField("workType", value)}
              />
              <label style={{ ...styles.field, ...styles.fullWidthField }}>
                <span style={styles.label}>추가 요청 사항</span>
                <textarea
                  value={form.note}
                  placeholder="근무 시간, 필요한 인원, 우대 조건을 적어주세요."
                  onChange={(event) => updateField("note", event.target.value)}
                  style={{ ...styles.input, ...styles.textarea }}
                />
              </label>
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={goBack}
              disabled={currentStepIndex === 0}
            >
              이전
            </button>
            <button
              type="submit"
              style={{
                ...styles.primaryButton,
                ...(!isCurrentStepReady ? styles.disabledButton : {})
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

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
};

function FormField({
  label,
  value,
  placeholder,
  type = "text",
  onChange
}: FormFieldProps) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background: "#f4f7fb",
    color: "#17202a",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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
