import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";
import { hasFinePointer, prefersReducedMotion } from "./utils/motion";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch devices never see the custom cursor — don't pay for it.
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    let hover = false;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    document.addEventListener("mousemove", onMouseMove);

    let rafId = 0;
    const loop = () => {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Delegated hover handling, so elements mounted later (carousel, lazy
    // sections) get the same cursor behavior without extra listeners.
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]"
      );
      if (!target) return;
      if (target.dataset.cursor === "icons") {
        const rect = target.getBoundingClientRect();
        cursor.classList.add("cursor-icons");
        gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
        hover = true;
      }
      if (target.dataset.cursor === "disable") {
        cursor.classList.add("cursor-disable");
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]"
      );
      if (!target) return;
      cursor.classList.remove("cursor-disable", "cursor-icons");
      hover = false;
    };
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef} aria-hidden="true"></div>;
};

export default Cursor;
