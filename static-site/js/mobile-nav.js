// Toggles the mobile nav drawer (hidden on lg+ where the sidebar is always visible).
(function () {
  const btn = document.getElementById("mobile-menu-btn");
  const drawer = document.getElementById("mobile-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  const closeBtn = document.getElementById("mobile-drawer-close");
  if (!btn || !drawer) return;

  function open() {
    drawer.classList.remove("hidden");
  }
  function close() {
    drawer.classList.add("hidden");
  }

  btn.addEventListener("click", open);
  backdrop?.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);
})();
