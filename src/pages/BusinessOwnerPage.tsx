import { FormEvent, useMemo, useState } from "react";

type SignupStep = "business" | "contact" | "hiring";

type BusinessOwnerForm = {
  companyName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  hiringRegion: string;
  workType: string;
  workSchedule: string;
  payText: string;
  requiredHeadcount: string;
  workIntensity: string;
  description: string;
};

type BusinessOwnerPageProps = {
  onBack: () => void;
};

const initialForm: BusinessOwnerForm = {
  companyName: "",
  representativeName: "",
  businessRegistrationNumber: "",
  businessAddress: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  hiringRegion: "",
  workType: "",
  workSchedule: "",
  payText: "",
  requiredHeadcount: "",
  workIntensity: "",
  description: ""
};

const signupSteps: Array<{ id: SignupStep; label: string; title: string }> = [
  { id: "business", label: "1", title: "사업장 확인" },
  { id: "contact", label: "2", title: "담당자 정보" },
  { id: "hiring", label: "3", title: "구인 조건" }
];

const matchingPoints = [
  "주민센터와 복지관에서 확인하기 쉬운 지역 일자리로 정리됩니다.",
  "구직자는 거리, 가능한 업무, 근무 시간, 업무 강도를 기준으로 확인합니다.",
  "처음 등록은 검토 요청 상태로 남기고 담당자가 확인합니다."
] as const;

