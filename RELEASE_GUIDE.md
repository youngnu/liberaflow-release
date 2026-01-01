# Liberaflow Release Guide

이 가이드는 Liberaflow의 새 버전을 릴리스하는 방법을 설명합니다.

## 배경

- **문제**: GitHub Pages는 Git LFS를 지원하지 않아 100MB 이상 파일 배포 불가
- **해결**: GitHub Releases를 사용하여 대용량 바이너리 파일 배포

## 새 버전 릴리스 방법

### 1. 자동화 스크립트 사용 (권장)

```bash
./release.sh <버전> <macOS_파일_경로> <Windows_파일_경로>
```

**예시:**
```bash
./release.sh 1.3.0 ~/Desktop/Liberaflow-1.3.0-macos.dmg ~/Desktop/Liberaflow_1.3.0_Setup.exe
```

스크립트가 자동으로:
1. 파일을 downloads 폴더로 복사
2. download-config.js 업데이트
3. Git 커밋 및 푸시
4. GitHub Release 생성

### 2. 수동 릴리스 (세밀한 제어가 필요한 경우)

#### Step 1: 파일 준비
```bash
# downloads 폴더에 새 파일 복사
cp ~/Desktop/Liberaflow-1.3.0-macos.dmg downloads/
cp ~/Desktop/Liberaflow_1.3.0_Setup.exe downloads/
```

#### Step 2: download-config.js 업데이트
```javascript
const DOWNLOAD_LINKS = {
    macos: 'https://github.com/youngnu/liberaflow-release/releases/download/v1.3.0/Liberaflow-1.3.0-macos.dmg',
    windows: 'https://github.com/youngnu/liberaflow-release/releases/download/v1.3.0/Liberaflow_1.3.0_Setup.exe'
};
```

#### Step 3: Git 커밋 및 푸시
```bash
git add download-config.js
git commit -m "Update download links to v1.3.0"
git push origin main
```

#### Step 4: GitHub Release 생성
```bash
gh release create v1.3.0 \
  downloads/Liberaflow-1.3.0-macos.dmg \
  downloads/Liberaflow_1.3.0_Setup.exe \
  --title "Version 1.3.0" \
  --notes "Release notes here"
```

#### Step 5: appcast.xml 업데이트 (Sparkle 자동 업데이트용)

[updates/appcast.xml](updates/appcast.xml)를 수동으로 편집:

```xml
<item>
    <title>Version 1.3.0</title>
    <sparkle:version>1.3.0</sparkle:version>
    <sparkle:shortVersionString>1.3.0</sparkle:shortVersionString>
    <pubDate>날짜</pubDate>
    <enclosure
        url="https://github.com/youngnu/liberaflow-release/releases/download/v1.3.0/Liberaflow-1.3.0-macos.dmg"
        type="application/x-apple-diskimage"
        length="파일크기"
        sparkle:os="macos"
        sparkle:edSignature="서명" />
</item>
```

## 중요 사항

### Git 워크플로우
- downloads 폴더의 dmg/exe 파일은 `.gitignore`에 포함되어 **Git 추적 안 됨**
- 실제 파일은 **GitHub Releases에만** 업로드됨
- 일반적인 `git add`, `git commit`, `git push` 명령어 사용 가능

### 파일 크기 제한
- GitHub Releases: 파일당 최대 **2GB**
- Git repository: 대용량 파일 추적 안 함 (문제 해결됨)

### 다운로드 URL 구조
```
https://github.com/youngnu/liberaflow-release/releases/download/v{VERSION}/{FILENAME}
```

## 트러블슈팅

### "손상된 디스크" 오류
- **원인**: Git LFS 포인터 파일을 다운로드한 경우
- **해결**: GitHub Releases URL 사용 확인

### Release가 생성되지 않음
```bash
# GitHub CLI 인증 확인
gh auth status

# 로그인
gh auth login
```

### 파일 크기 확인
```bash
# 로컬 파일 크기
ls -lh downloads/*.dmg downloads/*.exe

# GitHub Release에서 파일 크기 확인
gh release view v1.2.0
```

## 파일 구조

```
liberaflow-release/
├── downloads/              # 바이너리 파일 (Git 추적 안 됨)
│   ├── *.dmg              # macOS 설치 파일
│   └── *.exe              # Windows 설치 파일
├── updates/
│   └── appcast.xml        # Sparkle 자동 업데이트 설정
├── download-config.js     # 다운로드 링크 중앙 관리
├── release.sh             # 자동화 스크립트
└── .gitignore             # downloads/*.dmg, downloads/*.exe 포함
```
