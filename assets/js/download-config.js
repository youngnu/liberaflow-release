// 다운로드 링크 중앙 관리
const DOWNLOAD_LINKS = {
    macos: 'https://downloads.liberaflow.com/Liberaflow-1.4.9-macos.dmg',
    windows: 'https://downloads.liberaflow.com/Liberaflow_1.5.0_Setup.exe'
};

// 다운로드 버튼 업데이트 함수
function updateDownloadLinks() {
    const macosButton = document.getElementById('macosBtn');
    const windowsButton = document.getElementById('windowsBtn');
    if (macosButton) macosButton.href = DOWNLOAD_LINKS.macos;
    if (windowsButton) windowsButton.href = DOWNLOAD_LINKS.windows;
}

// DOM이 로드되면 다운로드 링크 업데이트
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDownloadLinks);
} else {
    updateDownloadLinks();
}
