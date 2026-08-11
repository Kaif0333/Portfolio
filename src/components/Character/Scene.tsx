import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../utils/progress";
import { debounce } from "../utils/motion";

const LOAD_TIMEOUT_MS = 25000;

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    const container = canvasDiv.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    const scene = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let headBone: THREE.Object3D | null = null;
    let screenLight: THREE.Mesh | null = null;
    let mixer: THREE.AnimationMixer | undefined;
    let character: THREE.Object3D | null = null;
    let hoverCleanup: (() => void) | undefined;
    let disposed = false;

    const clock = new THREE.Clock();

    const light = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    // If loading hangs or fails, unlock the site without the 3D character.
    const failSafe = () => {
      progress.fail();
      gsap.set(".what-box-in", { display: "flex" });
    };
    const watchdog = setTimeout(failSafe, LOAD_TIMEOUT_MS);

    loadCharacter((loaded, total) => progress.update(loaded, total))
      .then((gltf) => {
        clearTimeout(watchdog);
        if (!gltf || disposed) return;
        const animations = setAnimations(gltf);
        if (hoverDivRef.current) {
          hoverCleanup = animations.hover(gltf, hoverDivRef.current);
        }
        mixer = animations.mixer;
        character = gltf.scene;
        scene.add(character);
        headBone = character.getObjectByName("spine006") || null;
        screenLight =
          (character.getObjectByName("screenlight") as THREE.Mesh) || null;
        progress.loaded().then(() => {
          setTimeout(() => {
            light.turnOnLights();
            animations.startIntro();
          }, 600);
        });
      })
      .catch(() => {
        clearTimeout(watchdog);
        failSafe();
      });

    let mouse = { x: 0, y: 0 },
      interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => (mouse = { x, y }));
    };
    const onTouchMove = (e: TouchEvent) => {
      handleTouchMove(e, (x, y) => (mouse = { x, y }));
    };
    const onTouchEnd = () => {
      handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchmove", onTouchMove, { passive: true });
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    const onResize = debounce(() => {
      if (character) handleResize(renderer, camera, canvasDiv, character);
    }, 200);
    window.addEventListener("resize", onResize);

    // Only render while the canvas is on screen and the tab is visible.
    let inView = true;
    const observer = new IntersectionObserver(
      ([entry]) => (inView = entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(container);
    const onVisibility = () => {
      // Reset the clock so a large hidden-tab delta doesn't jump the animations.
      if (!document.hidden) clock.getDelta();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!inView || document.hidden) return;
      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        if (screenLight) light.setPointLight(screenLight);
      }
      const delta = Math.min(clock.getDelta(), 0.1);
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      clearTimeout(watchdog);
      progress.clear();
      cancelAnimationFrame(rafId);
      observer.disconnect();
      onResize.cancel();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (landingDiv) {
        landingDiv.removeEventListener("touchmove", onTouchMove);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      hoverCleanup?.();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((m) => m?.dispose());
        }
      });
      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setLoading]);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
    </div>
  );
};

export default Scene;
