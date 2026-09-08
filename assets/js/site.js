/* Presentation-only demos. No AI requests, user uploads, analytics, or persistent storage. */
(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#nav-links");
  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "메뉴 열기");
    menu.classList.remove("is-open");
  }
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      menu.classList.toggle("is-open", open);
    });
    menu
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuButton.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target))
        closeMenu();
    });
    const desktop = window.matchMedia("(min-width: 701px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const dialog = document.querySelector("#app-preview");
  const previewButton = document.querySelector("#open-preview");
  if (dialog && previewButton) {
    let previousOverflow = "";
    previewButton.addEventListener("click", () => {
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    });
    dialog
      .querySelector(".dialog-close")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = previousOverflow;
      previewButton.focus();
    });
  }

  const graphNotes = {
    start:
      "새로운 시작 — 인터뷰, 아이디어, 리서치가 하나의 프로젝트로 연결됩니다.",
    interview:
      "고객 인터뷰 — 반복해서 나온 문제를 다음 아이디어의 근거로 남깁니다.",
    idea: "작은 아이디어 — 인터뷰에서 발견한 문제를 해결할 방법을 적어둡니다.",
    plan: "실행 계획 — 연결한 지식을 이번 주의 구체적인 할 일로 옮깁니다.",
    research:
      "리서치 노트 — 읽은 자료와 출처를 연결해, 나중에도 맥락을 찾습니다.",
  };
  document.querySelectorAll("[data-note]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-note]").forEach((node) => {
        const selected = node === button;
        node.classList.toggle("active", selected);
        node.setAttribute("aria-pressed", String(selected));
      });
      document.querySelector("#graph-description").textContent =
        graphNotes[button.dataset.note];
    });
  });

  const modePanel = document.querySelector("#ownership-details");
  const modes = {
    local:
      '<div class="ownership-icon" aria-hidden="true">↳</div><span class="ownership-label">START LOCAL</span><h3>로그인 없이, 바로 시작.</h3><ul><li>노트는 내 폴더 안의 .md 파일로</li><li>노트·캔버스·그래프·일정·할 일</li><li>기존 마크다운 보관함도 그대로 열기</li></ul><p>AI 기능은 별도의 모델 계정 연결과 네트워크가 필요합니다.</p>',
    connected:
      '<div class="ownership-icon" aria-hidden="true">↗</div><span class="ownership-label">CONNECT WHEN YOU WANT</span><h3>필요한 연결만, 내 선택으로.</h3><ul><li>로그인 후 보관함별 동기화 켜기</li><li>선택한 사람·팀에 문서 공유</li><li>지식 공간과 채널에서 함께 작업</li></ul><p>로컬 파일은 그대로 남습니다. 선택한 동기화와 공유에는 클라우드를 사용합니다.</p>',
  };
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-mode]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      modePanel.innerHTML = modes[button.dataset.mode];
    });
  });

  // Historical incoming homepage anchors remain useful after the redesign.
  function resolveLegacyAnchor() {
    const aliases = { "#features": "possibilities", "#vision": "your-data" };
    const target = aliases[window.location.hash];
    if (target) document.getElementById(target)?.scrollIntoView();
  }
  window.addEventListener("hashchange", resolveLegacyAnchor);
  resolveLegacyAnchor();

  const panel = document.querySelector("#demo-panel");
  if (!panel) return;
  const documentPanel = document.querySelector("#demo-document");
  const initialDocument = documentPanel.innerHTML;
  const tabs = Array.from(document.querySelectorAll("[data-scenario]"));
  const runButton = document.querySelector("#run-demo");
  const runLabel = document.querySelector("#run-label");
  const runIcon = document.querySelector("#run-icon");
  const status = document.querySelector("#demo-status");
  const conversation = document.querySelector(".agent-conversation");
  const output = document.querySelector("#agent-output");
  const stepsElement = document.querySelector("#agent-steps");
  const result = document.querySelector("#result-file");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let selectedScenario = "notes";
  let complete = false;
  let runGeneration = 0;
  const timers = new Set();

  const scenarios = {
    notes: {
      context: "새로운 시작",
      file: "출시 아이디어.md",
      title: "아이디어, 그다음까지.",
      description: "지금 보고 있는 노트가<br>AI와 일하는 출발점이 됩니다.",
      prompt:
        '<span class="mention">@출시 아이디어</span>를 바탕으로<br>팀에 공유할 제안서를 만들어줘.',
      document: initialDocument,
      steps: [
        "연결한 노트에서 맥락 읽기",
        "핵심 내용과 다음 단계 정리",
        "팀에 공유할 Word 문서 생성",
      ],
      result: ["W", "word", "프로젝트 제안서.docx", "노트가 하나의 결과물로"],
      finishedDocument:
        '<div class="document-breadcrumb">새로운 시작 <span>/</span> 프로젝트 제안서.docx <span class="document-format">DOCX</span></div><div class="document-content document-result"><span class="document-eyebrow">FROM YOUR NOTES, TO YOUR NEXT STEP</span><div class="result-heading"><h2>작은 팀의 큰 시작</h2></div><p class="document-lead">프로젝트 제안서 · 예시 결과물</p><div class="note-callout"><span aria-hidden="true">✓</span><p>흩어져 있던 아이디어가<br>팀과 이야기할 수 있는 제안서가 되었습니다.</p></div><div class="result-section-title">01. 우리가 해결하려는 문제</div><p class="result-body">인터뷰에서 찾은 고객의 어려움과 프로젝트의 목표를 하나의 맥락으로 정리합니다.</p><div class="result-section-title">02. 이번 주의 다음 단계</div><p class="result-body">핵심 가설을 검토하고, 팀과 우선순위를 정해 작은 실험을 시작합니다.</p><div class="result-chips"><span>맥락을 담은 초안</span><span>앱에서 계속 편집</span><span>변경 되돌리기</span></div></div>',
    },
    browser: {
      context: "브라우저 자동화",
      file: "자료 수집.workflow",
      title: "한 번의 작업, 여러 번의 결과.",
      description: "클릭과 입력을 녹화하고<br>반복할 데이터를 연결하세요.",
      prompt:
        '<span class="mention">@자료 목록.csv</span>의 페이지를 돌며<br>제목과 분류를 모아 표로 정리해줘.',
      document:
        '<div class="document-breadcrumb">에이전트 <span>/</span> 자료 수집 <span class="document-format">WORKFLOW</span></div><div class="document-content"><span class="document-eyebrow">RECORD ONCE. KEEP YOUR FLOW.</span><h2>클릭은 한 번만.</h2><p class="document-lead">녹화한 흐름에 예시 데이터 3건을 연결했어요.</p><div class="browser-demo-url">◉ &nbsp;내 브라우저 / 자료 목록</div><table class="data-table"><caption class="sr-only">자동화할 예시 자료 목록</caption><thead><tr><th scope="col">자료</th><th scope="col">수집할 값</th><th scope="col">상태</th></tr></thead><tbody><tr><td>고객 리서치</td><td>제목 · 분류</td><td>대기</td></tr><tr><td>시장 조사</td><td>제목 · 분류</td><td>대기</td></tr><tr><td>제품 아이디어</td><td>제목 · 분류</td><td>대기</td></tr></tbody></table><span class="inline-tag">페이지 열기 → 값 수집 → 다음 행</span></div>',
      steps: [
        "녹화된 작업과 입력 데이터 확인",
        "자료 3건의 제목·분류 수집",
        "수집 결과를 하나의 표로 정리",
      ],
      result: [
        "X",
        "excel",
        "리서치 결과.xlsx",
        "반복 작업의 끝, 정리된 데이터",
      ],
      finishedDocument:
        '<div class="document-breadcrumb">자료 수집 <span>/</span> 리서치 결과.xlsx <span class="document-format">XLSX</span></div><div class="document-content document-result"><span class="document-eyebrow">YOUR ROUTINE, REIMAGINED</span><h2>반복 대신, 결과.</h2><p class="document-lead">예시 자료 3건을 하나의 표로 모았습니다.</p><table class="data-table"><caption class="sr-only">자료 수집 예시 결과</caption><thead><tr><th scope="col">제목</th><th scope="col">분류</th><th scope="col">상태</th></tr></thead><tbody><tr class="row-done"><td>고객 리서치</td><td>인터뷰</td><td>✓ 완료</td></tr><tr class="row-done"><td>시장 조사</td><td>분석</td><td>✓ 완료</td></tr><tr class="row-done"><td>제품 아이디어</td><td>기획</td><td>✓ 완료</td></tr></tbody></table><div class="note-callout"><span aria-hidden="true">↗</span><p>앱에서 CSV·엑셀 파일로 내보내고,<br>다음 작업에 바로 활용하세요.</p></div><div class="result-chips"><span>내 브라우저 세션</span><span>실행 기록 확인</span></div></div>',
    },
    team: {
      context: "우리 팀 채널",
      file: "# 새로운 시작",
      title: "같이 생각하고, 같이 실행.",
      description:
        "공유한 자료를 바탕으로<br>역할을 가진 AI 팀원이 함께합니다.",
      prompt:
        '<span class="mention">@프로젝트 제안서</span>를 읽고<br><span class="mention">#Reviewer</span> 검토해줘.<br><span class="mention">#Worker</span> 다음 할 일을 정리해줘.',
      document:
        '<div class="document-breadcrumb">Channel <span>/</span> 새로운 시작 <span class="document-format">TEAM</span></div><div class="document-content"><span class="document-eyebrow">PEOPLE + AI, ON THE SAME PAGE</span><h2>우리 팀의 다음 한 걸음</h2><p class="document-lead">사람과 AI 팀원이 함께 있는 채널</p><div class="demo-team-thread"><div class="demo-team-message"><span class="avatar human-avatar">나</span><div><strong>나</strong><p>이번 프로젝트 제안서를 공유했어요.<br>같이 살펴보고 다음 단계를 정해볼까요?</p></div></div><div class="team-file"><span aria-hidden="true">▤</span><span>@프로젝트 제안서</span></div><div class="demo-team-message"><span class="avatar reviewer-avatar">R</span><div><strong>Reviewer · AI 팀원</strong><p>검토할 준비가 됐어요. #으로 불러주세요.</p></div></div></div><div class="note-links"><span>팀에 공유한 자료</span><span>역할별 AI 팀원</span></div></div>',
      steps: [
        "공유한 제안서를 Reviewer에게 연결",
        "Reviewer가 빠진 가정과 질문 정리",
        "Worker가 실행할 일로 구체화",
      ],
      result: [
        "✓",
        "excel",
        "검토 결과 + 다음 할 일",
        "팀의 대화가 실행으로 연결",
      ],
      finishedDocument:
        '<div class="document-breadcrumb">Channel <span>/</span> 새로운 시작 <span class="document-format">TEAM</span></div><div class="document-content document-result"><span class="document-eyebrow">GOOD WORK HAPPENS TOGETHER</span><h2>같은 맥락, 다음 행동.</h2><p class="document-lead">AI 팀원 협업 · 예시 응답</p><div class="demo-team-thread"><div class="demo-team-message"><span class="avatar reviewer-avatar">R</span><div><strong>Reviewer · 검토</strong><p>핵심 가설은 명확해요. 예상 고객 범위와 검증 기준을 더 구체적으로 정하면 좋겠습니다.</p></div></div><div class="demo-team-message"><span class="avatar human-avatar">W</span><div><strong>Worker · 실행 계획</strong><p>다음 인터뷰 대상 정하기<br>실험의 성공 기준 합의하기<br>수정한 제안서를 팀과 확인하기</p></div></div></div><div class="result-chips"><span>사람 + AI의 채널</span><span>공유한 자료를 근거로</span></div></div>',
    },
  };

  function clearRun() {
    runGeneration += 1;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
  }
  function resetDemo() {
    clearRun();
    complete = false;
    const scenario = scenarios[selectedScenario];
    documentPanel.innerHTML = scenario.document;
    conversation.classList.remove("is-running");
    output.hidden = true;
    result.hidden = true;
    stepsElement.replaceChildren();
    result.replaceChildren();
    runButton.disabled = false;
    runLabel.textContent = "이 흐름 실행해보기";
    runIcon.textContent = "↗";
    status.textContent = "예시 데이터로 체험해보세요";
    panel.setAttribute("aria-busy", "false");
  }
  function selectScenario(key, moveFocus = false) {
    if (!Object.prototype.hasOwnProperty.call(scenarios, key)) return;
    selectedScenario = key;
    const scenario = scenarios[key];
    tabs.forEach((tab) => {
      const active = tab.dataset.scenario === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    panel.setAttribute("aria-labelledby", `tab-${key}`);
    document.querySelector("#workspace-context").textContent = scenario.context;
    document.querySelector("#workspace-save-status").textContent =
      key === "team" ? "팀과 공유됨" : "로컬에 저장됨";
    document.querySelector("#sidebar-file").textContent = scenario.file;
    document.querySelector("#agent-title").textContent = scenario.title;
    document.querySelector("#agent-description").innerHTML =
      scenario.description;
    document.querySelector("#demo-prompt").innerHTML = scenario.prompt;
    ["notes", "browser", "team"].forEach((name) =>
      document
        .querySelector(`#sidebar-${name}`)
        .classList.toggle("selected", name === key),
    );
    resetDemo();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectScenario(tab.dataset.scenario));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectScenario(tabs[next].dataset.scenario, true);
    });
  });
  document.querySelectorAll("[data-demo-link]").forEach((link) => {
    link.addEventListener("click", () => selectScenario(link.dataset.demoLink));
  });
  function schedule(callback, delay, generation) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (generation === runGeneration) callback();
    }, delay);
    timers.add(timer);
  }
  function updateStep(index) {
    const steps = Array.from(stepsElement.children);
    steps.forEach((step, position) => {
      step.className = `agent-step ${position < index ? "done" : position === index ? "running" : "pending"}`;
      step.firstElementChild.textContent =
        position < index ? "✓" : position === index ? "" : "·";
    });
  }
  function finishRun() {
    const scenario = scenarios[selectedScenario];
    updateStep(scenario.steps.length);
    const [symbol, style, filename, detail] = scenario.result;
    // All HTML interpolated here comes only from the fixed demo definitions above.
    result.innerHTML = `<span class="file-icon ${style}">${symbol}</span><div><strong>${filename}</strong><small>${detail}</small></div>`;
    result.hidden = false;
    documentPanel.innerHTML = scenario.finishedDocument;
    runButton.disabled = false;
    runLabel.textContent = "처음부터 다시 보기";
    runIcon.textContent = "↺";
    status.textContent = "데모 완료 · 내 자료로 해보려면 앱에서 시작하세요";
    panel.setAttribute("aria-busy", "false");
    complete = true;
  }
  runButton.addEventListener("click", () => {
    if (complete) {
      resetDemo();
      return;
    }
    clearRun();
    const generation = runGeneration;
    const scenario = scenarios[selectedScenario];
    runButton.disabled = true;
    runLabel.textContent = "흐름을 연결하는 중";
    runIcon.textContent = "…";
    status.textContent = "예시 데이터로 작업 흐름을 재생합니다";
    conversation.classList.add("is-running");
    output.hidden = false;
    panel.setAttribute("aria-busy", "true");
    stepsElement.replaceChildren();
    scenario.steps.forEach((label) => {
      const step = document.createElement("div");
      const state = document.createElement("span");
      state.className = "step-state";
      state.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.textContent = label;
      step.append(state, text);
      stepsElement.append(step);
    });
    if (reducedMotion.matches) {
      finishRun();
      return;
    }
    updateStep(0);
    schedule(() => updateStep(1), 700, generation);
    schedule(() => updateStep(2), 1400, generation);
    schedule(finishRun, 2200, generation);
  });
  // A suspended/closed page must not retain partial timers or stale scenario callbacks.
  window.addEventListener("pagehide", () => {
    if (!complete) resetDemo();
  });
})();
