# Liberaflow Release Guide

Liberaflow 설치 파일은 Cloudflare R2의 `downloads.liberaflow.com`에서 배포합니다. macOS와 Windows는 서로 다른 버전으로 출시할 수 있으므로 각 플랫폼의 URL과 appcast 항목을 독립적으로 갱신합니다.

`release.sh`는 더 이상 파일 복사, GitHub Release 생성, 커밋 또는 푸시를 자동으로 수행하지 않습니다. 운영 저장소를 예고 없이 변경하지 않도록, 준비한 릴리스 메타데이터의 일관성만 검사합니다.

## 1. 설치 파일 준비

앱 빌드와 서명 절차에서 최종 설치 파일과 업데이트 서명을 준비합니다.

- macOS 파일명: `Liberaflow-<version>-macos.dmg`
- Windows 파일명: `Liberaflow_<version>_Setup.exe`
- macOS appcast 서명: `sparkle:edSignature`
- Windows appcast 서명: `sparkle:dsaSignature`

서명 문자열을 재사용하거나 임의로 만들지 말고, 해당 설치 파일을 생성한 릴리스 파이프라인의 결과를 사용합니다.

## 2. Cloudflare R2 업로드

`liberaflow-downloads` 버킷에 설치 파일을 업로드한 뒤 공개 URL이 정확한 파일을 반환하는지 확인합니다.

```sh
curl -fsSIL "https://downloads.liberaflow.com/Liberaflow_1.4.8_Setup.exe"
```

로컬 파일 크기와 응답의 `Content-Length`도 일치해야 합니다.

```sh
wc -c < "/path/to/Liberaflow_1.4.8_Setup.exe"
curl -fsSIL "https://downloads.liberaflow.com/Liberaflow_1.4.8_Setup.exe"
```

## 3. 저장소 메타데이터 갱신

출시한 플랫폼에 해당하는 값만 변경합니다.

1. `assets/js/download-config.js`의 플랫폼 URL
2. `index.html`의 JavaScript 미사용용 직접 다운로드 URL
3. `docs.html`의 JavaScript 미사용용 직접 다운로드 URL
4. `updates/appcast.xml`의 해당 플랫폼 `<item>`

appcast 항목에서는 다음 값을 함께 갱신합니다.

- `<title>`과 Sparkle 버전
- RFC 822 형식의 UTC `pubDate`
- R2 `url`
- 설치 파일의 바이트 단위 `length`
- 설치 파일과 짝이 맞는 업데이트 서명
- 플랫폼별 `sparkle:os`

UTC 시각은 다음 명령으로 만들 수 있습니다.

```sh
LC_ALL=C date -u '+%a, %d %b %Y %H:%M:%S +0000'
```

## 4. 로컬 검사

먼저 네트워크 없이 파일 간 일관성과 문법을 검사합니다.

```sh
./release.sh --check
```

그다음 R2의 두 현재 다운로드 URL이 응답하는지도 확인합니다.

```sh
./release.sh --check --remote
```

검사기는 다음을 확인합니다.

- 중앙 설정, 홈, 가이드, appcast의 URL 일치
- R2 HTTPS URL과 파일명 규칙
- 모든 JavaScript 파일의 문법
- appcast XML 문법
- appcast 제목·버전·날짜·플랫폼·파일 유형·길이·서명 필드의 기본 형식과 URL 버전 일치
- `--remote` 사용 시 실제 다운로드 URL의 HEAD 응답과 `Content-Length` 일치

`--remote`는 appcast의 `length`와 R2 응답 크기까지 검사합니다. 서명 필드의 존재와 Base64 형식은 확인하지만 설치 파일에 대한 암호학적 서명 검증은 하지 않으므로, 앱 빌드·서명 파이프라인의 결과와 별도로 대조해야 합니다.

## 5. 검토와 배포

자동 커밋이나 푸시는 하지 않습니다. 변경 내용을 직접 검토한 뒤 저장소 정책에 맞는 작성자 정보와 메시지로 커밋하고 `main` 반영 절차를 진행합니다.

```sh
git diff --check
git diff -- assets/js/download-config.js index.html docs.html updates/appcast.xml
```

배포 뒤에는 JavaScript를 켠 상태와 끈 상태에서 macOS·Windows 버튼을 각각 확인하고, 앱의 업데이트 확인도 실제 설치본으로 검증합니다.

## 문제 해결

- `release.sh --check`가 직접 링크 불일치를 보고하면 `index.html`과 `docs.html`의 fallback URL을 중앙 설정과 맞춥니다.
- appcast URL 불일치는 `assets/js/download-config.js`와 해당 `<item>` 중 어느 쪽이 현재 배포본인지 R2에서 먼저 확인한 뒤 수정합니다.
- 원격 검사가 404를 반환하면 저장소를 배포하기 전에 R2 객체 이름과 공개 도메인 연결을 고칩니다.
- 설치 파일은 Git 저장소에 추가하지 않습니다. 저장소의 `.gitignore`가 `downloads/`와 Liberaflow 설치 파일 이름을 차단합니다.
