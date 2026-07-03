type TalentProfile = {
  id: string;
  displayName: string;
  ageRange: string;
  homeRegion: string;
  preferredWorkRegions: string[];
  availableWorkTypes: string[];
  careerSummary: string;
  availableSchedule: string;
  distanceText: string;
  verificationStatus: "confirmed" | "pending";
  connectionStatus: "available" | "proposed";
  matchReason: string;
};

const talentProfiles: TalentProfile[] = [
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
    matchReason: "오전 근무 가능 시간이 맞고 가까운 지역을 희망합니다."
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
    matchReason: "고객 응대 경험이 있고 주 3일 근무 조건에 맞습니다."
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
    matchReason: "주말 단기 근무 후보로 확인 중입니다."
  }
];

export default function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f4f7fb",
        color: "#17202a",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <div
        style={{
          width: "min(100%, 980px)",
          margin: "0 auto"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "flex-start",
            marginBottom: "24px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#1f6fb2",
                fontSize: "15px",
                fontWeight: 700
              }}
            >
              자영업자 페이지
            </p>
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "32px",
                lineHeight: 1.25,
                color: "#10233f"
              }}
            >
              연결 가능한 지역 인재
            </h1>
            <p
              style={{
                margin: 0,
                color: "#52606d",
                fontSize: "18px",
                lineHeight: 1.55
              }}
            >
              가까운 지역에서 바로 일할 수 있는 시니어 구직자를 조건에 맞춰 추천합니다.
            </p>
          </div>
          <button
            style={{
              border: 0,
              borderRadius: "8px",
              background: "#1266b0",
              color: "#ffffff",
              padding: "14px 18px",
              fontSize: "17px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            가까운 구직자 보기
          </button>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginBottom: "20px"
          }}
        >
          {["남원읍 기준", "오전 근무", "주방/매장 업무", "기관 확인"].map(
            (filter) => (
              <button
                key={filter}
                style={{
                  minHeight: "48px",
                  border: "1px solid #c9d7e8",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#20344d",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {filter}
              </button>
            )
          )}
        </section>

        <section
          style={{
            display: "grid",
            gap: "14px"
          }}
        >
          {talentProfiles.map((profile) => (
            <article
              key={profile.id}
              style={{
                border: "1px solid #d7e0ea",
                borderRadius: "8px",
                background: "#ffffff",
                padding: "22px",
                display: "grid",
                gap: "18px",
                gridTemplateColumns: "minmax(0, 1fr) auto"
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "10px"
                  }}
                >
                  <span
                    style={{
                      color: "#0f4f8d",
                      background: "#e8f2fc",
                      borderRadius: "999px",
                      padding: "6px 10px",
                      fontSize: "14px",
                      fontWeight: 700
                    }}
                  >
                    {profile.distanceText}
                  </span>
                  <span
                    style={{
                      color:
                        profile.verificationStatus === "confirmed"
                          ? "#18794e"
                          : "#8a5a00",
                      background:
                        profile.verificationStatus === "confirmed"
                          ? "#e8f7ef"
                          : "#fff4d6",
                      borderRadius: "999px",
                      padding: "6px 10px",
                      fontSize: "14px",
                      fontWeight: 700
                    }}
                  >
                    {profile.verificationStatus === "confirmed"
                      ? "주민센터 확인"
                      : "기관 확인 중"}
                  </span>
                </div>
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "24px",
                    color: "#10233f"
                  }}
                >
                  {profile.displayName} · {profile.ageRange} · {profile.homeRegion}
                </h2>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#52606d",
                    fontSize: "17px",
                    lineHeight: 1.55
                  }}
                >
                  {profile.matchReason}
                </p>
                <dl
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px minmax(0, 1fr)",
                    gap: "8px 12px",
                    margin: 0,
                    fontSize: "16px",
                    lineHeight: 1.5
                  }}
                >
                  <dt style={{ color: "#6b7785", fontWeight: 700 }}>가능 업무</dt>
                  <dd style={{ margin: 0 }}>{profile.availableWorkTypes.join(", ")}</dd>
                  <dt style={{ color: "#6b7785", fontWeight: 700 }}>경력</dt>
                  <dd style={{ margin: 0 }}>{profile.careerSummary}</dd>
                  <dt style={{ color: "#6b7785", fontWeight: 700 }}>가능 시간</dt>
                  <dd style={{ margin: 0 }}>{profile.availableSchedule}</dd>
                  <dt style={{ color: "#6b7785", fontWeight: 700 }}>희망 지역</dt>
                  <dd style={{ margin: 0 }}>
                    {profile.preferredWorkRegions.join(", ")}
                  </dd>
                </dl>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  minWidth: "150px"
                }}
              >
                <span
                  style={{
                    color:
                      profile.connectionStatus === "available"
                        ? "#18794e"
                        : "#52606d",
                    fontSize: "15px",
                    fontWeight: 700,
                    textAlign: "right"
                  }}
                >
                  {profile.connectionStatus === "available"
                    ? "연결 가능"
                    : "연결 제안됨"}
                </span>
                <button
                  style={{
                    border: "1px solid #1266b0",
                    borderRadius: "8px",
                    background:
                      profile.connectionStatus === "available"
                        ? "#1266b0"
                        : "#ffffff",
                    color:
                      profile.connectionStatus === "available"
                        ? "#ffffff"
                        : "#1266b0",
                    padding: "13px 16px",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  연결 요청
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
