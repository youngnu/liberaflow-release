/* Homepage illustrations only. Switching examples does not run AI or browser automation. */
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
  const notesDocument = documentPanel.innerHTML;
  const calendarDocument = document.querySelector("#calendar-example").innerHTML;
  const tabs = Array.from(document.querySelectorAll(".scenario-tab[data-scenario]"));
  const runButton = document.querySelector("#run-demo");
  const runLabel = document.querySelector("#run-label");
  const runIcon = document.querySelector("#run-icon");
  const status = document.querySelector("#demo-status");
  const output = document.querySelector("#agent-output");
  const result = document.querySelector("#result-file");
  let selectedScenario = "notes";
  let showingResult = false;

  const scenarios = {
    calendar: {
      context: "Calendar · 일정과 할 일",
      readiness: "개인 일정은 로그인 없이",
      group: "일정과 할 일",
      folder: "Calendar",
      file: "오늘의 할일",
      surface: "Calendar 사용 순서",
      prerequisite: "개인 일정·할 일은 바로 시작하세요. 팀·팔로우 일정은 로그인 후 연결합니다.",
      title: "나의 하루부터, 함께 보는 일정까지.",
      description: "먼저 내 계획을 세우고, 필요할 때 함께 볼 사람을 연결하세요.",
      prompt: "<strong>바탕화면에서도 이어가세요.</strong><span>캘린더와 할 일은 독립된 데스크톱 위젯으로 띄울 수 있습니다.</span>",
      instructions: [
        ["Calendar에서 일정 만들기", "달력의 날짜 칸을 누르고 제목·시작·종료 시간을 정해 저장합니다."],
        ["오늘 할 일 추가", "Tasks의 오늘의 할일에서 할 일을 추가하고, 끝낸 항목은 완료로 표시합니다."],
        ["팀 또는 팔로우로 연결", "로그인 후 설정 → 팀에서 팀을 만들어 멤버를 초대하거나, 설정 → 사람에서 팔로우를 요청합니다. 상대가 수락하면 연결됩니다."],
        ["일정을 한 화면에", "Calendar에 내 일정과 팀 동료·팔로우한 사람의 공개 일정이 함께 표시됩니다."],
      ],
      actionLabel: "팀·팔로우 일정 함께 보기",
      returnLabel: "개인 일정·할 일 안내로 돌아가기",
      initialStatus: "개인 일정에서 함께 보는 일정으로 이어집니다.",
      finishedStatus: "팀·팔로우 관계와 공개 범위에 따라 표시됩니다.",
      finishedDocument: `
        <div class="document-breadcrumb">Calendar <span>/</span> 함께 보는 일정 <span class="document-format">CONNECTED</span></div>
        <div class="document-content document-result">
          <span class="document-eyebrow">YOUR TEAM. ONE CALENDAR.</span>
          <h2>내 일정 옆에, 함께하는 사람들의 일정.</h2>
          <p class="document-lead">팀 동료와 팔로우한 사람의 공개 일정을 Calendar 한 화면에서 확인하세요.</p>
          <div class="calendar-people" aria-label="한 화면에 함께 표시할 일정">
            <div><span class="calendar-person" aria-hidden="true">●</span><div><strong>나의 일정</strong><p>내가 만든 일정과 참석하는 일정</p></div></div>
            <div><span class="calendar-person" aria-hidden="true">●</span><div><strong>같은 팀 동료</strong><p>같은 팀이면 별도 팔로우 없이</p></div></div>
            <div><span class="calendar-person" aria-hidden="true">●</span><div><strong>팔로우한 사람</strong><p>상대가 팔로우 요청을 수락한 뒤</p></div></div>
          </div>
          <div class="calendar-visibility"><strong>일정의 공개 범위</strong><p>공개 일정은 팔로워·같은 팀원에게, 비공개 일정은 나와 지정한 참석자에게만 보입니다.</p></div>
        </div>`,
      document: calendarDocument,
    },
    notes: {
      context: "Notes · 문서 작성 예시",
      readiness: "AI 모델 연결 후 사용",
      group: "보관함 자료",
      folder: "출시 준비",
      file: "출시 준비.md",
      surface: "노트 옆 AI",
      prerequisite: "내 보관함을 열고 OpenAI 또는 Claude 계정을 연결하세요.",
      title: "노트를 지정하고, Word 초안을 요청하세요.",
      description: "작성할 형식과 담을 내용을 요청에 함께 적습니다.",
      prompt: '<span class="mention">@출시 준비</span>를 바탕으로 고객 인터뷰 계획을 Word(.docx)로 만들어줘. 목표·대상·질문·이번 주 할 일을 정리하고, 미정인 내용은 그대로 표시해줘.',
      instructions: [
        ["자료 선택", "Notes의 AI 입력창에서 @를 입력하고 출시 준비 노트를 선택합니다."],
        ["Word 파일 요청", "Word(.docx)로 만들어 달라고 요청하거나 /문서 명령을 사용합니다."],
        ["미리보기에서 확인", "생성한 문서를 열어 확인하고, 수정할 부분을 선택해 AI에게 요청합니다. 공유는 공유 창에서 따로 선택합니다."],
      ],
      document: notesDocument,
      result: ["W", "word", "고객 인터뷰 계획.docx", "예시 결과 · 앱에서 생성한 문서는 미리보기로 확인"],
      finishedDocument: `
        <div class="document-breadcrumb">출시 준비 <span>/</span> 고객 인터뷰 계획.docx <span class="document-format">DOCX</span></div>
        <div class="document-content document-result">
          <span class="document-eyebrow">WORD DRAFT · EXAMPLE</span>
          <h2>고객 인터뷰 계획</h2>
          <p class="document-lead">출시 준비 노트를 정리한 Word 초안 예시입니다.</p>
          <div class="result-section-title">목표와 대상</div>
          <p class="result-body">다음 주에 고객 인터뷰를 시작합니다. 대상은 개인 작업자 3명이며, 아직 섭외하지 않았습니다.</p>
          <div class="result-section-title">질문 초안</div>
          <p class="result-body">자료를 어디에 저장하는가 / 다시 찾을 때 무엇이 어려운가.</p>
          <div class="result-section-title">이번 주 할 일</div>
          <p class="result-body">이번 주 금요일까지 질문지를 준비합니다.</p>
          <div class="note-callout"><span aria-hidden="true">?</span><p>미정: 섭외 담당자, 인터뷰 일정.</p></div>
          <div class="result-chips"><span>원문에 있는 내용으로 작성</span><span>공유는 확인 후 선택</span></div>
        </div>`,
    },
    browser: {
      context: "에이전트 · Browser Automation",
      readiness: "브라우저 확장 연결 필요",
      group: "브라우저 자동화",
      folder: "데이터 뽑기",
      file: "CSV · XLSX 내보내기",
      surface: "Browser Automation 사용 순서",
      prerequisite: "앱과 브라우저 확장을 연결하고 작업할 Chrome 탭을 준비하세요.",
      title: "고른 값을 파일로 저장하는 순서.",
      description: "브라우저에서 값을 고르고, 앱에서 수집과 저장을 실행합니다.",
      prompt: '<strong>목록을 더 모으려면</strong><span>반복 목록이 있는 경우, 필요에 따라 가져올 개수와 스크롤해서 더 불러오기를 설정할 수 있습니다.</span>',
      instructions: [
        ["가져올 값 선택", "확장 팝업의 데이터 뽑기를 열고, 페이지에서 원하는 값을 클릭합니다."],
        ["앱에 추출 단계 추가", "앱으로 보내기를 누른 뒤, Liberaflow에 도착한 카드에서 단계로 추가를 누릅니다."],
        ["파일 내보내기 설정", "추출 단계 뒤에 파일 내보내기 단계를 추가합니다. 파일 형식에서 CSV 또는 XLSX를 선택합니다."],
        ["실행 후 파일 열기", "Replay로 실행합니다. 완료 창에서 파일명·행 수를 확인하고 파일 열기로 결과를 엽니다."],
      ],
      actionLabel: "내보내기 안내 보기",
      returnLabel: "데이터 뽑기 안내로 돌아가기",
      initialStatus: "앱의 실제 기능과 사용 순서를 안내합니다.",
      finishedStatus: "내보내기 설정과 파일 확인 방법입니다.",
      document: `
        <div class="document-breadcrumb">Browser Automation <span>/</span> 데이터 뽑기 <span class="document-format">CSV · XLSX</span></div>
        <div class="document-content">
          <span class="document-eyebrow">PICK VALUES → EXPORT FILES</span>
          <h2>웹페이지에서 고른 값을, 내 파일로.</h2>
          <p class="document-lead">데이터 뽑기로 원하는 값을 선택하고, CSV 또는 Excel(.xlsx)로 저장하세요.</p>
          <dl class="extract-guide">
            <div><dt>댓글처럼 반복되는 값</dt><dd>같은 구조로 반복되는 값은 자동으로 목록이 됩니다. 항목마다 한 행씩 모읍니다.</dd></div>
            <div><dt>제목·채널명처럼 한 번 나오는 값</dt><dd>페이지의 제목 등을 함께 고르면 목록의 모든 행에 붙습니다.</dd></div>
            <div><dt>목록이 없는 페이지</dt><dd>한 번만 나오는 값들만 골라도 한 행으로 저장할 수 있습니다.</dd></div>
          </dl>
          <div class="export-formats" aria-label="지원하는 내보내기 형식"><span>CSV <small>.csv</small></span><span>Excel <small>.xlsx</small></span></div>
        </div>`,
      finishedDocument: `
        <div class="document-breadcrumb">Browser Automation <span>/</span> 파일 내보내기 <span class="document-format">CSV · XLSX</span></div>
        <div class="document-content document-result">
          <span class="document-eyebrow">CHOOSE A FORMAT → RUN → OPEN</span>
          <h2>CSV도, XLSX도.</h2>
          <p class="document-lead">파일 내보내기 단계에서 저장할 형식을 고릅니다.</p>
          <div class="export-formats" aria-label="지원하는 내보내기 형식"><span>CSV <small>.csv</small></span><span>Excel <small>.xlsx</small></span></div>
          <dl class="extract-guide">
            <div><dt>파일 형식과 이름 확인</dt><dd>CSV 또는 XLSX를 선택하고 파일 이름·저장 위치를 확인합니다. CSV 단계 삽입 또는 XLSX 단계 삽입을 누릅니다.</dd></div>
            <div><dt>실행이 끝나면 파일 열기</dt><dd>Replay 실행 후 완료 창에 파일명과 행 수가 표시됩니다. 파일 열기를 누르면 기본 앱에서 결과가 열립니다.</dd></div>
            <div><dt>결과 파일 다시 찾기</dt><dd>내보내기 단계 카드와 상단 파일 메뉴에서도 결과를 다시 열 수 있습니다.</dd></div>
          </dl>
        </div>`,
    },
    team: {
      context: "Channel · 문서 검토 예시",
      readiness: "Liberaflow 로그인 필요",
      group: "채널에 공유한 자료",
      folder: "출시 준비 채널",
      file: "출시 준비.md",
      surface: "채널에서 AI 호출",
      prerequisite: "로그인 후 채널을 만들고, 문서를 공유하고 AI 팀원을 초대하세요.",
      title: "자료는 @로, AI 팀원은 #으로.",
      description: "채널에 공유한 노트를 지정해 Reviewer에게 검토를 요청합니다.",
      prompt: '<span class="mention">#Reviewer</span> <span class="mention">@출시 준비</span>에서 인터뷰를 시작하기 전에 정해야 할 내용을 찾아줘. 이미 정한 내용과 구분해서 알려줘.',
      instructions: [
        ["문서 공유", "채널 메뉴의 내 문서 채널에 공유…에서 출시 준비 노트를 공유합니다."],
        ["AI 초대·호출", "멤버 → 내 팀원 초대로 Reviewer를 추가합니다. 입력창에서 @ 문서와 # 팀원을 각각 목록에서 선택해 요청합니다."],
        ["채널에서 함께 확인", "Reviewer의 답이 채널에 올라옵니다. AI를 부르지 않은 일반 글은 사람들에게만 전달됩니다."],
      ],
      document: `
        <div class="document-breadcrumb">Channel <span>/</span> 출시 준비 <span class="document-format">NOTE</span></div>
        <div class="document-content">
          <span class="document-eyebrow">SHARED NOTE · EXAMPLE</span>
          <h2>같이 볼 자료부터.</h2>
          <p class="document-lead">채널에 출시 준비.md를 공유한 예시입니다.</p>
          <div class="team-file"><span aria-hidden="true">▤</span><span>@출시 준비</span></div>
          <div class="result-section-title">출시 준비 노트</div>
          <p class="result-body">목표: 다음 주에 고객 인터뷰를 시작한다.</p>
          <p class="result-body">대상: 개인 작업자 3명. 아직 섭외하지 않았다.</p>
          <p class="result-body">질문 초안: 자료를 어디에 저장하는가 / 다시 찾을 때 무엇이 어려운가.</p>
          <p class="result-body">이번 주 금요일까지 질문지를 준비한다.</p>
          <div class="note-callout"><span aria-hidden="true">?</span><p>미정: 섭외 담당자, 인터뷰 일정.</p></div>
          <div class="note-links"><span>초대한 AI 팀원: Reviewer</span></div>
        </div>`,
      result: ["R", "word", "Reviewer의 검토 · 예시 응답", "채널에 공유하고 @로 지정한 노트 확인"],
      finishedDocument: `
        <div class="document-breadcrumb">Channel <span>/</span> 출시 준비 <span class="document-format">REPLY</span></div>
        <div class="document-content document-result">
          <span class="document-eyebrow">REVIEWER REPLY · EXAMPLE</span>
          <h2>정한 것과, 정해야 할 것.</h2>
          <p class="document-lead">같은 출시 준비 노트를 검토한 예시 응답입니다.</p>
          <div class="demo-team-thread"><div class="demo-team-message"><span class="avatar reviewer-avatar">R</span><div><strong>Reviewer · AI 팀원</strong><p>정해진 내용은 대상 3명과 질문지 준비 기한입니다. 시작 전에는 섭외 담당자와 인터뷰 일정을 정해야 합니다.</p><p>3명은 섭외 완료 인원이 아니라 목표 인원입니다.</p></div></div></div>
          <div class="note-callout"><span aria-hidden="true">#</span><p>같은 요청에 여러 AI 팀원을 선택하면 나란히 작업합니다. AI 답변에서 다른 팀원을 #으로 부르면 다음 작업으로 이어집니다.</p></div>
          <div class="result-chips"><span>@는 공유 자료</span><span>#은 팀원 호출</span></div>
        </div>`,
    },
  };

  function renderExample() {
    const scenario = scenarios[selectedScenario];
    documentPanel.innerHTML = showingResult ? scenario.finishedDocument : scenario.document;
    const hasResultFile = showingResult && Boolean(scenario.result);
    output.hidden = !hasResultFile;
    result.hidden = !hasResultFile;
    result.replaceChildren();
    if (hasResultFile) {
      const [symbol, style, filename, detail] = scenario.result;
      const icon = document.createElement("span");
      icon.className = `file-icon ${style}`;
      icon.textContent = symbol;
      icon.setAttribute("aria-hidden", "true");
      const details = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = filename;
      const subtitle = document.createElement("small");
      subtitle.textContent = detail;
      details.append(title, subtitle);
      result.append(icon, details);
    }
    runLabel.textContent = showingResult
      ? scenario.returnLabel || "원본 자료로 돌아가기"
      : scenario.actionLabel || "예시 결과 보기";
    runIcon.textContent = showingResult ? "↺" : "↗";
    status.textContent = showingResult
      ? scenario.finishedStatus || "원본 자료에 맞춘 예시 결과입니다."
      : scenario.initialStatus || "예시 자료로 사용 순서를 살펴보세요.";
    panel.setAttribute("aria-busy", "false");
  }

  function selectScenario(key, moveFocus = false) {
    if (!Object.prototype.hasOwnProperty.call(scenarios, key)) return;
    selectedScenario = key;
    showingResult = false;
    const scenario = scenarios[key];
    tabs.forEach((tab) => {
      const active = tab.dataset.scenario === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    panel.setAttribute("aria-labelledby", `tab-${key}`);
    document.querySelector(".demo-agent").dataset.scenario = key;
    const labels = {
      "workspace-context": scenario.context,
      "workspace-save-status": scenario.readiness,
      "sidebar-group-label": scenario.group,
      "sidebar-folder-label": scenario.folder,
      "sidebar-file": scenario.file,
      "demo-surface-title": scenario.surface,
      "demo-prerequisite": scenario.prerequisite,
      "agent-title": scenario.title,
      "agent-description": scenario.description,
    };
    Object.entries(labels).forEach(([id, label]) => {
      document.getElementById(id).textContent = label;
    });
    document.querySelector("#demo-prompt").innerHTML = scenario.prompt;
    const instructions = document.querySelector("#demo-instructions");
    instructions.replaceChildren();
    scenario.instructions.forEach(([title, description]) => {
      const step = document.createElement("li");
      const heading = document.createElement("strong");
      heading.textContent = title;
      const body = document.createElement("p");
      body.textContent = description;
      step.append(heading, body);
      instructions.append(step);
    });
    ["calendar", "notes", "browser", "team"].forEach((name) => {
      document.querySelector(`#sidebar-${name}`).classList.toggle("selected", name === key);
    });
    renderExample();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectScenario(tab.dataset.scenario));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
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
  runButton.addEventListener("click", () => {
    showingResult = !showingResult;
    renderExample();
  });
  selectScenario(selectedScenario);
})();
