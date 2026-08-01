/**
 * Mutable scroll-driven scene state.
 * GSAP writes these; R3F useFrame reads them — no React re-renders on scroll.
 */

export type Vec3 = { x: number; y: number; z: number };

export type SceneScrollState = {
  camera: Vec3;
  target: Vec3;
  billboardRotationY: number;
  billboardScale: number;
  orbIntensity: number;
  sceneOpacity: number;
  textureIndex: number;
  variantMix: number;
  /** R3F invalidate for frameloop="demand" */
  invalidate: (() => void) | null;
};

export function createSceneScrollState(initial?: Partial<SceneScrollState>): SceneScrollState {
  return {
    camera: { x: 0.2, y: 0.2, z: 5.4 },
    target: { x: 0.15, y: 0.05, z: 0 },
    billboardRotationY: -0.18,
    billboardScale: 1,
    orbIntensity: 1,
    sceneOpacity: 1,
    textureIndex: 0,
    variantMix: 0,
    invalidate: null,
    ...initial,
  };
}

export const homeSceneState = createSceneScrollState();

export const downloadSceneState = createSceneScrollState({
  camera: { x: 0, y: 0.15, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  billboardRotationY: 0.12,
});

export function bumpScene(state: SceneScrollState) {
  state.invalidate?.();
}
