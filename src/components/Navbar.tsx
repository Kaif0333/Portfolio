import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";
import { debounce, prefersReducedMotion } from "./utils/motion";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

let smoother: ScrollSmoother | null = null;
// The smoother's lifecycle is owned by Navbar, so the accessor lives here.
// eslint-disable-next-line react-refresh/only-export-components
export const getSmoother = () => smoother;

const sections = [
  { href: "#about", label: "ABOUT" },
  { href: "#work", label: "WORK" },
  { href: "#contact", label: "CONTACT" },
];

const Navbar = () => {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: reduced ? 0 : 1.7,
      speed: reduced ? 1 : 1.7,
      effects: !reduced,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const onResize = debounce(() => ScrollSmoother.refresh(true), 200);
    window.addEventListener("resize", onResize);
    return () => {
      onResize.cancel();
      window.removeEventListener("resize", onResize);
      smoother?.kill();
      smoother = null;
    };
  }, []);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    target: string
  ) => {
    // ScrollSmoother scrolls via transforms, so native hash jumps land in the
    // wrong place at every width — always route through the smoother.
    if (smoother) {
      e.preventDefault();
      smoother.scrollTo(target, true, "top top");
    }
  };

  return (
    <>
      <header className="header">
        <a
          href="#"
          className="navbar-title"
          data-cursor="disable"
          aria-label="Back to top"
          onClick={(e) => {
            e.preventDefault();
            smoother?.scrollTo(0, true);
          }}
        >
          KB
        </a>
        <a
          href="mailto:smohammedkaifbasha@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          smohammedkaifbasha@gmail.com
        </a>
        <nav aria-label="Main">
          <ul>
            {sections.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  onClick={(e) => scrollToSection(e, section.href)}
                >
                  <HoverLinks text={section.label} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
