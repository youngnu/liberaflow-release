# Liberaflow website & releases

[Liberaflow](https://liberaflow.com)의 제품 소개 사이트와 데스크톱 앱 배포 리소스입니다.

## 사이트 구조

- `index.html` — 한국어·영어 제품 소개: 핵심 메시지, 노트 & AI·반복 업무·협업의 세 가지 미리보기, 기능 소개, 로컬 데이터, FAQ, 다운로드
- `docs.html` — KO/EN 사용 가이드: 작업별 빠른 찾기, 설치·보관함·노트·지원 문서·편집 단축키·AI·자동화·협업·Calendar·저장과 동기화, 섹션별 실제 사용 순서
- `assets/css/site.css` — 사용 가이드와 기존 기능 연결 페이지의 공통 디자인
- `assets/css/home.css` — 홈 전용 레이아웃·내비게이션·브랜드 블루 시각 효과·반응형·동작 줄이기 설정
- `assets/css/navigation.css` — 사용 가이드의 상단 메뉴·KO/EN 선택·모바일 메뉴 디자인
- `assets/css/guide.css` — 가이드의 브랜드 블루, 문서 카드·단축키 표·목차·안내 박스와 반응형 레이아웃
- `assets/js/site.js` — 가이드의 기존 공통 메뉴 동작 (보존)
- `assets/js/guide.js` — 읽는 위치에 맞춘 가이드 목차 표시
- `assets/js/locale.js` — 홈·가이드 공통 언어 전환과 페이지 간 언어 유지
- `assets/js/guide-i18n.js` — 가이드 본문·단축키·문서 안내·접근성·메타데이터 번역
- `assets/js/home.js` — 홈의 모바일 메뉴·키보드 탭 탐색·미리보기 전환·기존 AI 앵커 연결
- `assets/js/home-i18n.js` — 홈 본문·접근성·메타데이터·동적 데모 번역
- `features/*.html` — 기존 기능 소개 주소를 새 홈의 해당 섹션으로 연결하는 호환 페이지

HTML/CSS/JavaScript만 사용하는 정적 사이트입니다. 빌드나 npm 설치 없이 기존 GitHub Pages 환경에서 제공됩니다. 상대 경로를 사용해 `liberaflow.com`과 `youngnu.github.io/liberaflow-release/`에서 모두 동작합니다.

로컬 미리보기:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:4173/`를 여세요. 노트 & AI, 반복 업무, 함께하는 일 탭으로 제품 예시를 살펴봅니다. 탭은 클릭 또는 방향키·Home·End로 전환하며 자동으로 바뀌지 않습니다. Calendar는 기능 소개 아래에서 간결하게 안내하고 실제 사용 순서는 `docs.html`로 연결합니다. 예시는 AI 호출·브라우저 실행·사용자 자료 전송 없이 바로 표시됩니다. JavaScript가 없어도 한국어 노트 예시·사용 가이드·직접 다운로드 링크를 이용할 수 있습니다.

언어별 직접 미리보기는 `http://127.0.0.1:4173/?lang=ko`와 `http://127.0.0.1:4173/?lang=en`입니다. 주소의 언어 설정을 우선하고, 선택한 언어는 브라우저에 저장합니다. 아무 설정이 없으면 한국어로 시작합니다. JavaScript가 꺼져 있으면 한국어 본문과 다운로드를 제공합니다. 가이드는 `http://127.0.0.1:4173/docs.html?lang=ko`와 `http://127.0.0.1:4173/docs.html?lang=en`으로 확인합니다. 홈과 가이드 사이를 이동해도 언어를 유지합니다.

## 브랜드와 수정 경계

앱 저장소 `window_automation/assets/icon/Liberaflow_logo.png`와 같은 원본 로고를 그대로 사용합니다. 홈은 로고의 블루를 중심으로 네이비·차가운 흰색, 큰 제목과 SVG 흐름선을 조합합니다. 시각 효과는 `prefers-reduced-motion` 설정을 따릅니다. 기능 설명은 짧게 유지하고 상세 절차는 사용 가이드로 연결합니다.

홈은 `home.css` 하나로 디자인하며 `site.css`·`navigation.css`의 기존 가이드 스타일에 의존하지 않습니다. 언어 전환 동작은 `locale.js`로 공유합니다. 개편한 CSS·JavaScript URL에는 버전 쿼리를 붙여 이전 자산 캐시와 새 HTML이 섞이지 않게 합니다. 사용 가이드의 디자인과 동작은 별도로 유지합니다. 홈·브랜드 개편에서는 `updates/appcast.xml`, `email-confirmation.html`, `reset-password.html`과 원본 로고를 수정하지 않습니다. 릴리스 또는 인증 보안 변경은 별도 작업으로 분리하고 실제 업데이트·Supabase 복귀 흐름까지 검증합니다.

사용 안내는 앱 저장소의 `README.md`와 `ARCHITECTURE.md`를 기준으로 합니다. 본문이나 데모의 한국어를 바꿀 때는 해당 페이지의 `home-i18n.js` 또는 `guide-i18n.js` 번역도 함께 갱신하세요. 언어를 바꿔도 선택한 미리보기 탭과 펼친 FAQ 상태는 유지됩니다.

## 사용 예시의 기준

홈의 예시는 실제 앱 화면 캡처가 아니라 제품의 기능을 재구성한 미리보기입니다. 예시 표시를 유지하고 실제 실행·성과 수치로 오해할 진행률이나 데이터를 만들지 않습니다.

- 노트 & AI: 워크숍 노트에서 제안서 초안을 만드는 예시입니다. 모델 연결은 FAQ와 AI 사용 가이드에서 안내하며, 파일 생성과 팀 공유를 구분합니다.
- 반복 업무: 페이지 열기 → 데이터 뽑기 → 파일 내보내기의 개념을 보여 줍니다. 실제 추출 결과는 앱 안의 표가 아니라 CSV·XLSX 파일로 확인합니다. 녹화·반복 실행과 데이터 추출은 각각 가능한 기능이며, 자세한 조작은 자동화 가이드로 연결합니다.
- 함께하는 일: 공유한 문서를 AI 팀원 한 명에게 검토시키는 예시입니다. 호출 결과를 자동 공유나 여러 AI의 동시 실행으로 확대하지 않습니다.
- 일정: 캘린더·할 일·간트·바탕화면 위젯을 소개합니다. 개인 일정은 로그인 없이 시작하고 팀 공유에는 로그인이 필요합니다.

기준 문서: 앱 `README.md`의 **개인 지식 관리**, **노트 옆 AI 에이전트**, **Channel**, **에이전트 허브**, **일정 · 프로젝트 · 할 일**과 `ARCHITECTURE.md`의 **1. Notes**, **4. Calendar**, **10-1**, **10-3**, **실행 결과의 표면**.

확인: KO/EN × 데스크톱·태블릿·모바일 × 미리보기 3종, 가로 넘침, 번역 누락, 방향키 탭 이동, 모바일 메뉴/Escape, FAQ, 언어 변경 후 선택 상태, 홈↔가이드 언어 유지, JavaScript 미사용, 동작 줄이기, 기존 앵커와 직접 다운로드 링크. 저장소의 검사 명령은 `./release.sh --check`입니다.

## 배포·인증 리소스

디자인 변경 시 다음의 주소와 기존 동작을 보존하세요.

- `updates/appcast.xml` — 앱 자동 업데이트 피드와 서명
- `assets/js/download-config.js` — 다운로드 URL의 중앙 설정
- `reset-password.html`, `email-confirmation.html` — 인증 이메일의 복귀 경로
- `CNAME` — 기존 도메인
- `privacy/browser-automation/` — 확장 프로그램 개인정보처리방침
- `naverbc95ad0893d4f5b76c2c91972731d8bb.html`, `robots.txt` — 사이트 인증과 크롤러 정책
- `extension-test.html`, `extract-test.html` — 브라우저 확장 진단 페이지
- `release.sh`, `RELEASE_GUIDE.md`, `HOSTING_MIGRATION_GUIDE.md` — 기존 릴리스 운영 자료

다운로드 버튼의 `macosBtn` / `windowsBtn` ID는 중앙 설정을 적용하는 안정적인 연결 계약이므로 유지합니다. 릴리스 시 `assets/js/download-config.js`의 중앙 설정과 HTML의 JavaScript 미사용용 직접 링크를 함께 갱신하고, `release.sh --check`로 두 값과 appcast 메타데이터의 일치를 검사하세요.

비밀번호 재설정 페이지는 `token_hash`와 `type=recovery`를 사용하는 Recovery 이메일 템플릿 또는 `type=recovery`가 포함된 implicit 토큰만 처리합니다. 데스크톱 앱에서 시작한 PKCE 코드의 verifier는 브라우저에 없으므로 `?code=`를 웹에서 교환하지 않습니다. Supabase Recovery 템플릿과 실제 이메일 링크를 함께 설정·검증하세요.

기존 홈의 `#features`, `#vision` 앵커는 각각 새 기능 소개와 데이터 소유권 섹션에 연결됩니다. `#download`, `#faq` 주소도 유지됩니다.

제품 설명은 인접 앱 저장소의 `README.md`와 `ARCHITECTURE.md`를 기준으로 작성했습니다. 공식 다운로드 지원은 Windows 11 이상과 macOS 15 이상 Apple Silicon입니다. 앱·모델 제공자의 계정과 과금은 서로 구분합니다.

## 가이드 내용 검증 기준

- 편집 단축키는 `note_screen.dart`와 앱에 포함된 `flutter_quill` 키 등록·동작을 확인합니다. 주 노트 편집기, 찾기 입력창, 표 셀의 조건을 구분합니다. 하이라이트는 범위 선택이 필요하고, 저장 단축키나 충돌하는 키는 추정해 추가하지 않습니다.
- 지원 문서는 `note_screen.dart`, `office_preview_service.dart`, `html_file_viewer.dart`, `pdf_viewer.dart`, `image_file_viewer.dart`를 확인합니다. 노트·캔버스·로컬 HTML 직접 편집, Office 원본 AI 편집, PDF·이미지·CSV/TSV 열람 범위를 구분합니다. 영어 명령은 `agent_slash_command.dart`의 실제 별칭을 사용합니다.
- 브라우저 화면 캡처 설정은 현재 확장 팝업 기준으로 설명합니다. README의 과거 기본값보다 실제 구현을 우선합니다. 놓친 예약의 24시간 조건, 클라우드 노트·캔버스의 30일 복구 조건을 명시합니다. 보관함 전체 파일 자동 동기화로 과장하지 않습니다.
- 확인: KO/EN 전체 본문과 접근성 이름, 홈↔가이드 언어 유지, 각 페이지의 상단 메뉴와 반응형 배치, 목차 이동, 모바일에서 양쪽 운영체제 단축키 표시, 펼친 안내 상태 유지, JavaScript 미사용 시 한국어 본문·다운로드.

가이드의 기호 입력 서식은 접지 않고 입력 순서·변환 결과·체크 목록 작성 예시를 함께 제공합니다. `[]`는 공백 없는 입력이며, 제목 아래 빈 본문 줄에서 시작합니다. AI 대화 명령 표에는 `@` 문서·폴더 참조를 포함합니다. 브라우저의 `⋮ → 가이드 문서 만들기 (md)`는 현재 기능이고, 저장한 브라우저 워크플로를 AI 스킬로 호출하는 연결은 **개발 예정**으로 구분합니다. AI 호출과 데이터 전송을 줄일 수 있는 구조를 설명하되, 가이드 생성·AI 작업·자가치유의 전송 범위를 별도로 명시합니다.

추가 사용 안내는 ARCH의 Notes·Settings·Agent Hub·Channels·Spaces·Calendar 절과 해당 UI 코드를 대조합니다. 자료 가져오기와 정리, 검색 필터, 분할 보기, 제목 링크, Office 부분 수정, 스킬 생성, 워크플로 저장·이동·단계 수정·실행 점검, 공유 노트 수정 제안, 채널 메모, 지식 공간, 일정 상세, 바탕화면 위젯, 예약 관리, 협업 알림, 저장 상태와 복구를 설명합니다.

사용 조건도 실제 동작과 함께 유지하세요. 로그인 후 타인이 공유한 클라우드 노트에 수정안을 제안할 수 있으며, 내 보관함의 동기화를 켤 필요는 없습니다. 위젯의 핀은 다음 앱 실행 시 자동 복원을 뜻합니다. 일반 AI 스킬의 현재 기능과 브라우저 워크플로를 AI 스킬로 호출하는 예정 기능은 구분합니다. 작업별 빠른 찾기와 각 섹션의 바로가기는 기존 10개 목차·기존 앵커를 유지하면서 하위 안내로 연결합니다.
