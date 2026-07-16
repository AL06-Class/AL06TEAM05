import { FormEvent, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Clock,
  LogIn,
  MapPin,
  Navigation,
  UserPlus,
  Users
} from "lucide-react";
import localJobMap from "./assets/local-job-map.png";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Field, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { LoginPage } from "./LoginPage";
import { cn } from "./lib/utils";
import { BusinessOwnerPage } from "./pages/BusinessOwnerPage";
import {
  requestResumeDraft,
  type ResumeAiResponse
} from "./services/resumeAiClient";
import {
  buildResumeAiRequest,
  type ResumeAiAnswers
} from "./services/resumeAiRequest";
import { saveResume } from "./services/resumeStore";

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

type PageView =
  | "home"
  | "login"
  | "applicantSignup"
  | "recruiterSignup"
  | "talentMatches"
  | "businessOwner";

type SignupStep = "business" | "contact" | "hiring";

type ApplicantStepId =
  | "start"
  | "face"
  | "idCard"
  | "review"
  | "resumeForm"
  | "resumeResult";

type UploadedImage = {
  fileName: string;
  previewUrl: string;
};

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
  { id: "face", title: "얼굴 사진" },
  { id: "idCard", title: "본인 확인" },
  { id: "review", title: "사진 확인" },
  { id: "resumeForm", title: "이력서 등록" },
  { id: "resumeResult", title: "이력서 확인" }
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

  if (pageView === "login") {
    return <LoginPage onBack={() => setPageView("home")} />;
  }

  if (pageView === "recruiterSignup") {
    return <RecruiterSignup onBack={() => setPageView("home")} />;
  }

  if (pageView === "talentMatches") {
    return <TalentMatches onBack={() => setPageView("home")} />;
  }

  if (pageView === "businessOwner") {
    return <BusinessOwnerPage onBack={() => setPageView("home")} />;
  }

  return (
    <main className="relative isolate mx-auto min-h-dvh w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_58%,var(--background)),var(--background)_760px)]"
        aria-hidden="true"
      >
        <span className="absolute -top-32 left-[6%] size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute -right-24 top-20 size-[560px] rounded-full bg-brand/10 blur-3xl" />
      </div>
      <header
        className="sticky top-3 z-50 mb-8 grid gap-3 rounded-2xl border border-white/70 bg-card/80 p-2 shadow-[0_18px_50px_-30px_rgba(23,59,101,0.65)] backdrop-blur-xl sm:p-3 xl:grid-cols-[auto_1fr_auto] xl:items-center"
        aria-label="서비스 상단 메뉴"
      >
        <a
          className="inline-flex min-h-12 items-center gap-3 self-start rounded-xl px-2 text-xl font-black tracking-tight text-brand outline-none transition hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/40"
          href="#home"
          aria-label="메인페이지로 이동"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-brand text-brand-foreground shadow-lg shadow-primary/20">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          메인페이지
        </a>
        <nav className="hidden items-center justify-center gap-1 xl:flex" aria-label="홈 화면 바로가기">
          <a
            className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            href="#home"
          >
            지역 일자리
          </a>
          <a
            className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            href="#quick-start"
          >
            처음 시작하기
          </a>
          <a
            className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            href="#flow"
          >
            이용 흐름
          </a>
        </nav>
        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end"
          aria-label="주요 등록 화면"
        >
          <Button
            className="w-full shadow-sm sm:w-auto"
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => setPageView("applicantSignup")}
          >
            <UserPlus data-icon="inline-start" aria-hidden="true" />
            구직자 등록
          </Button>
          <Button
            className="w-full shadow-sm sm:w-auto"
            size="sm"
            type="button"
            onClick={() => setPageView("recruiterSignup")}
          >
            <Briefcase data-icon="inline-start" aria-hidden="true" />
            구인자 등록
          </Button>
          <Button
            className="w-full bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 sm:w-auto"
            size="sm"
            type="button"
            onClick={() => setPageView("talentMatches")}
          >
            <Users data-icon="inline-start" aria-hidden="true" />
            지역 인재 보기
          </Button>
          <Button
            className="w-full bg-card shadow-sm sm:w-auto"
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setPageView("login")}
          >
            <LogIn data-icon="inline-start" aria-hidden="true" />
            로그인
          </Button>
        </div>
      </header>

      <section className="pt-2" id="home" aria-label="지역 일자리 지도">
        <Card
          className="overflow-hidden rounded-[30px] border-white/80 bg-card/90 shadow-[0_30px_90px_-45px_rgba(23,59,101,0.65)] ring-1 ring-border/50 backdrop-blur-sm"
          aria-label="지역 일자리 지도"
        >
          <CardContent className="p-3 sm:p-5 lg:p-6">
            <div
              className="relative mb-5 min-h-[320px] overflow-hidden rounded-[24px] border border-white/80 bg-muted shadow-inner sm:min-h-[380px]"
              aria-label="등록된 일자리 위치"
            >
              <img
                className="absolute inset-0 size-full object-cover"
                src={localJobMap}
                alt=""
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-brand/[0.08]"
                aria-hidden="true"
              />
              <div className="absolute left-1/2 top-[44%] z-10 grid min-w-48 -translate-x-1/2 -translate-y-1/2 place-items-center gap-2 rounded-3xl border border-white/70 bg-card/70 px-8 py-6 text-center shadow-[0_24px_60px_-32px_rgba(23,59,101,0.65)] backdrop-blur-xl">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-brand text-primary-foreground shadow-lg shadow-primary/20">
                  <MapPin className="size-6" aria-hidden="true" />
                </span>
                <strong className="text-2xl font-black tracking-tight text-foreground">일자리</strong>
                <span className="text-base font-semibold text-muted-foreground">등록 일자리 표시</span>
              </div>
              {localJobs.map((job) => (
                <button
                  aria-label={`${job.region} ${job.title}`}
                  aria-pressed={selectedJobId === job.id}
                  className={cn(
                    "group absolute z-20 grid size-14 place-items-center rounded-full outline-none transition duration-300 hover:-translate-y-1 hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/25 sm:size-16",
                    job.markerClass === "marker-north" && "left-[43%] top-10 max-sm:left-[48%]",
                    job.markerClass === "marker-west" && "left-[17%] top-32 max-sm:left-[12%]",
                    job.markerClass === "marker-south" &&
                      "bottom-[72px] right-[33%] max-sm:bottom-[74px] max-sm:right-[22%]",
                    selectedJobId === job.id && "scale-110 bg-card/60 ring-4 ring-primary/20 backdrop-blur-sm"
                  )}
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "grid size-11 -rotate-45 place-items-center rounded-[16px_16px_16px_4px] text-primary-foreground shadow-[0_14px_28px_-12px_rgba(23,59,101,0.75)] transition-colors",
                      selectedJobId === job.id
                        ? "bg-primary"
                        : "bg-brand group-hover:bg-primary"
                    )}
                    aria-hidden="true"
                  >
                    <MapPin className="size-5 rotate-45" />
                  </span>
                </button>
              ))}
              <Button
                className="absolute bottom-4 left-4 right-4 z-20 border-white/70 bg-card/80 text-brand shadow-[0_16px_36px_-20px_rgba(23,59,101,0.65)] backdrop-blur-xl hover:bg-card sm:bottom-6 sm:left-auto sm:right-6"
                variant="outline"
                type="button"
              >
                <Navigation data-icon="inline-start" aria-hidden="true" />
                내 주변 일자리 보기
              </Button>
            </div>

            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.4fr)]">
              <article
                className="relative grid min-w-0 content-start gap-5 overflow-hidden rounded-[24px] border border-primary/15 bg-gradient-to-br from-accent/80 via-card to-card p-5 shadow-[0_18px_45px_-32px_rgba(37,99,235,0.65)] sm:p-6"
                aria-live="polite"
              >
                <span className="absolute right-0 top-0 size-32 translate-x-12 -translate-y-12 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
                <p className="mb-0 text-sm font-black tracking-[0.12em] text-primary">
                  선택한 일자리
                </p>
                <h2 className="m-0 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {selectedJob.title}
                </h2>
                <dl className="m-0 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="grid gap-1 rounded-xl border border-white/80 bg-card/90 p-3 shadow-sm">
                    <dt className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                      <MapPin className="size-4" aria-hidden="true" /> 거리
                    </dt>
                    <dd className="m-0 text-base font-black text-foreground">{selectedJob.distance}</dd>
                  </div>
                  <div className="grid gap-1 rounded-xl border border-white/80 bg-card/90 p-3 shadow-sm">
                    <dt className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                      <Clock className="size-4" aria-hidden="true" /> 근무
                    </dt>
                    <dd className="m-0 text-base font-black text-foreground">{selectedJob.schedule}</dd>
                  </div>
                  <div className="grid gap-1 rounded-xl border border-white/80 bg-card/90 p-3 shadow-sm">
                    <dt className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                      <Banknote className="size-4" aria-hidden="true" /> 급여
                    </dt>
                    <dd className="m-0 text-base font-black text-foreground">{selectedJob.pay}</dd>
                  </div>
                </dl>
                <p className="mb-0 text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                  {selectedJob.fit}
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-brand shadow-lg shadow-primary/15 hover:opacity-90"
                  type="button"
                  onClick={() => setPageView("talentMatches")}
                >
                  연결 가능한 인재 보기
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              </article>

              <ul className="m-0 grid min-w-0 list-none gap-3 p-0">
                {localJobs.map((job) => (
                  <li className="min-w-0" key={job.id}>
                    <button
                      aria-pressed={selectedJobId === job.id}
                      className={cn(
                        "group relative grid min-h-[132px] w-full min-w-0 gap-2 overflow-hidden rounded-[20px] border p-4 text-left outline-none transition duration-300 focus-visible:ring-4 focus-visible:ring-ring/25",
                        selectedJobId === job.id
                          ? "border-primary/60 bg-gradient-to-r from-primary/[0.09] to-card shadow-[inset_4px_0_0_var(--primary),0_16px_36px_-28px_var(--brand)]"
                          : "border-border/70 bg-card/90 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-[0_20px_45px_-30px_rgba(23,59,101,0.55)]"
                      )}
                      onClick={() => setSelectedJobId(job.id)}
                      type="button"
                    >
                      <span className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 max-sm:grid-cols-1 max-sm:gap-1">
                        <strong className="min-w-0 text-lg font-black text-foreground group-hover:text-primary">
                          {job.title}
                        </strong>
                        <small className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 text-sm font-black text-secondary-foreground max-sm:justify-self-start">
                          {job.distance}
                        </small>
                      </span>
                      <span className="text-base font-semibold leading-relaxed text-muted-foreground">
                        {job.region} · {job.workType}
                      </span>
                      <p className="mb-0 text-base leading-relaxed text-muted-foreground">
                        {job.schedule} · {job.partner}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className="mt-16 grid gap-8 rounded-[30px] border border-white/80 bg-card/65 p-6 shadow-[0_24px_70px_-45px_rgba(23,59,101,0.5)] backdrop-blur-sm sm:p-8 lg:grid-cols-[minmax(220px,360px)_minmax(0,1fr)] lg:items-start"
        id="quick-start"
        aria-labelledby="quick-start-title"
      >
        <div className="min-w-0">
          <p className="mb-3 text-sm font-black tracking-[0.12em] text-primary">처음 오셨나요?</p>
          <h2
            className="m-0 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl"
            id="quick-start-title"
          >
            원하는 방식으로 바로 시작할 수 있습니다
          </h2>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {mainActions.map((action) => {
            const ActionIcon = action.label === "구직자 등록" ? UserPlus : Briefcase;

            return (
              <button
                className={cn(
                  "group grid min-h-40 gap-4 overflow-hidden rounded-[22px] border p-5 text-left shadow-sm outline-none transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-32px_rgba(23,59,101,0.65)] focus-visible:ring-4 focus-visible:ring-ring/25",
                  action.label === "구직자 등록"
                    ? "border-primary/20 bg-gradient-to-br from-primary/[0.09] via-card to-card hover:border-primary/40"
                    : "border-brand/20 bg-gradient-to-br from-brand/[0.09] via-card to-card hover:border-brand/40"
                )}
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
                <strong className="flex items-center gap-3 text-lg font-black text-foreground">
                  <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-brand text-primary-foreground shadow-lg shadow-primary/15 transition group-hover:scale-105">
                    <ActionIcon className="size-5" aria-hidden="true" />
                  </span>
                  {action.label}
                  <ArrowRight className="ml-auto size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                </strong>
                <span className="text-base leading-relaxed text-muted-foreground">{action.description}</span>
              </button>
            );
          })}
          <button
            className="group grid min-h-40 gap-4 overflow-hidden rounded-[22px] border border-brand/20 bg-gradient-to-br from-brand/[0.12] via-card to-card p-5 text-left shadow-sm outline-none transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_22px_50px_-32px_rgba(23,59,101,0.65)] focus-visible:ring-4 focus-visible:ring-ring/25"
            onClick={() => setPageView("businessOwner")}
            type="button"
          >
            <strong className="flex items-center gap-3 text-lg font-black text-foreground">
              <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-primary text-brand-foreground shadow-lg shadow-brand/15 transition group-hover:scale-105">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              사업자 페이지
              <ArrowRight className="ml-auto size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
            </strong>
            <span className="text-base leading-relaxed text-muted-foreground">
              지역 일자리 정보를 빠르게 올립니다.
            </span>
          </button>
        </div>
      </section>

      <section
        className="mt-16 grid gap-8 lg:grid-cols-[minmax(220px,360px)_minmax(0,1fr)] lg:items-start"
        id="flow"
        aria-labelledby="flow-title"
      >
        <div className="min-w-0">
          <p className="mb-3 text-sm font-black tracking-[0.12em] text-primary">3단계 흐름</p>
          <h2
            className="m-0 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl"
            id="flow-title"
          >
            등록부터 매칭까지 짧게 안내합니다
          </h2>
        </div>
        <ol className="relative m-0 grid min-w-0 list-none gap-3 p-0 before:absolute before:bottom-10 before:left-6 before:top-10 before:w-px before:bg-gradient-to-b before:from-primary/60 before:via-border before:to-brand/50">
          {processSteps.map((step, index) => (
            <li
              className="relative grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 rounded-[20px] border border-border/70 bg-card/90 p-4 shadow-[0_14px_34px_-28px_rgba(23,59,101,0.55)] backdrop-blur-sm transition hover:border-primary/25 hover:shadow-md"
              key={step}
            >
              <span className="relative z-10 grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-brand text-lg font-black text-primary-foreground shadow-lg shadow-primary/15">
                {index + 1}
              </span>
              <p className="mb-0 text-base font-semibold leading-relaxed text-muted-foreground">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="relative mt-16 overflow-hidden rounded-[30px] bg-gradient-to-br from-brand via-[#153453] to-[#0d2742] px-6 py-8 text-brand-foreground shadow-[0_28px_80px_-42px_rgba(13,39,66,0.9)] sm:px-8 sm:py-10">
        <span
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid max-w-xl gap-4">
            <a
              className="inline-flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-white/40"
              href="#home"
              aria-label="메인페이지로 이동"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white/12 text-white ring-1 ring-white/15 backdrop-blur-sm">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <strong className="text-xl font-black tracking-tight">Blogle2</strong>
            </a>
            <p className="mb-0 text-base font-semibold leading-relaxed text-white/70 sm:text-lg">
              등록부터 매칭까지 짧게 안내합니다
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="푸터 바로가기">
            <a
              className="rounded-lg px-3 py-2 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
              href="#home"
            >
              지역 일자리
            </a>
            <a
              className="rounded-lg px-3 py-2 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
              href="#quick-start"
            >
              처음 시작하기
            </a>
            <a
              className="rounded-lg px-3 py-2 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
              href="#flow"
            >
              이용 흐름
            </a>
          </nav>
        </div>
        <div className="relative mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm font-semibold text-white/45">
          <span>메인페이지</span>
          <span>지역 일자리 연결</span>
        </div>
      </footer>
    </main>
  );
}

function ApplicantSignup({ onBack }: { onBack: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [faceImage, setFaceImage] = useState<UploadedImage | null>(null);
  const [idCardImage, setIdCardImage] = useState<UploadedImage | null>(null);
  const [answers, setAnswers] = useState<ResumeAiAnswers>({
    wantedJob: "",
    experience: "",
    strength: "",
    workTime: "",
    workArea: ""
  });
  const [resumeText, setResumeText] =
    useState<ResumeAiResponse["resumeText"] | null>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [recordingField, setRecordingField] =
    useState<keyof ResumeAiAnswers | null>(null);
  const [message, setMessage] = useState("");
  const recognitionRef = useRef<any>(null);
  const currentStep = applicantSteps[stepIndex];
  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const canGoNext =
    currentStep.id === "start" ||
    (currentStep.id === "face" && Boolean(faceImage)) ||
    (currentStep.id === "idCard" && Boolean(idCardImage)) ||
    (currentStep.id === "review" && Boolean(faceImage) && Boolean(idCardImage)) ||
    (currentStep.id === "resumeForm" && !isGeneratingResume);

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.stop();
    setRecordingField(null);
  };

  const goNext = () => {
    stopRecording();
    setStepIndex((current) => Math.min(current + 1, applicantSteps.length - 1));
    setMessage("");
  };

  const goBack = () => {
    stopRecording();

    if (stepIndex === 0) {
      onBack();
      return;
    }

    setStepIndex((current) => Math.max(current - 1, 0));
    setMessage("");
  };

  const readImage = (file: File, onReady: (image: UploadedImage) => void) => {
    if (!file.type.startsWith("image/")) {
      setMessage("사진 파일만 올릴 수 있습니다.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onReady({
        fileName: file.name,
        previewUrl: String(reader.result)
      });
      setMessage("사진을 불러왔습니다. 저장하지 않고 화면에서만 사용합니다.");
    };

    reader.onerror = () => {
      setMessage("사진을 불러오지 못했습니다. 다른 사진을 선택해주세요.");
    };

    reader.readAsDataURL(file);
  };

  const updateAnswer = (field: keyof ResumeAiAnswers, value: string) => {
    setAnswers((current) => ({
      ...current,
      [field]: value
    }));
  };

  const startRecording = (field: keyof ResumeAiAnswers) => {
    if (!isSpeechSupported) {
      setMessage("이 브라우저는 녹음 입력을 지원하지 않습니다. 직접 입력해주세요.");
      return;
    }

    if (recordingField === field) {
      stopRecording();
      setMessage("녹음을 멈췄습니다.");
      return;
    }

    stopRecording();

    const BrowserSpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new BrowserSpeechRecognition();

    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        setAnswers((current) => ({
          ...current,
          [field]: [current[field], transcript].filter(Boolean).join(" ")
        }));
        setMessage("말씀하신 내용을 적었습니다.");
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        return;
      }

      setMessage("녹음 내용을 읽지 못했습니다. 다시 말하거나 직접 입력해주세요.");
      setRecordingField(null);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognition.start();
        return;
      }

      setRecordingField(null);
    };

    recognitionRef.current = recognition;
    setRecordingField(field);
    setMessage("말씀해주세요. 끝나면 자동으로 글자로 적습니다.");
    recognition.start();
  };

  const createResumePreview = async () => {
    stopRecording();
    setIsGeneratingResume(true);
    setMessage("이력서를 만들고 있습니다. 잠시만 기다려주세요.");

    try {
      const resumeAiRequest = buildResumeAiRequest({
        answers,
        facePhotoFileName: faceImage?.fileName ?? null,
        identityPhotoFileName: idCardImage?.fileName ?? null
      });
      const response = await requestResumeDraft(resumeAiRequest);

      setResumeText(response.resumeText);
      setStepIndex((current) => Math.min(current + 1, applicantSteps.length - 1));
      setMessage("");
    } catch {
      setMessage("이력서를 만들지 못했습니다. 다시 눌러주세요.");
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const saveResumeAndFinish = async () => {
    if (resumeText === null || isSavingResume) {
      return;
    }

    setIsSavingResume(true);
    setMessage("이력서를 저장하고 있습니다.");

    try {
      await saveResume(resumeText);
      onBack();
    } catch {
      setMessage("이력서를 저장하지 못했습니다. 다시 눌러주세요.");
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleNext = () => {
    if (currentStep.id === "resumeForm") {
      void createResumePreview();
      return;
    }

    goNext();
  };

  const nextButtonText =
    currentStep.id === "review"
      ? "이력서 답하기 시작"
      : currentStep.id === "resumeForm"
        ? isGeneratingResume ? "만드는 중" : "이력서 만들기"
        : stepIndex === 0 ? "시작하기" : "다음";

  return (
    <main style={applicantStyles.page}>
      <section style={applicantStyles.shell} aria-labelledby="applicant-title">
        <header style={applicantStyles.header}>
          <Button type="button" variant="ghost" style={applicantStyles.backLink} onClick={onBack}>
            메인으로 돌아가기
          </Button>
          <p style={applicantStyles.eyebrow}>구직자 간편 등록</p>
          <h1 id="applicant-title" style={applicantStyles.title}>
            사진 확인 후 이력서를 등록합니다.
          </h1>
          <p style={applicantStyles.description}>
            얼굴 사진과 본인 확인 사진을 먼저 올린 뒤, 말로 이력서 내용을 등록합니다.
          </p>
        </header>

        <nav aria-label="이력서 준비 단계" style={applicantStyles.steps}>
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

        {message && <p style={applicantStyles.notice}>{message}</p>}

        <section style={applicantStyles.panel}>
          {currentStep.id === "start" && (
            <>
              <p style={applicantStyles.panelLabel}>1단계</p>
              <h2 style={applicantStyles.panelTitle}>천천히 시작하겠습니다</h2>
              <p style={applicantStyles.panelText}>
                간편 회원가입을 위해 얼굴 사진과 본인 확인 사진을 먼저 올립니다.
              </p>
            </>
          )}

          {currentStep.id === "face" && (
            <PhotoPanel
              label="2단계"
              title="얼굴 사진을 올려주세요"
              guide="정면으로 나온 사진을 선택해주세요."
              inputId="face-photo"
              image={faceImage}
              onChange={(file) => file && readImage(file, setFaceImage)}
              onDelete={() => {
                setFaceImage(null);
                setMessage("얼굴 사진을 삭제했습니다. 다시 올릴 수 있습니다.");
              }}
            />
          )}

          {currentStep.id === "idCard" && (
            <PhotoPanel
              label="3단계"
              title="본인 확인 사진을 올려주세요"
              guide="신분 확인용 사진을 선택해주세요. 저장하지 않습니다."
              inputId="id-card-photo"
              image={idCardImage}
              onChange={(file) => file && readImage(file, setIdCardImage)}
              onDelete={() => {
                setIdCardImage(null);
                setMessage("본인 확인 사진을 삭제했습니다. 다시 올릴 수 있습니다.");
              }}
            />
          )}

          {currentStep.id === "review" && (
            <>
              <p style={applicantStyles.panelLabel}>4단계</p>
              <h2 style={applicantStyles.panelTitle}>올린 사진을 확인해주세요</h2>
              <div style={applicantStyles.previewGrid}>
                <PreviewCard
                  title="얼굴 사진"
                  image={faceImage}
                  onDelete={() => {
                    setFaceImage(null);
                    setStepIndex(1);
                    setMessage("얼굴 사진을 삭제했습니다. 다시 올려주세요.");
                  }}
                />
                <PreviewCard
                  title="본인 확인 사진"
                  image={idCardImage}
                  onDelete={() => {
                    setIdCardImage(null);
                    setStepIndex(2);
                    setMessage("본인 확인 사진을 삭제했습니다. 다시 올려주세요.");
                  }}
                />
              </div>
              <p style={applicantStyles.panelText}>
                사진 2장이 모두 보이면 이력서 등록을 시작할 수 있습니다.
              </p>
            </>
          )}

          {currentStep.id === "resumeForm" && (
            <>
              <p style={applicantStyles.panelLabel}>이력서 등록</p>
              <h2 style={applicantStyles.panelTitle}>버튼을 누르고 말씀해주세요</h2>
              <p style={applicantStyles.panelText}>
                각 질문마다 녹음 버튼을 누르고 편하게 말씀해주세요. 잘못 적히면 직접 고칠 수 있습니다.
              </p>
              {!isSpeechSupported && (
                <p style={applicantStyles.recordingOff}>
                  현재 브라우저에서는 녹음 입력이 어렵습니다. 아래 칸에 직접 적어주세요.
                </p>
              )}
              <div style={applicantStyles.formGrid}>
                <QuestionField
                  field="wantedJob"
                  label="어떤 일을 하고 싶으세요?"
                  placeholder="예: 청소, 주방 보조, 안내"
                  value={answers.wantedJob}
                  isRecording={recordingField === "wantedJob"}
                  onRecord={startRecording}
                  onChange={(value) => updateAnswer("wantedJob", value)}
                />
                <QuestionField
                  field="experience"
                  label="전에 해본 일을 말씀해주세요"
                  placeholder="예: 식당에서 5년 일했습니다"
                  value={answers.experience}
                  isRecording={recordingField === "experience"}
                  onRecord={startRecording}
                  onChange={(value) => updateAnswer("experience", value)}
                />
                <QuestionField
                  field="strength"
                  label="잘하는 점은 무엇인가요?"
                  placeholder="예: 성실합니다, 시간이 정확합니다"
                  value={answers.strength}
                  isRecording={recordingField === "strength"}
                  onRecord={startRecording}
                  onChange={(value) => updateAnswer("strength", value)}
                />
                <QuestionField
                  field="workTime"
                  label="언제 일할 수 있으세요?"
                  placeholder="예: 오전, 오후, 주 3일"
                  value={answers.workTime}
                  isRecording={recordingField === "workTime"}
                  onRecord={startRecording}
                  onChange={(value) => updateAnswer("workTime", value)}
                />
                <QuestionField
                  field="workArea"
                  label="어느 지역에서 일하고 싶으세요?"
                  placeholder="예: 집 근처, 강서구, 버스로 갈 수 있는 곳"
                  value={answers.workArea}
                  isRecording={recordingField === "workArea"}
                  onRecord={startRecording}
                  onChange={(value) => updateAnswer("workArea", value)}
                />
              </div>
            </>
          )}

          {currentStep.id === "resumeResult" && (
            <>
              <p style={applicantStyles.panelLabel}>이력서 확인</p>
              <h2 style={applicantStyles.panelTitle}>이력서 미리보기</h2>
              <p style={applicantStyles.panelText}>
                말씀하신 내용을 바탕으로 만든 이력서입니다. 아직 저장하지 않았습니다.
              </p>
              <dl style={applicantStyles.resumeList}>
                <ResumeRow label="희망하는 일" value={resumeText?.wantedJob ?? ""} />
                <ResumeRow label="해본 일" value={resumeText?.experience ?? ""} />
                <ResumeRow label="잘하는 점" value={resumeText?.strength ?? ""} />
                <ResumeRow label="일할 수 있는 시간" value={resumeText?.workTime ?? ""} />
                <ResumeRow label="희망 지역" value={resumeText?.workArea ?? ""} />
              </dl>
              <p style={applicantStyles.panelText}>버튼을 누른 뒤 PDF 저장을 선택해주세요.</p>
              <Button type="button" style={applicantStyles.primaryButton} onClick={() => window.print()}>
                이력서 다운로드
              </Button>
            </>
          )}
        </section>

        <footer style={applicantStyles.footer}>
          <Button type="button" variant="secondary" style={applicantStyles.secondaryButton} onClick={goBack}>
            {stepIndex === 0 ? "메인으로" : "이전"}
          </Button>
          {currentStep.id === "resumeResult" ? (
            <Button
              type="button"
              style={applicantStyles.primaryButton}
              disabled={isSavingResume || resumeText === null}
              onClick={() => void saveResumeAndFinish()}
            >
              {isSavingResume ? "저장 중" : "이력서 저장하기"}
            </Button>
          ) : (
            <Button
              type="button"
              style={{
                ...applicantStyles.primaryButton,
                ...(!canGoNext ? applicantStyles.disabledButton : {})
              }}
              disabled={!canGoNext}
              onClick={handleNext}
            >
              {nextButtonText}
            </Button>
          )}
        </footer>
      </section>
    </main>
  );
}

function PhotoPanel({
  label,
  title,
  guide,
  inputId,
  image,
  onChange,
  onDelete
}: {
  label: string;
  title: string;
  guide: string;
  inputId: string;
  image: UploadedImage | null;
  onChange: (file: File | undefined) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <p style={applicantStyles.panelLabel}>{label}</p>
      <h2 style={applicantStyles.panelTitle}>{title}</h2>
      <p style={applicantStyles.panelText}>{guide}</p>
      <label htmlFor={inputId} style={applicantStyles.captureBox}>
        {image ? (
          <span style={applicantStyles.uploadDone}>사진이 올라갔습니다</span>
        ) : (
          "사진을 선택해주세요"
        )}
      </label>
      {image && <p style={applicantStyles.fileName}>{image.fileName}</p>}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(event) => {
          onChange(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
        style={applicantStyles.fileInput}
      />
      <label htmlFor={inputId} style={applicantStyles.secondaryButton}>
        {image ? "다시 선택" : "사진 선택"}
      </label>
      <PhotoList image={image} onDelete={onDelete} />
    </>
  );
}

function PreviewCard({
  title,
  image,
  onDelete
}: {
  title: string;
  image: UploadedImage | null;
  onDelete: () => void;
}) {
  return (
    <section style={applicantStyles.previewCard}>
      <h3 style={applicantStyles.jobTitle}>{title}</h3>
      {image ? (
        <>
          <div style={applicantStyles.smallPhotoSummary}>업로드 완료</div>
          <PhotoList image={image} onDelete={onDelete} />
        </>
      ) : (
        <p style={applicantStyles.panelText}>아직 선택하지 않았습니다.</p>
      )}
    </section>
  );
}

function PhotoList({
  image,
  onDelete
}: {
  image: UploadedImage | null;
  onDelete: () => void;
}) {
  if (!image) {
    return <p style={applicantStyles.emptyPhotoList}>올린 사진이 없습니다.</p>;
  }

  return (
    <div style={applicantStyles.photoList} aria-label="올린 사진 목록">
      <p style={applicantStyles.photoListTitle}>올린 사진 목록</p>
      <div style={applicantStyles.photoItem}>
        <span style={applicantStyles.fileName}>{image.fileName}</span>
        <Button type="button" variant="destructive" style={applicantStyles.deleteButton} onClick={onDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}

function QuestionField({
  field,
  label,
  placeholder,
  value,
  isRecording,
  onRecord,
  onChange
}: {
  field: keyof ResumeAiAnswers;
  label: string;
  placeholder: string;
  value: string;
  isRecording: boolean;
  onRecord: (field: keyof ResumeAiAnswers) => void;
  onChange: (value: string) => void;
}) {
  return (
    <Field style={applicantStyles.field}>
      <FieldLabel htmlFor={`${field}-answer`} style={applicantStyles.fieldLabel}>
        {label}
      </FieldLabel>
      <Button
        type="button"
        variant={isRecording ? "default" : "secondary"}
        style={isRecording ? applicantStyles.recordButtonOn : applicantStyles.recordButton}
        onClick={() => onRecord(field)}
      >
        {isRecording ? "녹음 멈추기" : "말로 답하기"}
      </Button>
      <Textarea
        id={`${field}-answer`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        style={applicantStyles.textarea}
      />
      <p style={isRecording ? applicantStyles.recordingOn : applicantStyles.recordingOff}>
        {isRecording ? "듣고 있습니다. 편하게 말씀해주세요." : "녹음 후 글자가 맞는지 확인해주세요."}
      </p>
    </Field>
  );
}

function ResumeRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={applicantStyles.resumeRow}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
function TalentMatches({ onBack }: { onBack: () => void }) {
  const [isNearbyMapOpen, setIsNearbyMapOpen] = useState(true);

  return (
    <main style={talentStyles.page}>
      <section style={talentStyles.shell} aria-labelledby="talent-title">
        <header style={talentStyles.header}>
          <div>
            <Button type="button" variant="ghost" style={talentStyles.backLink} onClick={onBack}>
              메인으로 돌아가기
            </Button>
            <p style={talentStyles.eyebrow}>자영업자 페이지</p>
            <h1 id="talent-title" style={talentStyles.title}>
              연결 가능한 지역 인재
            </h1>
            <p style={talentStyles.description}>
              가까운 지역에서 바로 일할 수 있는 분을 조건에 맞춰 추천합니다.
            </p>
          </div>
          <Button
            type="button"
            style={talentStyles.primaryButton}
            aria-expanded={isNearbyMapOpen}
            onClick={() => setIsNearbyMapOpen((current) => !current)}
          >
            {isNearbyMapOpen ? "목록만 보기" : "가까운 분 보기"}
          </Button>
        </header>

        {isNearbyMapOpen && (
          <section aria-label="가까운 인재 지도" style={talentStyles.mapPanel}>
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
              <strong>주변 인재 3명</strong>
              <span>필요 업무와 거리에 맞는 후보를 확인할 수 있습니다.</span>
            </aside>
          </section>
        )}

        <div style={talentStyles.filterRow} aria-label="추천 조건">
          {["남원읍 기준", "오전 근무", "주방/매장 업무", "기관 확인"].map((filter) => (
            <Button
              key={filter}
              type="button"
              variant="outline"
              size="xs"
              style={talentStyles.filterButton}
            >
              {filter}
            </Button>
          ))}
        </div>

        <section style={talentStyles.list} aria-label="추천 인재 목록">
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

              <Button type="button" style={talentStyles.requestButton}>
                연결 요청
              </Button>
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
            <Button type="button" variant="secondary" style={signupStyles.secondaryButton} onClick={onBack}>
              메인으로
            </Button>
            <Button
              type="button"
              style={signupStyles.primaryButton}
              onClick={() => {
                setForm(initialRecruiterForm);
                setCurrentStep("business");
                setIsSubmitted(false);
              }}
            >
              새 가입 신청 작성
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={signupStyles.page}>
      <section style={signupStyles.shell} aria-labelledby="signup-title">
        <div style={signupStyles.header}>
          <Button type="button" variant="ghost" style={signupStyles.backLink} onClick={onBack}>
            메인으로 돌아가기
          </Button>
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
              <Field style={{ ...signupStyles.field, ...signupStyles.fullWidthField }}>
                <FieldLabel htmlFor="recruiter-note" style={signupStyles.label}>
                  추가 요청 사항
                </FieldLabel>
                <Textarea
                  id="recruiter-note"
                  value={form.note}
                  placeholder="근무 시간, 필요한 인원, 우대 조건을 적어주세요."
                  onChange={(event) => updateField("note", event.target.value)}
                  style={{ ...signupStyles.input, ...signupStyles.textarea }}
                />
              </Field>
            </div>
          )}

          <div style={signupStyles.actions}>
            <Button type="button" variant="secondary" style={signupStyles.secondaryButton} onClick={goBack}>
              이전
            </Button>
            <Button
              type="submit"
              style={{
                ...signupStyles.primaryButton,
                ...(!isCurrentStepReady ? signupStyles.disabledButton : {})
              }}
              disabled={!isCurrentStepReady}
            >
              {currentStep === "hiring" ? "가입 신청 완료" : "다음"}
            </Button>
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
    <Field style={signupStyles.field}>
      <FieldLabel style={signupStyles.label}>{label}</FieldLabel>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={signupStyles.input}
      />
    </Field>
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
    color: "var(--primary)",
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
    minHeight: "112px",
    placeItems: "center",
    border: "2px dashed #b8c7d9",
    borderRadius: "8px",
    background: "#f8fbff",
    color: "#52606d",
    fontSize: "18px",
    fontWeight: 800
  },
  uploadDone: {
    display: "grid",
    width: "100%",
    minHeight: "84px",
    placeItems: "center",
    borderRadius: "8px",
    background: "#eef6ff",
    color: "#0f5fa8",
    fontSize: "20px",
    fontWeight: 900
  },
  smallPhotoSummary: {
    display: "grid",
    width: "100%",
    minHeight: "72px",
    placeItems: "center",
    borderRadius: "8px",
    background: "#eef6ff",
    color: "#0f5fa8",
    fontSize: "18px",
    fontWeight: 900
  },
  photoList: {
    display: "grid",
    gap: "8px",
    padding: "12px",
    border: "1px solid #d8e1ec",
    borderRadius: "8px",
    background: "#ffffff"
  },
  photoListTitle: {
    margin: 0,
    color: "#102a43",
    fontSize: "17px",
    fontWeight: 900
  },
  photoItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap"
  },
  emptyPhotoList: {
    margin: 0,
    padding: "12px",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#52606d",
    fontSize: "16px",
    fontWeight: 800
  },
  deleteButton: {
    minHeight: "42px",
    border: "1px solid var(--destructive)",
    borderRadius: "8px",
    padding: "10px 16px",
    background: "var(--background)",
    color: "var(--destructive)",
    fontSize: "16px",
    fontWeight: 900,
    cursor: "pointer"
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
    border: "1px solid var(--primary)",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryButton: {
    minHeight: "48px",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "var(--secondary)",
    color: "var(--secondary-foreground)",
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
    color: "var(--primary)",
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
    background: "var(--primary)",
    color: "var(--primary-foreground)",
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
    border: "1px solid var(--border)",
    borderRadius: "6px",
    background: "var(--background)",
    color: "var(--foreground)",
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
    border: "1px solid var(--primary)",
    borderRadius: "8px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
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
    color: "var(--primary)",
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
    color: "var(--foreground)",
    fontSize: "18px",
    fontWeight: 800
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "58px",
    padding: "14px 16px",
    border: "1px solid var(--input)",
    borderRadius: "8px",
    color: "var(--foreground)",
    background: "var(--background)",
    font: "inherit",
    fontSize: "18px",
    outlineColor: "var(--ring)"
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
    color: "var(--primary-foreground)",
    background: "var(--primary)",
    fontSize: "18px",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryButton: {
    minHeight: "58px",
    minWidth: "112px",
    padding: "0 22px",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--secondary-foreground)",
    background: "var(--secondary)",
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



