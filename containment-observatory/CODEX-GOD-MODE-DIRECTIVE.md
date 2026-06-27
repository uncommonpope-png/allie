# CODEX GOD MODE MASTER DIRECTIVE
## GSK Containment Observatory — Scene Population

**Date:** June 27, 2026  
**Project:** `C:\Users\uncom\Desktop\allie\containment-observatory\containment-observatory-app\`  
**Goal:** Populate all 4 scenes with the 28 downloaded GLB models. Replace procedural props with real 3D assets. Make the scenes feel alive, dense, and alien.

---

## ARCHITECTURE OVERVIEW

### Current State
- 4 scenes: `desk`, `outside`, `car`, `sofa`
- Each scene has a sub-component in `GskScene.tsx` (DeskScene, OutsideScene, CarScene, SofaScene)
- Procedural props in `Props.tsx` (RetroLaptop, RetroTV, PinkCadillac, AlienDesk, AlienSofa)
- Environment in `gsk/Environment.tsx` (FloorGrid, ContainmentFrame, DataTowers, BackWall)
- Camera presets in `gsk/ScenePresets.ts`
- Mood store at `stores/mood-store.ts`

### Coordinate System
- Y = up
- Floor at y = -0.5
- Character at origin (0, -0.5, 0)
- Back wall at z = -3
- Containment frame: ~4.4 wide, ~3.4 deep
- Camera desk: (0, 1.5, 4) FOV 50
- Camera outside: (0, 2, 6) FOV 55
- Camera car: (3, 2, 3) FOV 48
- Camera sofa: (2, 1, 3) FOV 50

### 28 GLB Models Available
```
alien-blobby.glb          (1 MB)    - pink alien character
doctor-alien.glb          (1.6 MB)  - pink alien doctor
scifi-corridor.glb        (5.7 MB)  - spaceship corridor
server-rack.glb           (13 MB)   - server rack
retro-screens.glb         (763 KB)  - cyberpunk screens
retro-tv.glb              (4.2 MB)  - retro TV
desk-lamp.glb             (817 KB)  - desk lamp
data-center-rack.glb      (122 KB)  - data rack
neon-bar-sign.glb         (412 KB)  - neon sign
neon-sign-japanese.glb    (6.9 MB)  - japanese neon
hologram-globe.glb        (1 MB)    - hologram globe (animated)
hologram-projector.glb    (316 KB)  - hologram projector
gem-rock.glb              (4.3 MB)  - crystal gem
arcade-cabinet.glb        (1.2 MB)  - arcade cabinet
cyberpunk-apartment.glb   (3.2 MB)  - apartment scene
cyberpunk-floor.glb       (1.4 MB)  - floor texture
cartoon-race-car.glb      (880 KB)  - cartoon car
lava-planet.glb           (3.6 MB)  - lava planet
damaged-helmet.glb        (3.7 MB)  - flight helmet
boombox.glb               (10 MB)   - boombox
avocado.glb               (7.9 MB)  - avocado
car-concept.glb           (11.5 MB) - concept car
brain-stem.glb            (3.1 MB)  - brain stem
dragon.glb                (6.3 MB)  - dragon
cesium-man.glb            (428 KB)  - animated man
chess-set.glb             (42 MB)   - chess set
corset.glb                (13 MB)   - corset
barn-lamp.glb             (7.7 MB)  - barn lamp
```

---

## TASK 1: Create `src/components/gsk/SceneAssets.tsx`

This file is the **single source of truth** for all GLB model loading. It must:

1. Import `useGLTF` from `@react-three/drei`
2. Preload ALL 28 models at module level using `useGLTF.preload()`
3. Export a `useSceneAssets()` hook that returns loaded scenes
4. Export individual asset wrapper components for each model
5. Each wrapper should:
   - Accept `position`, `rotation`, `scale` props
   - Auto-center the model (compute bounding box, shift to center)
   - Apply toneMapping and colorSpace correctly
   - Memoize the scene clone to avoid re-renders

### Model Loading Pattern
```tsx
import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// Preload at module level
useGLTF.preload('/assets/models/alien-blobby.glb')

