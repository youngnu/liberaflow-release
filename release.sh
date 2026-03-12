#!/bin/bash

# Liberaflow Release Automation Script
# 사용법: ./release.sh <version> <macos_file> <windows_file>
# 예: ./release.sh 1.3.0 ~/Desktop/Liberaflow-1.3.0-macos.dmg ~/Desktop/Liberaflow_1.3.0_Setup.exe

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 인자 확인
if [ "$#" -lt 3 ]; then
    echo -e "${RED}사용법: $0 <version> <macos_file> <windows_file>${NC}"
    echo "예: $0 1.3.0 ~/Desktop/Liberaflow-1.3.0-macos.dmg ~/Desktop/Liberaflow_1.3.0_Setup.exe"
    exit 1
fi

VERSION=$1
MACOS_FILE=$2
WINDOWS_FILE=$3

# 파일 존재 확인
if [ ! -f "$MACOS_FILE" ]; then
    echo -e "${RED}오류: macOS 파일을 찾을 수 없습니다: $MACOS_FILE${NC}"
    exit 1
fi

if [ ! -f "$WINDOWS_FILE" ]; then
    echo -e "${RED}오류: Windows 파일을 찾을 수 없습니다: $WINDOWS_FILE${NC}"
    exit 1
fi

# 파일명 추출
MACOS_FILENAME=$(basename "$MACOS_FILE")
WINDOWS_FILENAME=$(basename "$WINDOWS_FILE")

# macOS 버전 추출 (파일명에서)
MACOS_VERSION=$(echo "$MACOS_FILENAME" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
# Windows 버전 추출
WINDOWS_VERSION=$(echo "$WINDOWS_FILENAME" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

echo -e "${GREEN}=== Liberaflow Release v$VERSION ===${NC}"
echo "macOS 파일: $MACOS_FILENAME (버전: $MACOS_VERSION)"
echo "Windows 파일: $WINDOWS_FILENAME (버전: $WINDOWS_VERSION)"
echo ""

# 1. 파일을 downloads 폴더로 복사
echo -e "${YELLOW}[1/5] 파일을 downloads 폴더로 복사 중...${NC}"
cp "$MACOS_FILE" downloads/
cp "$WINDOWS_FILE" downloads/

# 2. download-config.js 업데이트
echo -e "${YELLOW}[2/5] download-config.js 업데이트 중...${NC}"
cat > assets/js/download-config.js << EOF
// 다운로드 링크 중앙 관리
const DOWNLOAD_LINKS = {
    macos: 'https://github.com/youngnu/liberaflow-release/releases/download/v${VERSION}/${MACOS_FILENAME}',
    windows: 'https://github.com/youngnu/liberaflow-release/releases/download/v${VERSION}/${WINDOWS_FILENAME}'
};

// 다운로드 버튼 업데이트 함수
function updateDownloadLinks() {
    // macOS 다운로드 버튼 업데이트
    const macosButtons = document.querySelectorAll('a[href*="macos.dmg"], a[href*="Download for macOS"]');
    macosButtons.forEach(button => {
        if (button.textContent.includes('macOS') || button.textContent.includes('Download for macOS')) {
            button.href = DOWNLOAD_LINKS.macos;
        }
    });

    // Windows 다운로드 버튼 업데이트
    const windowsButtons = document.querySelectorAll('a[href*="Setup.exe"], a[href*="Download for Windows"]');
    windowsButtons.forEach(button => {
        if (button.textContent.includes('Windows') || button.textContent.includes('Download for Windows')) {
            button.href = DOWNLOAD_LINKS.windows;
        }
    });
}

// DOM이 로드되면 다운로드 링크 업데이트
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDownloadLinks);
} else {
    updateDownloadLinks();
}
EOF

echo -e "${GREEN}✓ download-config.js 업데이트 완료${NC}"

# 3. 변경사항 커밋
echo -e "${YELLOW}[3/5] Git 변경사항 커밋 중...${NC}"
git add assets/js/download-config.js
git commit -m "Update download links to v${VERSION}

macOS: ${MACOS_VERSION}
Windows: ${WINDOWS_VERSION}"

# 4. GitHub에 푸시
echo -e "${YELLOW}[4/5] GitHub에 푸시 중...${NC}"
git push origin main

# 5. GitHub Release 생성
echo -e "${YELLOW}[5/5] GitHub Release v${VERSION} 생성 중...${NC}"
gh release create v${VERSION} \
  "downloads/${MACOS_FILENAME}" \
  "downloads/${WINDOWS_FILENAME}" \
  --title "Version ${VERSION}" \
  --notes "macOS: ${MACOS_VERSION}
Windows: ${WINDOWS_VERSION}

Download the appropriate installer for your platform.

## Downloads
- macOS: ${MACOS_FILENAME}
- Windows: ${WINDOWS_FILENAME}"

echo ""
echo -e "${GREEN}✅ 릴리스 완료!${NC}"
echo -e "${GREEN}릴리스 URL: https://github.com/youngnu/liberaflow-release/releases/tag/v${VERSION}${NC}"
echo ""
echo -e "${YELLOW}참고: appcast.xml을 수동으로 업데이트해야 합니다.${NC}"
