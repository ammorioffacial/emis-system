// Subtle 3D tilt + cursor-glow for .kpi-card elements. Pure hover
// polish, no data dependency — safe to init once on page load.
function initKpiTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".kpi-card").forEach((card) => {
    const maxTilt = 6; // degrees

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      card.style.setProperty("--x", `${px * 100}%`);
      card.style.setProperty("--y", `${py * 100}%`);
      card.style.setProperty("--ry", `${(px - 0.5) * maxTilt * 2}deg`);
      card.style.setProperty("--rx", `${(0.5 - py) * maxTilt * 2}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

initKpiTilt();
