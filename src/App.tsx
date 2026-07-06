import { useState } from "react";

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
  const [selectedJobId, setSelectedJobId] = useState<LocalJob["id"]>(localJobs[0].id);
  const selectedJob = localJobs.find((job) => job.id === selectedJobId) ?? localJobs[0];

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
            <button className="action-card" key={action.label} type="button">
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
