import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import TechStackGrid from "./TechStackGrid";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";
import { debounce, isDesktopWidth, prefersReducedMotion } from "./utils/motion";
import { getSmoother } from "./Navbar";
import { useLoading } from "../context/LoadingProvider";

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(isDesktopWidth());
  const { isLoading, setLoading } = useLoading();

  useEffect(() => {
    setSplitText();
    // Without the 3D character (reduced motion), nothing else drives the
    // loading progress — complete it here so the site unlocks.
    if (prefersReducedMotion()) {
      setLoading(100);
    }
    const resizeHandler = debounce(() => {
      setSplitText();
      setIsDesktopView(isDesktopWidth());
    }, 200);
    window.addEventListener("resize", resizeHandler);
    return () => {
      resizeHandler.cancel();
      window.removeEventListener("resize", resizeHandler);
    };
  }, [setLoading]);

  return (
    <div className="container-main">
      <a
        className="skip-link"
        href="#about"
        onClick={(e) => {
          const smoother = getSmoother();
          if (smoother) {
            e.preventDefault();
            smoother.scrollTo("#about", true, "top top");
          }
        }}
      >
        Skip to content
      </a>
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            {isDesktopView ? (
              // Deferred until the loader exits so the heavy physics bundle
              // never competes with the character model on the critical path.
              !isLoading && (
                <Suspense fallback={null}>
                  <TechStack />
                </Suspense>
              )
            ) : (
              <TechStackGrid />
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
