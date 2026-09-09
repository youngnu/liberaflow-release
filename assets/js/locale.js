/* Shared KO/EN behavior. Each page supplies its own text dictionary. */
window.initializeLiberaflowLocale = function (english) {
  "use strict";
  const storageKey = "liberaflow-language";
  const supported = new Set(["ko", "en"]);
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const attributes = ["aria-label", "alt", "title", "placeholder", "content"];
  const normalize = (value) => value.replace(/\s+/g, " ").trim();
  let locale = "ko";
  let storedLocale;
  let requestedLocale;
  try {
    storedLocale = localStorage.getItem(storageKey);
    requestedLocale = new URL(window.location.href).searchParams.get("lang");
  } catch {
    // The page still works when browser storage is unavailable.
    requestedLocale = new URL(window.location.href).searchParams.get("lang");
  }
  if (supported.has(requestedLocale)) locale = requestedLocale;
  else if (supported.has(storedLocale)) locale = storedLocale;

  function translate(source) {
    if (locale === "ko") return source;
    const key = normalize(source);
    if (!Object.prototype.hasOwnProperty.call(english, key)) return source;
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    return leading + english[key] + trailing;
  }

  function translatePage() {
    const walker = document.createTreeWalker(
      document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return node.parentElement?.closest("script, style, noscript")
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      let record = textSources.get(node);
      // A demo may reuse a text node with fresh Korean content.
      if (!record || node.nodeValue !== record.last) {
        record = { source: node.nodeValue, last: node.nodeValue };
        textSources.set(node, record);
      }
      const next = translate(record.source);
      record.last = next;
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    document
      .querySelectorAll(attributes.map((name) => `[${name}]`).join(","))
      .forEach((element) => {
        let records = attributeSources.get(element);
        if (!records) {
          records = new Map();
          attributeSources.set(element, records);
        }
        attributes.forEach((name) => {
          if (!element.hasAttribute(name)) return;
          const current = element.getAttribute(name);
          let record = records.get(name);
          if (!record || current !== record.last) {
            record = { source: current, last: current };
            records.set(name, record);
          }
          const next = translate(record.source);
          record.last = next;
          if (current !== next) element.setAttribute(name, next);
        });
      });
  }

  function setLocale(next, updateUrl = false) {
    if (!supported.has(next)) return;
    locale = next;
    document.documentElement.lang = locale;
    document.querySelectorAll("[data-locale]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.locale === locale),
      );
    });
    try {
      localStorage.setItem(storageKey, locale);
    } catch {
      // A disabled/full storage area must not prevent switching languages.
    }
    if (updateUrl) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", locale);
        window.history.replaceState(null, "", url);
      } catch {
        // Local file previews may disallow history updates.
      }
    }
    document.querySelectorAll("a[href]").forEach((link) => {
      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#")) return;
      const target = new URL(raw, window.location.href);
      const home = new URL("./", window.location.href);
      const guide = new URL("docs.html", home);
      if (
        target.origin === home.origin &&
        [home.pathname, home.pathname + "index.html", guide.pathname].includes(
          target.pathname,
        )
      ) {
        target.searchParams.set("lang", locale);
        link.setAttribute(
          "href",
          (target.pathname === guide.pathname ? "docs.html" : "./") +
            target.search +
            target.hash,
        );
      }
    });
    translatePage();
  }

  document.querySelectorAll("[data-locale]").forEach((button) => {
    button.addEventListener("click", () =>
      setLocale(button.dataset.locale, true),
    );
  });
  setLocale(locale);

  // Demos insert new documents, status messages and ARIA labels. Observe only
  // text-related changes. Translations write only when the value changes, so
  // the observer settles after its own updates instead of looping.
  const observer = new MutationObserver(() => translatePage());
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: attributes,
  });
};
