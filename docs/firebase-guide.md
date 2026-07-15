# Firebase 가이드

Firebase 연결, 환경변수, 데이터 저장, 배포 기준을 정리하는 문서입니다.

## 목적

- Firebase 사용 범위를 명확히 합니다.
- 환경변수와 배포 설정을 안전하게 관리합니다.

## 기본값

### 사용 범위

- 지금 당장은 Hosting(배포)만 사용합니다.
- 다만 추후 Functions 등 다른 Firebase 기능을 붙일 예정이므로, 지금부터 Firebase 설정을 기능별로 라우팅 가능한 구조로 유지합니다. 당장 안 쓰는 기능도 구조만 열어 둡니다.
- Firestore, Storage는 필요해지는 시점에 같은 구조 위에 추가합니다.

### 환경변수

- Firebase 설정값은 `.env`에 저장합니다.
- `.env`는 Git에 올리지 않습니다.
- 공유용 파일은 `.env.example`만 사용합니다.
- 온보딩 0단계에서 Firebase Web SDK 설정값을 받으면 AI가 `.env`에 저장합니다.
- SDK 값 자체는 README, 온보딩 문서, PRD에 적지 않습니다.
- 현재 필요한 환경변수는 다음과 같습니다.
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`

### Firebase 연결

- Firebase 초기화 코드는 `src/lib/firebase.ts`에서 관리합니다.
- 환경변수가 없을 때 앱이 바로 깨지지 않도록 처리합니다.
- 데이터 구조는 `docs/data-guide.md` 결정 후 Firebase에 반영합니다.
- 화면 컴포넌트에서 Firebase를 직접 많이 호출하지 않도록 합니다.

### Hosting

- 빌드 결과물은 `dist`를 사용합니다.
- Firebase Hosting 설정은 `firebase.json`에서 관리합니다.
- 배포 전 `docker compose run --rm web npm run build`를 먼저 확인합니다.

### 보안

- Firebase 콘솔 권한은 필요한 사람에게만 부여합니다.
- 보안 규칙은 임시 허용 상태로 오래 두지 않습니다.
- 실제 사용자 데이터가 들어가기 전 Firestore 규칙을 검토합니다.

## 논의할 항목

- Firebase 프로젝트 생성 담당자
- Firebase 콘솔 접근 권한
- Firestore 사용 여부
- Storage 사용 여부
- Hosting 배포 담당자
- 개발용과 배포용 프로젝트를 나눌지
- 보안 규칙 검토 시점

## 최종 결정

- Firebase 프로젝트 담당: 팀장 (기본값, 따로 나누고 싶을 때만 팀이 변경)
- 콘솔 접근 권한: 팀장 (필요 시 팀 논의로 확대)
- Firestore 사용 여부: 필요 시 사용
- Storage 사용 여부: 필요 시 사용
- Hosting 사용 여부: 사용 (지금은 Hosting 중심)
- 기능 확장 기준: 추후 Functions 등 추가 예정, 기능별 라우팅 구조를 처음부터 유지
- 배포 담당: 팀장
- 보안 규칙 기준: 실제 사용자 데이터가 들어가기 전 Firestore 규칙 검토

## 변경 이력

- 2026-05-29: Firebase 데이터/배포 중심 사용 기준 반영
- 2026-05-29: 기본 Firebase 사용 기준을 최종 결정에 반영
- 2026-06-01: 지금은 Hosting 중심, 추후 Functions 확장을 위한 기능별 라우팅 구조 유지 기준 추가, 배포 담당 팀장으로 확정
- 2026-07-14: 배포 전 빌드 확인 명령을 Docker Compose와 npm 기준으로 변경
