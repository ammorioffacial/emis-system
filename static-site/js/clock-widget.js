// Live clock + Hijri/Gregorian date line for the dashboard header.
function initClockWidget() {
  const timeEl = document.getElementById("clock-time");
  const datesEl = document.getElementById("clock-dates");
  if (!timeEl || !datesEl) return;

  const gregorianFormatter = new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  });
  const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  });

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    timeEl.innerHTML = `${h}<span class="colon">:</span>${m}<span class="colon">:</span>${s}`;
    datesEl.textContent = `${gregorianFormatter.format(now)} م  •  ${hijriFormatter.format(now)} هـ`;
  }

  tick();
  setInterval(tick, 1000);
}

initClockWidget();
