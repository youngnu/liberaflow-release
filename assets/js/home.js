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
        "아이디어가 프로젝트가 되면 채널에 코드 폴더를 연결합니다. AI 팀원이 고치고, 바뀐 줄을 보여 준 뒤 커밋까지 합니다.",
      guide: "coding-projects",
    },
    office: {
      caption:
        "고칠 곳에 주석을 달아 보내면, AI가 원본 파일을 고칩니다. 한글 문서는 문단이나 표를 골라 맡깁니다.",
      guide: "office-comments",
    },
    wiki: {
      caption:
        "자료를 위키에 넣으라고 하면, AI가 페이지로 정리하고 위키링크로 잇습니다.",
      guide: "llm-wiki",
    },
    space: {
      caption:
        "로그인하면 팀의 문서를 지식 공간에 모아, 뜻으로 찾고 근거와 함께 답을 받습니다.",
      guide: "spaces-workflow",
    },
    schedule: {
      caption: "한 번 말해 두면, 정한 시간에 AI가 알아서 실행합니다.",
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

  function selectScene(tab, focus = false) {
    const scene = scenes[tab.dataset.scene];
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(
        candidate.getAttribute("aria-controls"),
      );
      panel.hidden = !selected;
      panel.classList.toggle("scene-enter", selected);
    });
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

  highlightSidebar("idea");

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
