import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>,
  character: THREE.Object3D
) {
  if (!canvasDiv.current) return;
  const canvas3d = canvasDiv.current.getBoundingClientRect();
  renderer.setSize(canvas3d.width, canvas3d.height);
  camera.aspect = canvas3d.width / canvas3d.height;
  camera.updateProjectionMatrix();
  // The timeline builders clean up their own previous triggers (gsap.context),
  // so a rebuild here no longer nukes unrelated ScrollTriggers.
  setCharTimeline(character, camera);
  setAllTimeline();
  ScrollTrigger.refresh();
}
