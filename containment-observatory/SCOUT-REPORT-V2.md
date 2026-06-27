# Scout Report V2: Containment Observatory Deep Technical Upgrade

## What I Learned

### 1. Liquid Glass Shader (ybouane/liquidglass)

The core liquid glass effect uses a **3-stage WebGL pipeline**:

**Stage 1 — Blit**: Copy background texture to FBO
**Stage 2 — Blur**: 9-tap Gaussian blur (horizontal + vertical, multiple passes)
**Stage 3 — Glass**: The composite shader with:
- Rounded-rect SDF for panel shape
- Bevel height field for surface normals
- Dual-surface (biconvex) refraction using IOR 1.5
- Chromatic aberration (dispersion)
- Edge-weighted blur mix (sharp at edges, blurred in center)
- Fresnel reflection at grazing angles
- Multi-light Blinn-Phong specular highlights
- Drop shadow with offset
- Anti-aliased panel mask

Key uniforms: `u_refract`, `u_chroma`, `u_edgeHL`, `u_spec`, `u_fresnel`, `u_distort`, `u_zRadius`, `u_bevelMode`

### 2. Apple Liquid Glass R3F (ektogamat/apple-liquid-glass)

Uses `shaderMaterial` from drei to create custom materials:
- Vertex shader passes screen position + UV
- Fragment shader does aspect-ratio-correct background sampling
- `MeshPhysicalMaterial` with `transmission: true, ior: 1.2, thickness: 0.5, dispersion: 12` for glass buttons
- Environment map from drei's `<Environment preset="warehouse" />`
- Camera FOV animated to 5 for extreme telephoto look

### 3. Soul-Dashboard 3D Scene Patterns

**PyramidCore**: Double pyramid (top + inverted bottom) with:
- `ConeGeometry(2.2, 3.5, 4, 1)` — 4-sided cone
- `EdgesGeometry` for wireframe overlay
- Inner `pointLight` with animated intensity
- Glow disc with `AdditiveBlending`
- Connecting beam via `CylinderGeometry` with quaternion rotation
- 30 orbiting particles in circular paths

**FloatingPlatform**: Radial grid with:
- 16 rings, 24 spokes, 48 node points
- Custom `createRadialGridTexture()` for canvas-based grid
- Radar arc sweep animation
- All lines use `AdditiveBlending` + `depthWrite: false`

**MatrixRain**: Canvas-based effect:
- 256x256 canvas with Japanese katakana characters
- 20 columns, 14 rows, each with random speed
- Fade trail via `fillStyle = 'rgba(5, 5, 8, 0.15)'`
- Texture updated every frame with `needsUpdate = true`

**PostEffects**: Full stack:
- N8AO: `aoRadius={0.8}`, `intensity={2.5}`, `screenSpaceRadius`
- Bloom: `intensity={2.5}`, `mipmapBlur`, `luminanceThreshold={0.1}`
- ChromaticAberration: `offset={new Vector2(0.002, 0.002)}`, `radialModulation`
- Noise: `opacity={0.035}`, `blendFunction={ADD}`
- Scanline: `density={1.5}`, `opacity={0.05}`
- Vignette: `offset={0.1}`, `darkness={1.0}`

### 4. Free 3D Assets

- **Sketchfab**: 800,000+ free glTF models (CC license)
- **Meshy**: 8,026+ free cyberpunk models
- **Khronos glTF Samples**: Official test models
- **PolyHaven**: Free HDRIs for environment mapping

### 5. Key CSS Patterns

**oklch color system** (soul-dashboard):
```css
--plasma-cyan: oklch(0.82 0.16 235);
--plasma-green: oklch(0.85 0.22 155);
--panel-base: oklch(0.12 0.02 260 / 0.75);
```

**Glass panel with gradient border**:
```css
.glass-panel {
  background: rgba(10, 14, 25, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.18);
  backdrop-filter: blur(8px) saturate(160%);
}
.glass-panel::before {
  background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent 50%, rgba(255,255,255,0.04));
  mask-composite: exclude; /* gradient border effect */
}
```

**Noise overlay**:
```css
.noise-overlay::after {
  background-image: url("data:image/svg+xml,...feTurbulence...");
  mix-blend-mode: overlay;
  opacity: 0.03;
}
```

## Build Plan

### Phase 1: Port 3D Scene from Soul-Dashboard
Copy these exact components:
- `PyramidCore.tsx` → Replace `ArtifactCore.tsx`
- `FloatingPlatform.tsx` → Add as base
- `MatrixRain.tsx` → Add as background
- `ParticleField.tsx` → Enhance existing
- `PostEffects.tsx` → Replace simple Bloom
- `gridTextureGenerator.ts` → Add for platform texture

### Phase 2: Upgrade Glass CSS
- Copy `globals.css` patterns from soul-dashboard
- Add oklch color system
- Add gradient border mask
- Add noise overlay
- Add scan-line, radar-dot, laser-pulse animations

### Phase 3: Add Liquid Glass Panels
Create a new `LiquidGlassPanel.tsx` component using the WebGL shader pipeline from ybouane/liquidglass:
- Rounded-rect SDF
- Bevel height field normals
- Dual-surface refraction
- Chromatic aberration
- Edge-weighted blur mix
- Fresnel + specular highlights

### Phase 4: Add GLTF Models
- Load a cyberpunk helmet from Sketchfab as secondary artifact
- Add HDR environment from PolyHaven for reflections
- Use `useGLTF` from drei

### Phase 5: Wire Live Data
- Connect all panels to GSK bridge REST API
- Add Recharts for live data visualization
- Add terminal with real command history

### Phase 6: Build & Deploy
- `npm run build`
- Copy dist to plt-press gh-pages
- Push to GitHub Pages
