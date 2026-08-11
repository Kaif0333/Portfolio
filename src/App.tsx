import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import { LoadingProvider } from "./context/LoadingProvider";
import { prefersReducedMotion } from "./components/utils/motion";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));

const App = () => {
  // Reduced-motion visitors get the full site without the animated 3D scene.
  const showCharacter = !prefersReducedMotion();

  return (
    <LoadingProvider>
      <Suspense fallback={null}>
        <MainContainer>
          {showCharacter && (
            <Suspense fallback={null}>
              <CharacterModel />
            </Suspense>
          )}
        </MainContainer>
      </Suspense>
      <Analytics />
    </LoadingProvider>
  );
};

export default App;
