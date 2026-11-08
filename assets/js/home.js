(() => {
  "use strict";
  document.documentElement.dataset.enhanced = "true";

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");
  const mobile = window.matchMedia("(max-width: 700px)");

  function setMenu(open, returnFocus = false) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    menu.classList.toggle("is-open", open);
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener("click", (event) => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    // The button sits after the links, so a keyboard opening (detail 0)
    // moves focus into the menu instead of past it.
    if (open && event.detail === 0) menu.querySelector("a")?.focus();
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false, true);
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav")) setMenu(false);
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".nav")) setMenu(false);
  });
  mobile.addEventListener("change", () => setMenu(false));

  // Hero buttons download directly. Their HTML fallback is #download, so the
  // installer URLs stay in one place (download-config.js) for release.sh.
  const heroDownloads = [...document.querySelectorAll("[data-download]")];
  if (typeof DOWNLOAD_LINKS === "object") {
    heroDownloads.forEach((link) => {
      const url = DOWNLOAD_LINKS[link.dataset.download];
      if (url) link.href = url;
    });
  }
  const platform = (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent
  ).toLowerCase();
  const visitorOs = platform.includes("win")
    ? "windows"
    : platform.includes("mac")
      ? "macos"
      : null;
  if (visitorOs) {
    heroDownloads.forEach((link) => {
      link.classList.toggle("is-primary", link.dataset.download === visitorOs);
    });
  }

  const copyButton = document.querySelector("[data-copy-target]");
  if (copyButton && navigator.clipboard) {
    const copyLabel = copyButton.querySelector(".copy-label");
    let resetTimer;
    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
      const source = document.getElementById(copyButton.dataset.copyTarget);
      try {
        await navigator.clipboard.writeText(source.textContent.trim());
      } catch {
        return;
      }
      copyButton.classList.add("is-copied");
      copyLabel.textContent = "복사했어요";
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyButton.classList.remove("is-copied");
        copyLabel.textContent = "문장 복사";
      }, 1800);
    });
  }

  const scenes = {
    idea: {
      caption:
        "떠오른 생각을 메모해 @로 붙이면, AI가 기획안 문서와 할 일로 펼칩니다.",
      guide: "ai",
    },
    code: {
      caption:
        "채널에서 #으로 AI 팀원을 부르고, @로 문서와 폴더를 붙여 일을 맡깁니다. 팀원은 연결된 코드 폴더에서 바로 작업을 시작합니다.",
      guide: "coding-projects",
    },
    office: {
      caption:
        "AI가 만든 PPT를 앱 안 미리보기에서 바로 손봅니다. 글자 색과 위치를 바꾸고, 문구도 그 자리에서 고칩니다.",
      guide: "office-review-details",
    },
    wiki: {
      caption:
        "쌓인 노트를 그래프로 한눈에 봅니다. 검색어로 좁혀 원하는 노트를 열고, 로컬 그래프로 그 노트에 이어진 것만 따로 봅니다.",
      guide: "notes",
    },
    space: {
      caption:
        "로그인하면 팀의 문서를 지식 공간에 모아, 뜻으로 찾고 근거와 함께 답을 받습니다.",
      guide: "spaces-workflow",
    },
    schedule: {
      caption:
        "‘매주 월요일’처럼 말로 맡기면 AI가 예약해 두고, 앱이 켜져 있는 동안 정한 시간에 실행합니다. 만든 예약은 캘린더에서 확인합니다.",
      guide: "schedule",
    },
  };
  const tabs = [...document.querySelectorAll("[data-scene]")];
  const caption = document.getElementById("scene-caption");
  const guide = document.getElementById("scene-guide");
  // The mock sidebar highlights where each example happens.
  const sidebarItems = [
    ...document.querySelectorAll(".mock-sidebar [data-for]"),
  ];
  function highlightSidebar(name) {
    let first = true;
    sidebarItems.forEach((item) => {
      const active = first && item.dataset.for === name;
      if (active) first = false;
      item.classList.toggle("is-active", active);
    });
  }

  // Recorded scenes play muted while the window is on screen. The toggle
  // stops all of them; reduced-motion visitors start from the poster.
  const appWindow = document.querySelector(".app-window");
  const windowLabel = appWindow.querySelector(".example-label");
  const videoToggle = appWindow.querySelector(".video-toggle");
  let activeVideo = null;
  let videoPaused = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let windowVisible = true;

  function syncVideo() {
    videoToggle.textContent = videoPaused ? "재생" : "일시 정지";
    if (!activeVideo) return;
    if (videoPaused || !windowVisible) {
      activeVideo.pause();
      return;
    }
    const video = activeVideo;
    video.play().catch((error) => {
      // A blocked autoplay leaves the poster and offers the play button.
      if (error.name !== "NotAllowedError" || video !== activeVideo) return;
      videoPaused = true;
      syncVideo();
    });
  }
  videoToggle.addEventListener("click", () => {
    videoPaused = !videoPaused;
    syncVideo();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      windowVisible = entry.isIntersecting;
      syncVideo();
    }).observe(appWindow);
  }

  function selectScene(tab, focus = false) {
    const scene = scenes[tab.dataset.scene];
    let video = null;
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(
        candidate.getAttribute("aria-controls"),
      );
      panel.hidden = !selected;
      panel.classList.toggle("scene-enter", selected);
      const panelVideo = panel.querySelector("video");
      if (selected) video = panelVideo;
      else panelVideo?.pause();
    });
    if (video !== activeVideo) {
      activeVideo = video;
      if (video) video.currentTime = 0;
    }
    appWindow.classList.toggle("is-video", Boolean(video));
    windowLabel.textContent = video ? "실제 앱 화면" : "기능을 재구성한 예시";
    videoToggle.hidden = !video;
    syncVideo();
    caption.textContent = scene.caption;
    highlightSidebar(tab.dataset.scene);
    // Shared locale.js keeps this language when the guide is opened.
    const language = document.documentElement.lang === "en" ? "en" : "ko";
    guide.setAttribute("href", `docs.html?lang=${language}#${scene.guide}`);
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectScene(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectScene(tabs[next], true);
    });
  });

  selectScene(
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0],
  );

  // Keep links from the earlier website useful, including the former AI section.
  function revealLinkedDetail() {
    if (window.location.hash === "#ai")
      document.getElementById("ai").open = true;
  }
  window.addEventListener("hashchange", revealLinkedDetail);
  revealLinkedDetail();
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
