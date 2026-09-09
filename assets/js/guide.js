/* Reflect the reading position in the guide's table of contents. */
(() => {
  const links = [...document.querySelectorAll(".guide-nav a")];
  const sections = [
    ...document.querySelectorAll(".guide-section[id], .guide-subsection[id]"),
  ].filter((section) => links.some((link) => link.hash === `#${section.id}`));
  let queued = false;
  function updateCurrentSection() {
    queued = false;
    const active = sections
      .filter((section) => section.getBoundingClientRect().top <= 150)
      .pop();
    links.forEach((link) => {
      if (active && link.hash === `#${active.id}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function scheduleUpdate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateCurrentSection);
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  document.addEventListener("click", scheduleUpdate);
  updateCurrentSection();
})();
