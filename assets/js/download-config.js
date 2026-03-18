// 다운로드 링크 중앙 관리
const DOWNLOAD_LINKS = {
    macos: 'https://liberaflow.com/downloads/Liberaflow-1.2.3-macos.dmg',
    windows: 'https://liberaflow.com/downloads/Liberaflow_1.2.2_Setup.exe'
};

// 다운로드 버튼 업데이트 함수
function updateDownloadLinks() {
    // 모든 다운로드 링크를 찾아서 업데이트
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        const text = link.textContent.trim();
        const id = link.id;
        const href = link.getAttribute('href');

        // macOS 다운로드 버튼 감지
        if (
            id === 'macosBtn' ||
            text.includes('macOS') ||
            text.includes('Download for macOS') ||
            (href && href.includes('macos.dmg'))
        ) {
            link.href = DOWNLOAD_LINKS.macos;
        }

        // Windows 다운로드 버튼 감지
        if (
            id === 'windowsBtn' ||
            text.includes('Windows') ||
            text.includes('Download for Windows') ||
            (href && href.includes('Setup.exe'))
        ) {
            link.href = DOWNLOAD_LINKS.windows;
        }
    });
}

// DOM이 로드되면 다운로드 링크 업데이트
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDownloadLinks);
} else {
    updateDownloadLinks();
}
