import * as THREE from "three";
import gsap from "gsap";
import { isDesktopWidth, prefersReducedMotion } from "./motion";

// Each set*Timeline call rebuilds its animations inside a gsap.context, so a
// rebuild (e.g. after resize) cleans up the previous triggers and tweens
// instead of stacking new ones on top.
let charCtx: gsap.Context | null = null;
let allCtx: gsap.Context | null = null;

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  charCtx?.revert();
  charCtx = gsap.context(() => {
    let screenLight: THREE.Mesh | undefined;
    let monitor: THREE.Mesh | undefined;
    character?.children.forEach((object) => {
      if (object.name === "Plane004") {
        object.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.transparent = true;
          material.opacity = 0;
          if (material.name === "Material.018") {
            monitor = mesh;
            material.color.set("#FFFFFF");
          }
        });
      }
      if (object.name === "screenlight") {
        const mesh = object as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.transparent = true;
        material.opacity = 0;
        material.emissive.set("#B0F5EA");
        if (!prefersReducedMotion()) {
          // repeatRefresh re-evaluates the function values on every repeat,
          // which produces the screen flicker without any timers.
          gsap.timeline({ repeat: -1, repeatRefresh: true }).to(material, {
            emissiveIntensity: () => Math.random() * 8,
            duration: () => Math.random() * 0.6,
            delay: () => Math.random() * 0.1,
          });
        }
        screenLight = mesh;
      }
    });

    if (prefersReducedMotion()) {
      gsap.set(".what-box-in", { display: "flex" });
      if (monitor) (monitor.material as THREE.Material as THREE.MeshStandardMaterial).opacity = 1;
      if (screenLight) (screenLight.material as THREE.Material as THREE.MeshStandardMaterial).opacity = 1;
      return;
    }

    const neckBone = character?.getObjectByName("spine005");
    if (isDesktopWidth()) {
      if (character) {
        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: ".landing-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: ".about-section",
            start: "center 55%",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        const tl3 = gsap.timeline({
          scrollTrigger: {
            trigger: ".whatIDO",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        tl1
          .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
          .to(camera.position, { z: 22 }, 0)
          .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
          .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
          .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
          .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

        tl2
          .to(
            camera.position,
            { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
            0
          )
          .to(".about-section", { y: "30%", duration: 6 }, 0)
          .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
          .fromTo(
            ".character-model",
            { pointerEvents: "inherit" },
            { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
            0
          )
          .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0);
        if (neckBone) {
          tl2.to(neckBone.rotation, { x: 0.6, delay: 2, duration: 3 }, 0);
        }
        if (monitor) {
          tl2
            .to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
            .fromTo(
              monitor.position,
              { y: -10, z: 2 },
              { y: 0, z: 0, delay: 1.5, duration: 3 },
              0
            );
        }
        if (screenLight) {
          tl2.to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0);
        }
        tl2
          .fromTo(
            ".what-box-in",
            { display: "none" },
            { display: "flex", duration: 0.1, delay: 6 },
            0
          )
          .fromTo(
            ".character-rim",
            { opacity: 1, scaleX: 1.4 },
            { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
            0.3
          );

        tl3
          .fromTo(
            ".character-model",
            { y: "0%" },
            { y: "-100%", duration: 4, ease: "none", delay: 1 },
            0
          )
          .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
          .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
      }
    } else {
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
    }
  });
}

export function setAllTimeline() {
  allCtx?.revert();
  allCtx = gsap.context(() => {
    if (prefersReducedMotion()) return;
    const careerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".career-section",
        start: "top 30%",
        end: "100% center",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    careerTimeline
      .fromTo(
        ".career-timeline",
        { maxHeight: "10%" },
        { maxHeight: "100%", duration: 0.5 },
        0
      )
      .fromTo(".career-timeline", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
      .fromTo(
        ".career-info-box",
        { opacity: 0 },
        { opacity: 1, stagger: 0.1, duration: 0.5 },
        0
      )
      .fromTo(
        ".career-dot",
        { animationIterationCount: "infinite" },
        {
          animationIterationCount: "1",
          delay: 0.3,
          duration: 0.1,
        },
        0
      );

    if (isDesktopWidth()) {
      careerTimeline.fromTo(
        ".career-section",
        { y: 0 },
        { y: "20%", duration: 0.5, delay: 0.2 },
        0
      );
    }
  });
}
