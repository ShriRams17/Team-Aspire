(function () {
  "use strict";
  const scene = document.getElementById("scene");
  const intro = document.getElementById("intro");
  const enter = document.getElementById("enterBtn");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Gentle 3D tilt following the pointer
  if (!reduce) {
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      scene.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    }, { passive: true });
    intro.addEventListener("pointerleave", () => { scene.style.transform = "rotateY(0deg) rotateX(0deg)"; });
  }

  // Enter: play the zoom-away, then open the main site (index.html).
  // Without JavaScript the link still works as a normal link.
  enter.addEventListener("click", (e) => {
    try { sessionStorage.setItem("goIntroSeen", "1"); } catch (err) {}
    if (e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;   // normal navigation
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => { location.href = enter.href; }, 800);
  });

  // Coming back with the browser's Back button: reset the animation state
  window.addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("leaving"); });
})();
