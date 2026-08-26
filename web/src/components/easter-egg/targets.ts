const PHYSICS_SELECTOR = "[data-physics]";

export function getVisiblePhysicsContext(limit = 60) {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return { main: null, targets: [] as HTMLElement[] };

  const candidates = Array.from(main.querySelectorAll<HTMLElement>(PHYSICS_SELECTOR)).filter(
    (el) => el.offsetWidth > 4 && el.offsetHeight > 4,
  );
  const outermost = candidates.filter(
    (el) => !candidates.some((other) => other !== el && other.contains(el)),
  );
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const targets = outermost
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.bottom > 0 &&
        rect.top < viewportHeight &&
        rect.right > 0 &&
        rect.left < viewportWidth
      );
    })
    .slice(0, limit);

  return { main, targets };
}
