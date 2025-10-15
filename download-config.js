// 다운로드 링크 중앙 관리
const DOWNLOAD_LINKS = {
    macos: 'downloads/Liberaflow-1.1.6-macos.dmg',
    windows: 'downloads/Liberaflow_1.1.6_Setup.exe'
};

// 다운로드 버튼 업데이트 함수
function updateDownloadLinks() {
    // 현재 페이지가 features 폴더 내부인지 확인
    const isInFeaturesFolder = window.location.pathname.includes('/features/');
    const pathPrefix = isInFeaturesFolder ? '../' : '';

    // macOS 다운로드 버튼 업데이트
    const macosButtons = document.querySelectorAll('a[href*="macos.dmg"], a[href*="Download for macOS"]');
    macosButtons.forEach(button => {
        if (button.textContent.includes('macOS') || button.textContent.includes('Download for macOS')) {
            button.href = pathPrefix + DOWNLOAD_LINKS.macos;
        }
    });

    // Windows 다운로드 버튼 업데이트
    const windowsButtons = document.querySelectorAll('a[href*="Setup.exe"], a[href*="Download for Windows"]');
    windowsButtons.forEach(button => {
        if (button.textContent.includes('Windows') || button.textContent.includes('Download for Windows')) {
            button.href = pathPrefix + DOWNLOAD_LINKS.windows;
        }
    });
}

// DOM이 로드되면 다운로드 링크 업데이트
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDownloadLinks);
} else {
    updateDownloadLinks();
}
