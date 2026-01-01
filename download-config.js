// 다운로드 링크 중앙 관리
const DOWNLOAD_LINKS = {
    macos: 'https://github.com/youngnu/liberaflow-release/releases/download/v1.2.0/Liberaflow-1.2.0-macos.dmg',
    windows: 'https://github.com/youngnu/liberaflow-release/releases/download/v1.2.0/Liberaflow_1.1.9_Setup.exe'
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