export function AlienBlobby(props: JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF('/assets/models/alien-blobby.glb')
  const cloned = useMemo(() => scene.clone(), [scene])
  return <primitive object={cloned} {...props} />
}
```

### Scale Calibration
Most Sketchfab models are in meters. Our scene units = meters. Typical scales:
- Characters: scale 0.01 to 0.005 (Sketchfab models are often 100-200x too large)
- Props (furniture, tech): scale 0.01 to 0.005
- Environment pieces: scale 0.01 to 0.003
- Small props: scale 0.02 to 0.01

**CRITICAL:** After loading each model, check its bounding box. If it's > 10 units, it needs scaling down. Use this pattern:
```tsx
function autoScale(scene: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  return targetSize / maxDim
}
```

---

## TASK 2: Scene Placement Configs

Create a new file `src/components/gsk/ScenePlacements.ts` that defines exact positions for every model in every scene.

### DESK Scene — "The Containment Lab"
Camera: (0, 1.5, 4), FOV 50. Character at center.

| Model | Position | Rotation Y | Scale | Notes |
|-------|----------|-----------|-------|-------|
| alien-blobby | [0.8, -0.5, 0.5] | 0.3 | 0.008 | Observation subject on desk |
| desk-lamp | [0.5, 0.0, 0.9] | -0.2 | 0.01 | On desk, right side |
| retro-screens | [-1.5, 0.3, -2.5] | 0 | 0.008 | Wall-mounted monitors |
| server-rack | [-2.8, 0.5, -1.5] | 0.2 | 0.004 | Left side, behind desk |
| data-center-rack | [2.5, 0.3, -2.0] | -0.1 | 0.006 | Right side, background |
| neon-bar-sign | [0, 2.5, -2.8] | 0 | 0.005 | Above back wall, "GSK" sign |
| hologram-projector | [-0.5, 0.0, 0.7] | 0 | 0.01 | On desk, left of lamp |
| hologram-globe | [-0.5, 0.8, 0.7] | 0 | 0.006 | Floating above projector |
| gem-rock | [1.5, -0.3, -1.0] | 0.5 | 0.005 | Floor, right side |
| boombox | [-2.0, -0.3, 0.5] | 0.4 | 0.004 | Floor, left side |
| chess-set | [1.8, -0.3, 1.5] | 0 | 0.005 | Floor, front-right |
| damaged-helmet | [-1.0, 0.0, 1.2] | 0.3 | 0.006 | On desk or nearby shelf |
| barn-lamp | [2.5, 1.5, -1.0] | 0 | 0.003 | Hanging light, right |

**Remove:** RetroLaptop procedural (replaced by retro-screens), RetroTV procedural (replaced by retro-tv model).

### OUTSIDE Scene — "The Alien Planet"
Camera: (0, 2, 6), FOV 55. No containment frame.

| Model | Position | Rotation Y | Scale | Notes |
|-------|----------|-----------|-------|-------|
| lava-planet | [0, 8, -20] | 0 | 0.5 | Giant planet in sky |
| scifi-corridor | [0, -0.5, -8] | 3.14 | 0.003 | Distant structure |
| cyberpunk-apartment | [-5, -0.5, -6] | 0.5 | 0.003 | Building left |
| neon-sign-japanese | [-4, 2, -5] | 0.3 | 0.004 | Neon on building |
| doctor-alien | [2, -0.5, 2] | -0.5 | 0.008 | Second alien character |
| dragon | [-3, 1, -4] | 0.8 | 0.002 | Flying creature |
| gem-rock | [3, -0.3, -2] | 1.2 | 0.008 | Crystal formation |
| avocado | [-1, -0.3, 3] | 0 | 0.01 | Alien flora on ground |
| cesium-man | [4, -0.5, -1] | -1.0 | 0.008 | Humanoid figure |
| cartoon-race-car | [-2, -0.5, 4] | 0.3 | 0.01 | Abandoned vehicle |

**Remove:** Procedural floating dodecahedron/octahedron (replaced by real models).

### CAR Scene — "The Getaway"
Camera: (3, 2, 3), FOV 48. Character driving.

| Model | Position | Rotation Y | Scale | Notes |
|-------|----------|-----------|-------|-------|
| car-concept | [0, -0.3, 0] | 0 | 0.005 | Main vehicle (replaces PinkCadillac) |
| scifi-corridor | [0, 0, -10] | 3.14 | 0.002 | Road/tunnel ahead |
| neon-bar-sign | [-3, 2, -5] | 0.5 | 0.004 | Roadside sign |
| data-center-rack | [4, 0, -6] | 0 | 0.003 | Roadside structure |
| lava-planet | [0, 10, -25] | 0 | 0.3 | Sky decoration |
| hologram-globe | [2, 3, -3] | 0 | 0.005 | Floating hologram on road |
| brain-stem | [-4, 0.5, -4] | 1.0 | 0.003 | Alien artifact on side |

**Remove:** Procedural PinkCadillac (replaced by car-concept.glb).

### SOFA Scene — "The Lounge"
Camera: (2, 1, 3), FOV 50. Character relaxing.

| Model | Position | Rotation Y | Scale | Notes |
|-------|----------|-----------|-------|-------|
| arcade-cabinet | [-2, -0.5, -1] | 0.3 | 0.006 | Left side, against wall |
| retro-tv | [0, 0, -2.5] | 0 | 0.004 | On stand, center |
| boombox | [2, -0.3, 0.5] | -0.3 | 0.005 | Floor, right side |
| neon-sign-japanese | [0, 2.5, -2.8] | 0 | 0.004 | Wall decoration |
| hologram-projector | [1.5, 0.0, 0.8] | 0 | 0.01 | Coffee table |
| hologram-globe | [1.5, 0.8, 0.8] | 0 | 0.005 | Above projector |
| chess-set | [-1, -0.3, 1.5] | 0.5 | 0.006 | Floor game |
| corset | [2.5, 0.5, -2] | 0 | 0.003 | Display on wall/shelf |
| barn-lamp | [-2, 1.5, 0] | 0 | 0.004 | Standing lamp |

**Remove:** Procedural RetroTV (replaced by retro-tv.glb), procedural AlienSofa (keep — it's procedural, not a GLB).

---

## TASK 3: Update `GskScene.tsx`

Replace the 4 scene sub-components with new versions that use the asset system.

### Pattern for Each Scene
```tsx
function DeskScene() {
  const mood = useMoodStore((s) => s.mood)
  return (
    <>
      <GskCharacter mood={mood} clothing="suit" position={[0, -0.5, 0]} scale={1.2} />
      {/* Real GLB models */}
      <AlienBlobby position={[0.8, -0.5, 0.5]} rotation={[0, 0.3, 0]} scale={0.008} />
      <DeskLamp position={[0.5, 0.0, 0.9]} rotation={[0, -0.2, 0]} scale={0.01} />
      {/* ... more models ... */}
    </>
  )
}
```

### Import Changes
- Remove imports from `./Props` for models being replaced
- Add imports from `./gsk/SceneAssets`
- Keep GskCharacter, AlienSofa (procedural)

### Removed Procedural Props
| Procedural | Replaced By | Scene |
|------------|-------------|-------|
| RetroLaptop | retro-screens.glb | desk |
| RetroTV | retro-tv.glb | desk, sofa |
| PinkCadillac | car-concept.glb | car |

### Kept Procedural Props
| Procedural | Why Kept |
|------------|----------|
| GskCharacter | Core character, mood-driven animation — cannot replace |
| AlienDesk | Simple desk, procedural is fine |
| AlienSofa | Simple sofa, procedural is fine |

---

## TASK 4: Performance Optimization

### LOD (Level of Detail)
For large models (> 5MB), implement distance-based LOD:
```tsx
function SmartAsset({ url, position, scale, lodDistance = 8 }: Props) {
  const { scene } = useGLTF(url)
  const ref = useRef<THREE.Group>(null)
  const { camera } = useThree()
  
  useFrame(() => {
    if (!ref.current) return
    const dist = camera.position.distanceTo(ref.current.position)
    ref.current.visible = dist < lodDistance
  })
  
  return <primitive ref={ref} object={scene.clone()} position={position} scale={scale} />
}
```

### Instancing
For repeated models (data-center-rack appears in multiple scenes), consider InstancedMesh if > 3 copies.

### Preloading
All models must be preloaded at app start. Add to `main.tsx` or a preload component:
```tsx
// Preload all assets
useGLTF.preload('/assets/models/alien-blobby.glb')
useGLTF.preload('/assets/models/doctor-alien.glb')
// ... all 28 models
```

---

## TASK 5: Update ScenePresets.ts

Add asset placement data to each scene preset so it's declarative:

```tsx
export interface ScenePreset {
  camera: { position: Vector3Tuple; fov: number }
  lighting: SceneLightConfig
  showContainmentFrame: boolean
  assets: Array<{
    component: string  // e.g. 'AlienBlobby'
    position: Vector3Tuple
    rotation?: Vector3Tuple
    scale?: number
  }>
}
```

---

## EXECUTION ORDER

1. **Create `SceneAssets.tsx`** — Model loading + wrapper components
2. **Create `ScenePlacements.ts`** — Position configs for all 4 scenes
3. **Update `ScenePresets.ts`** — Add asset arrays to presets
4. **Update `GskScene.tsx`** — Replace scene components with GLB-powered versions
5. **Update `main.tsx`** — Add preload calls
6. **Remove unused procedural imports** — Clean up Props.tsx imports
7. **Run `npm run build`** — Verify zero errors
8. **Test each scene** — Cycle through desk/outside/car/sofa

---

## CONSTRAINTS

- **DO NOT** touch `GskCharacter.tsx` — the pink alien character stays procedural
- **DO NOT** touch `stores/mood-store.ts` or `stores/gsk-store.ts`
- **DO NOT** touch `hooks/useGskWebSocket.ts`
- **DO NOT** remove `gsk/Environment.tsx`, `gsk/Holograms.tsx`, `gsk/Lighting.tsx`, `gsk/materials.ts`
- **DO NOT** add new npm packages — everything needed is already installed
- **DO** use `useMemo` for all scene clones
- **DO** use `useGLTF.preload()` for all models
- **DO** run `npm run build` after each major change
- **DO** keep the build under 1500 modules / 2000 kB

---

## SUCCESS CRITERIA

- [ ] All 4 scenes populated with GLB models
- [ ] No procedural props where GLB replacements exist
- [ ] Scene switching works (SCENE button cycles through all 4)
- [ ] Mood animations still work on GskCharacter
- [ ] Post-processing effects still work
- [ ] `npm run build` passes with zero errors
- [ ] Bundle size < 2000 kB
- [ ] Each scene has 8-15 visible objects (dense but not cluttered)

---

*This is the master directive. Execute it in order. Do not deviate. Build it right.*
