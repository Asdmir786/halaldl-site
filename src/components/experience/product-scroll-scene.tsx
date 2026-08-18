"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { homeSceneState } from "@/components/experience/scroll-progress-store";
import { useDocumentTheme } from "@/components/experience/use-document-theme";
import {
  useIsMobileViewport,
  usePrefersReducedMotion,
} from "@/components/experience/use-prefers-reduced-motion";

const TEXTURES = {
  light: "/releases/0.6.0/hero-light.webp",
  dark: "/releases/0.6.0/hero-dark.webp",
} as const;

const _camPos = new THREE.Vector3();

function SceneCamera() {
  const { camera } = useThree();

  useFrame(() => {
    const { camera: cam, target } = homeSceneState;
    _camPos.set(cam.x, cam.y, cam.z);
    camera.position.lerp(_camPos, 0.14);
    camera.lookAt(target.x, target.y, target.z);
  });

  return null;
}

function SoftOrbs({ theme }: { theme: "light" | "dark" }) {
  const group = useRef<THREE.Group>(null);
  const mint = theme === "dark" ? "#0b7f72" : "#5ec8b8";
  const steel = theme === "dark" ? "#5b7fa8" : "#8eacc8";

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.04 * homeSceneState.orbIntensity;
  });

  return (
    <group ref={group}>
      <mesh position={[-1.85, 0.85, -1.4]}>
        <sphereGeometry args={[0.42, 12, 12]} />
        <meshBasicMaterial color={mint} transparent opacity={theme === "dark" ? 0.32 : 0.24} />
      </mesh>
      <mesh position={[1.95, -0.55, -1.1]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial color={steel} transparent opacity={theme === "dark" ? 0.28 : 0.2} />
      </mesh>
    </group>
  );
}

function ProductPanel({ theme }: { theme: "light" | "dark" }) {
  const textures = useTexture([TEXTURES.light, TEXTURES.dark]);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const frameColor = theme === "dark" ? "#121a28" : "#e8eef6";

  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
  }, [textures]);

  useFrame(() => {
    if (!groupRef.current || !matRef.current) return;
    const { billboardRotationY, billboardScale, sceneOpacity } = homeSceneState;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      billboardRotationY,
      0.12,
    );
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, billboardScale, 0.12);
    groupRef.current.scale.setScalar(s);
    const nextMap = theme === "dark" ? textures[1] : textures[0];
    if (matRef.current.map !== nextMap) {
      matRef.current.map = nextMap;
      matRef.current.needsUpdate = true;
    }
    matRef.current.opacity = sceneOpacity;
  });

  return (
    <group ref={groupRef} position={[0.1, 0.02, 0]}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[3.35, 2.15, 0.05]} />
        <meshBasicMaterial color={frameColor} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.15, 1.95]} />
        <meshBasicMaterial
          ref={matRef}
          map={theme === "dark" ? textures[1] : textures[0]}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function HeroSceneContents({ theme }: { theme: "light" | "dark" }) {
  return (
    <>
      <SceneCamera />
      <SoftOrbs theme={theme} />
      <Suspense fallback={null}>
        <ProductPanel theme={theme} />
      </Suspense>
    </>
  );
}

type ProductScrollSceneProps = {
  className?: string;
  enabled?: boolean;
};

/**
 * Contained hero-stage canvas. Cheap materials only. Desktop only.
 */
export function ProductScrollSceneCanvas({ className, enabled = true }: ProductScrollSceneProps) {
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
      { rootMargin: "8% 0px", threshold: 0.05 },
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
    <div
      ref={rootRef}
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      {active ? (
        <Canvas
          dpr={[1, 1.25]}
          gl={{
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
            stencil: false,
          }}
          camera={{ position: [0.2, 0.2, 5.4], fov: 38, near: 0.1, far: 24 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <HeroSceneContents theme={theme} />
        </Canvas>
      ) : null}
    </div>
  );
}
