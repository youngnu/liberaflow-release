# Liberaflow website & releases

[Liberaflow](https://liberaflow.com)의 제품 소개 사이트와 데스크톱 앱 배포 리소스입니다.

## 사이트 구조

- `index.html` — 제품 소개, 세 가지 작업 흐름 데모, 노트 그래프, 로컬/동기화 비교, FAQ, 다운로드
- `docs.html` — 설치·보관함·AI·자동화·협업·데이터 시작 가이드
- `assets/css/site.css` — 공통 디자인과 반응형 레이아웃
- `assets/js/site.js` — 데모와 메뉴·모달·비교 컨트롤
- `features/*.html` — 기존 기능 소개 주소를 새 홈의 해당 섹션으로 연결하는 호환 페이지

HTML/CSS/JavaScript만 사용하는 정적 사이트입니다. 빌드나 npm 설치 없이 기존 GitHub Pages 환경에서 제공됩니다. 상대 경로를 사용해 `liberaflow.com`과 `youngnu.github.io/liberaflow-release/`에서 모두 동작합니다.

로컬 미리보기:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:4173/`를 여세요. 각 데모의 실행, 중간 탭 전환, 재시작, 키보드 방향키 탐색과 모바일 메뉴를 확인할 수 있습니다. 모션 감소 설정에서는 데모 결과를 즉시 표시합니다. 데모는 고정 예시 데이터로만 작동하며 AI 호출이나 사용자 자료 전송을 하지 않습니다. JavaScript가 없어도 소개·가이드·직접 다운로드 링크는 이용할 수 있습니다.

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

다운로드 버튼은 `macosBtn` / `windowsBtn` ID, `macOS` / `Windows` 텍스트, 실제 `.dmg` / `Setup.exe` href를 함께 유지합니다. 기존 다운로드 스크립트와 릴리스 스크립트의 탐지 조건입니다. 다른 목적의 링크에 운영체제 이름을 포함하면 다운로드 주소로 바뀔 수 있으므로 주의하세요. 릴리스 시 중앙 설정과 HTML의 JavaScript 미사용용 직접 링크도 함께 갱신하세요.

기존 홈의 `#features`, `#vision` 앵커는 각각 새 기능 소개와 데이터 소유권 섹션에 연결됩니다. `#download`, `#faq` 주소도 유지됩니다.

제품 설명은 인접 앱 저장소의 `README.md`와 `ARCHITECTURE.md`를 기준으로 작성했습니다. 공식 다운로드 지원은 Windows 11 이상과 macOS 15 이상 Apple Silicon입니다. 앱·모델 제공자의 계정과 과금은 서로 구분합니다.
