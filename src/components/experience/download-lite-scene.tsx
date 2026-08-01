"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { downloadSceneState } from "@/components/experience/scroll-progress-store";
import { useDocumentTheme } from "@/components/experience/use-document-theme";
import {
  useIsMobileViewport,
  usePrefersReducedMotion,
} from "@/components/experience/use-prefers-reduced-motion";

function SceneCamera() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());

  useFrame(() => {
    const { camera: cam, target } = downloadSceneState;
    camera.position.set(cam.x, cam.y, cam.z);
    look.current.set(target.x, target.y, target.z);
    camera.lookAt(look.current);
  });

  return null;
}

function VariantBlocks({ theme }: { theme: "light" | "dark" }) {
  const fullRef = useRef<THREE.Mesh>(null);
  const liteRef = useRef<THREE.Mesh>(null);
  const fullColor = theme === "dark" ? "#5b7fa8" : "#7a9bb8";
  const liteColor = theme === "dark" ? "#0b7f72" : "#2aa896";

  useFrame(() => {
    const mix = downloadSceneState.variantMix;
    const rot = downloadSceneState.billboardRotationY;
    const opacity = downloadSceneState.sceneOpacity;

    if (fullRef.current) {
      fullRef.current.position.x = THREE.MathUtils.lerp(-0.95, -1.35, mix);
      fullRef.current.rotation.y = rot;
      (fullRef.current.material as THREE.MeshBasicMaterial).opacity =
        opacity * THREE.MathUtils.lerp(0.9, 0.45, mix);
    }

    if (liteRef.current) {
      liteRef.current.position.x = THREE.MathUtils.lerp(0.95, 0.35, mix);
      liteRef.current.rotation.y = -rot * 0.7;
      (liteRef.current.material as THREE.MeshBasicMaterial).opacity =
        opacity * THREE.MathUtils.lerp(0.45, 0.9, mix);
    }
  });

  return (
    <group>
      <mesh ref={fullRef} position={[-0.95, 0, 0]}>
        <boxGeometry args={[1.35, 1.85, 0.22]} />
        <meshBasicMaterial color={fullColor} transparent opacity={0.85} />
      </mesh>
      <mesh ref={liteRef} position={[0.95, 0, 0]}>
        <boxGeometry args={[1.05, 1.45, 0.18]} />
        <meshBasicMaterial color={liteColor} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

type DownloadLiteSceneProps = {
  className?: string;
  enabled?: boolean;
};

/** Desktop-only basic-material download accent. */
export function DownloadLiteSceneCanvas({ className, enabled = true }: DownloadLiteSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const theme = useDocumentTheme();
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || isMobile) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "8% 0px" },
    );
    io.observe(root);

    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion, isMobile]);

  if (!enabled || reducedMotion || isMobile) return null;

  const active = inView && pageVisible;

  return (
    <div ref={rootRef} className={className} aria-hidden="true" style={{ pointerEvents: "none" }}>
      {active ? (
        <Canvas
          dpr={[1, 1.2]}
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance", stencil: false }}
          camera={{ position: [0, 0.15, 5], fov: 38, near: 0.1, far: 20 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <SceneCamera />
          <VariantBlocks theme={theme} />
        </Canvas>
      ) : null}
    </div>
  );
}