export function BusinessOwnerPage({ onBack }: BusinessOwnerPageProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>("business");
  const [form, setForm] = useState<BusinessOwnerForm>(initialForm);
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

    return (
      form.hiringRegion.trim() &&
      form.workType.trim() &&
      form.workSchedule.trim() &&
      form.payText.trim() &&
      form.requiredHeadcount.trim() &&
      form.workIntensity.trim() &&
      form.description.trim()
    );
  }, [currentStep, form]);

  const updateField = (field: keyof BusinessOwnerForm, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  const goPrevious = () => {
    const previousStep = signupSteps[currentStepIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep.id);
      return;
    }

    onBack();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextStep = signupSteps[currentStepIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep.id);
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="business-page">
        <section className="business-success" aria-labelledby="business-success-title">
          <p className="section-kicker">등록 요청 완료</p>
          <h1 id="business-success-title">지역 일자리 등록 요청을 받았습니다</h1>
          <p>
            담당자가 사업장 정보와 구인 조건을 확인한 뒤 주민센터·복지관 연계 일자리로
            정리합니다.
          </p>
          <JobPreview form={form} />
          <dl className="business-summary">
            <div>
              <dt>사업장</dt>
              <dd>{form.companyName}</dd>
            </div>
            <div>
              <dt>담당자</dt>
              <dd>{form.contactName}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>검토 요청</dd>
            </div>
          </dl>
          <div className="business-actions">
            <button className="secondary-button" type="button" onClick={onBack}>
              메인으로
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setForm(initialForm);
                setCurrentStep("business");
                setIsSubmitted(false);
              }}
            >
              새 등록 작성
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="business-page">
      <section className="business-shell" aria-labelledby="business-title">
        <div className="business-header">
          <button className="back-link" type="button" onClick={onBack}>
            메인으로 돌아가기
          </button>
          <p className="section-kicker">구인자 등록</p>
          <h1 id="business-title">지역 일자리를 등록할 사업장 정보를 입력하세요</h1>
          <p>
            사업장, 담당자, 구인 조건을 나눠 입력합니다. 마지막 단계에서는 구직자에게 보일
            일자리 미리보기를 바로 확인할 수 있습니다.
          </p>
        </div>

        <aside className="business-guide" aria-label="등록 후 연결 방식">
          {matchingPoints.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </aside>

        <div className="progress-box" aria-label="등록 단계">
          <div className="progress-track">
            <div className="progress-bar" style={{ width: progressWidth }} />
          </div>
          <ol className="signup-step-list">
            {signupSteps.map((step, index) => (
              <li
                className={[
                  step.id === currentStep ? "is-active" : "",
                  index < currentStepIndex ? "is-complete" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={step.id}
              >
                <span>{step.label}</span>
                {step.title}
              </li>
            ))}
          </ol>
        </div>

        <form className="business-form" onSubmit={handleSubmit}>
          {currentStep === "business" && (
            <div className="form-grid">
              <Field
                label="사업장 이름"
                value={form.companyName}
                placeholder="예: 우리동네 반찬가게"
                onChange={(value) => updateField("companyName", value)}
              />
              <Field
                label="대표자 이름"
                value={form.representativeName}
                placeholder="예: 김대표"
                onChange={(value) => updateField("representativeName", value)}
              />
              <Field
                label="사업자등록번호"
                value={form.businessRegistrationNumber}
                placeholder="예: 123-45-67890"
                onChange={(value) => updateField("businessRegistrationNumber", value)}
              />
              <Field
                label="사업장 주소"
                value={form.businessAddress}
                placeholder="예: 충북 청주시 상당구 중앙로 10"
                onChange={(value) => updateField("businessAddress", value)}
              />
            </div>
          )}

          {currentStep === "contact" && (
            <div className="form-grid">
              <Field
                label="담당자 이름"
                value={form.contactName}
                placeholder="예: 이담당"
                onChange={(value) => updateField("contactName", value)}
              />
              <Field
                label="담당자 연락처"
                value={form.contactPhone}
                placeholder="예: 010-1234-5678"
                onChange={(value) => updateField("contactPhone", value)}
              />
              <Field
                label="담당자 이메일"
                type="email"
                value={form.contactEmail}
                placeholder="예: hello@company.co.kr"
                onChange={(value) => updateField("contactEmail", value)}
              />
              <div className="notice-box">
                연락처는 등록 확인과 구인 조건 확인 안내에만 사용합니다.
              </div>
            </div>
          )}

          {currentStep === "hiring" && (
            <div className="business-hiring-grid">
              <div className="form-grid">
                <Field
                  label="구인 희망 지역"
                  value={form.hiringRegion}
                  placeholder="예: 청주시 상당구, 내수읍"
                  onChange={(value) => updateField("hiringRegion", value)}
                />
                <Field
                  label="필요 업무"
                  value={form.workType}
                  placeholder="예: 주방 보조, 포장, 매장 정리"
                  onChange={(value) => updateField("workType", value)}
                />
                <Field
                  label="근무 시간"
                  value={form.workSchedule}
                  placeholder="예: 주 3일, 오전 9시-12시"
                  onChange={(value) => updateField("workSchedule", value)}
                />
                <Field
                  label="급여"
                  value={form.payText}
                  placeholder="예: 시간당 1만원"
                  onChange={(value) => updateField("payText", value)}
                />
                <Field
                  label="필요 인원"
                  value={form.requiredHeadcount}
                  placeholder="예: 1명"
                  onChange={(value) => updateField("requiredHeadcount", value)}
                />
                <label className="field">
                  <span>업무 강도</span>
                  <select
                    value={form.workIntensity}
                    onChange={(event) => updateField("workIntensity", event.target.value)}
                  >
                    <option value="">선택</option>
                    <option value="가벼움">가벼움</option>
                    <option value="보통">보통</option>
                    <option value="무거운 작업 있음">무거운 작업 있음</option>
                  </select>
                </label>
                <label className="field full-width-field">
                  <span>업무 설명</span>
                  <textarea
                    value={form.description}
                    placeholder="이동 동선, 서서 일하는 시간, 반복 작업 여부를 적어주세요."
                    onChange={(event) => updateField("description", event.target.value)}
                  />
                </label>
              </div>
              <JobPreview form={form} />
            </div>
          )}

          <div className="business-actions">
            <button className="secondary-button" type="button" onClick={goPrevious}>
              이전
            </button>
            <button className="primary-button" disabled={!isCurrentStepReady} type="submit">
              {currentStep === "hiring" ? "등록 요청 완료" : "다음"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
};

function Field({ label, value, placeholder, type = "text", onChange }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function JobPreview({ form }: { form: BusinessOwnerForm }) {
  return (
    <article className="job-preview" aria-label="등록 일자리 미리보기">
      <p className="section-kicker">미리보기</p>
      <h2>{form.workType || "필요 업무를 입력하세요"}</h2>
      <dl>
        <div>
          <dt>지역</dt>
          <dd>{form.hiringRegion || "미입력"}</dd>
        </div>
        <div>
          <dt>근무</dt>
          <dd>{form.workSchedule || "미입력"}</dd>
        </div>
        <div>
          <dt>급여</dt>
          <dd>{form.payText || "미입력"}</dd>
        </div>
        <div>
          <dt>인원</dt>
          <dd>{form.requiredHeadcount || "미입력"}</dd>
        </div>
        <div>
          <dt>강도</dt>
          <dd>{form.workIntensity || "미입력"}</dd>
        </div>
      </dl>
      <p>{form.description || "업무 설명을 입력하면 구직자가 확인할 문장으로 표시됩니다."}</p>
    </article>
  );
}
