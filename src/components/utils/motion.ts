export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** True for touch-first devices where the custom cursor and hover FX should be off. */
export const hasFinePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const DESKTOP_BREAKPOINT = 1024;

export const isDesktopWidth = () => window.innerWidth > DESKTOP_BREAKPOINT;

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
) {
  let timer: number | undefined;
  const debounced = (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
