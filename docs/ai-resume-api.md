# AI 이력서 API 규격

AI 이력서 생성 기능의 서버 요청/응답 기준을 정리합니다.

## 목적

- 프론트에서 AI API 키를 직접 사용하지 않게 합니다.
- 실제 AI 연결 전 mock 응답으로 화면 흐름을 먼저 확인합니다.
- 이후 Firebase Functions 또는 별도 서버로 옮겨도 요청/응답 형태가 흔들리지 않게 합니다.

## 기본 원칙

- 프론트는 `/api/resume-draft`로만 요청합니다.
- AI API 키는 서버 환경변수에만 둡니다.
- 브라우저 코드에는 AI API 키, 모델 키, 관리자 키를 넣지 않습니다.
- 현재 단계에서는 저장 기능을 넣지 않습니다.
- 사진 파일 원본은 현재 서버로 보내지 않고, 사진 선택 여부와 파일명만 보냅니다.

## 엔드포인트

- Method: `POST`
- Path: `/api/resume-draft`
- Content-Type: `application/json`

## 요청 형식

프론트의 `buildResumeAiRequest` 결과를 그대로 보냅니다.

- `version`: 요청 형식 버전. 현재 `resume-draft-v1`
- `language`: 현재 `ko`
- `targetReader`: 쉬운 문장 대상. 현재 `easy-senior`
- `photos.face.provided`: 얼굴 사진 선택 여부
- `photos.face.fileName`: 얼굴 사진 파일명
- `photos.identity.provided`: 본인 확인 사진 선택 여부
- `photos.identity.fileName`: 본인 확인 사진 파일명
- `answers.wantedJob`: 하고 싶은 일
- `answers.experience`: 전에 해본 일
- `answers.strength`: 잘하는 점
- `answers.workTime`: 일할 수 있는 시간
- `answers.workArea`: 일하고 싶은 지역
- `output.format`: 현재 `resume-preview`
- `output.tone`: 현재 `clear-and-friendly`

## 응답 형식

서버는 화면에 바로 표시할 수 있는 문장 묶음을 반환합니다.

- `resumeText.wantedJob`: 희망하는 일 문장
- `resumeText.experience`: 해본 일 문장
- `resumeText.strength`: 잘하는 점 문장
- `resumeText.workTime`: 일할 수 있는 시간 문장
- `resumeText.workArea`: 희망 지역 문장

## 오류 응답

- `400`: 요청값이 부족하거나 형식이 맞지 않음
- `500`: 서버 또는 AI 처리 실패

오류 문구는 프론트에서 바로 보여줄 수 있게 짧게 내려줍니다.

## 구현 방식 비교

### Firebase Functions

장점:
- Firebase Hosting과 붙이기 쉽습니다.
- API 키를 Functions 환경변수로 숨길 수 있습니다.
- 나중에 Firestore, Storage를 다시 켤 때 같은 Firebase 안에서 관리하기 쉽습니다.

단점:
- Functions 사용 설정과 권한이 필요합니다.
- 로컬 테스트 환경 설정이 별도입니다.

추천도:
- 이 프로젝트는 Firebase Hosting을 이미 쓰므로 우선 추천합니다.

### 별도 서버

장점:
- Express, Fastify 등으로 빠르게 만들 수 있습니다.
- 로컬 mock 서버 테스트가 쉽습니다.
- Firebase 권한 문제가 있을 때 우회가 쉽습니다.

단점:
- 배포 서버를 따로 관리해야 합니다.
- Hosting과 API 도메인/CORS 설정을 추가로 봐야 합니다.

추천도:
- Firebase Functions 권한이나 결제 설정이 막힐 때 대안으로 사용합니다.

## 현재 결정

- 1순위: Firebase Functions
- 2순위: 별도 서버
- 실제 AI 호출 전에는 mock 응답으로 프론트 연결을 먼저 확인합니다.

## 다음 구현 단계

1. `/api/resume-draft` mock 응답 함수 만들기
2. 프론트의 `requestResumeDraft`를 이력서 만들기 버튼에 연결
3. mock 응답을 이력서 미리보기 화면에 표시
4. 로딩, 실패 메시지 확인
5. 실제 AI API 호출은 mock 연결 확인 후 진행

## 변경 이력

- 2026-07-08: AI 이력서 생성 API 요청/응답 규격과 구현 방식 비교 추가
