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
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
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

  const scenes = {
    notes: { caption: "생각을 적던 자리에서, 다음 문서까지.", guide: "ai" },
    automation: {
      caption: "반복하던 동작을, 다시 쓸 수 있는 흐름으로.",
      guide: "automation",
    },
    team: {
      caption: "사람과 AI가 같은 자료를 보며, 함께 앞으로.",
      guide: "team",
    },
  };
  const tabs = [...document.querySelectorAll("[data-scene]")];
  const caption = document.getElementById("scene-caption");
  const guide = document.getElementById("scene-guide");

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
