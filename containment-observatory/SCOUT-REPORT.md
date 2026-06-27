# Scout Report: Containment Observatory V2 Upgrade

## Summary

The current containment-observatory is a functional but visually flat React dashboard. The user's **soul-dashboard** is vastly more sophisticated — it has a full 3D world (pyramid core, floating platform, matrix rain, 2000-particle field, instanced city builder), complete post-processing stack (N8AO, bloom, chromatic aberration, scanlines, vignette), and a polished glass design system with oklch colors. The observatory needs to be brought up to soul-dashboard quality and then exceeded.

## What Soul-Dashboard Has That We Need

### 3D Scene (src/components/three/)
- **PyramidCore.tsx**: Double pyramid (top + inverted bottom) with edge wireframes, inner point lights, glow discs, connecting beam, 30 orbiting particles. All animated with sinusoidal pulsing.
- **FloatingPlatform.tsx**: Radial grid with 16 rings, 24 spokes, 48 node points, radar arc sweep. Uses custom `createRadialGridTexture()` for the grid surface.
- **MatrixRain.tsx**: Canvas-based Japanese katakana rain (256x256 texture, 20 columns, 14 rows). Updates every frame with fade trail.
- **ParticleField.tsx**: 2000 particles with 5 colors, individual speeds, additive blending. Particles drift upward and recycle.
- **PostEffects.tsx**: Full stack — N8AO (ambient occlusion), Bloom (intensity 2.5, mipmap blur), ChromaticAberration, Noise, Scanline, Vignette.

### Design System (src/styles/globals.css)
- oklch color space: `--plasma-cyan: oklch(0.82 0.16 235)`, `--plasma-green`, `--plasma-amber`, `--plasma-red`
- Glass panels with `backdrop-filter: blur(8px) saturate(160%)`, gradient border mask, noise overlay
- Panel glow states, scan-line animation, radar-dot pulse, laser-pulse animation
- Custom scrollbar with cyan gradient

### Panels
- CommandDesk, Journal, Observer, Task, ApiVault, Terminal, KnowledgeGraph, ScreenRecorder
- All draggable with framer-motion spring physics

## Free 3D Assets Available

### Models (glTF/GLB)
- **Sketchfab**: 800,000+ free models under Creative Commons (https://sketchfab.com/features/gltf)
- **Meshy**: 8,026+ free cyberpunk models (https://www.meshy.ai/subcategory/cyberpunk)
- **Hyper3D**: Free cyberpunk models (https://hyper3d.ai/tags/cyberpunk/2)
- **Khronos glTF Samples**: Official test models (https://github.khronos.org/glTF-Assets/)
- **PolyHaven**: Free HDRIs for image-based lighting

### Useful for Dashboard
- Cyberpunk helmets, weapons, vehicles for artifact core
- Sci-fi UI elements, HUD components
- Neon-lit environment pieces
- Holographic/floating object models

### Post-Processing Libraries
- `@react-three/postprocessing` (already installed)
- `postprocessing` (dependency)
- Effects available: N8AO, Bloom, ChromaticAberration, Noise, Scanline, Vignette, DepthOfField, LUT, ToneMapping

## Liquid Glass Design References

### Apple Liquid Glass (WWDC 2025)
- Dynamic material properties that adjust opacity/color based on content
- Real-time specular highlights
- Context-aware transformations
- CSS: `backdrop-filter: blur(20px)`, RGBA 0.7-0.9 alpha, luminous gradients

### Key Resources
- https://glassui.dev — Liquid Glass UI Toolkit with live demo
- https://liquidglass-kit.dev — Developer resources, code examples
- https://liquidglassdesign.com — Inspiration gallery
- https://developer.apple.com/documentation/technologyoverviews/liquid-glass — Apple's official docs

### CSS Formula (Apple-style)
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

## Gap Analysis

| Feature | Current Observatory | Soul-Dashboard | Target V2 |
|---------|-------------------|----------------|-----------|
| 3D Scene | Basic icosahedron | Pyramid + Platform + Rain + 2000 particles | Full world + GLTF models |
| Post-Processing | Bloom only | N8AO + Bloom + Chromatic + Noise + Scanline + Vignette | Full stack + custom shaders |
| Glass Design | Basic Tailwind | oklch + gradient borders + noise overlay | Liquid glass + dynamic opacity |
| Colors | Simple hex | oklch plasma system | oklch + dynamic theming |
| Panels | 6 static panels | 9 draggable panels | 8+ with drag + resize |
| Animations | CSS pulse | Spring physics + scan-line + radar | Full motion design |
| Data | Empty (bridge offline) | Live agent data | Real GSK bridge data |

## Recommended Approach

### Phase 1: Port Soul-Dashboard 3D Scene
Copy the proven 3D components from soul-dashboard into the observatory:
- PyramidCore → ArtifactCore (replace basic icosahedron)
- FloatingPlatform → add as base platform
- MatrixRain → add as background effect
- ParticleField → enhance existing particles
- PostEffects → full stack

### Phase 2: Upgrade Glass Design System
- Switch to oklch color space
- Add gradient border mask (soul-dashboard pattern)
- Add noise overlay utility
- Add panel glow states
- Add scan-line, radar-dot, laser-pulse animations

### Phase 3: Add Free 3D Assets
- Load a cyberpunk helmet or sci-fi object as secondary artifact
- Add HDR environment from PolyHaven for reflections
- Use GLTF models for council member avatars

### Phase 4: Enhance Panel Content
- Wire all panels to real GSK bridge data
- Add charts (Recharts) with live data
- Add terminal with real command history
- Add knowledge graph visualization

## Build Plan

1. Copy 3D components from soul-dashboard to containment-observatory
2. Install additional deps: `postprocessing` (for advanced effects)
3. Update globals.css with oklch + liquid glass tokens
4. Replace ArtifactCore with PyramidCore + FloatingPlatform
5. Add MatrixRain and ParticleField
6. Add full PostEffects stack
7. Upgrade all glass panels with gradient borders + noise
8. Add GLTF model loader for cyberpunk assets
9. Wire panels to live GSK bridge data
10. Build and deploy

## Risk Assessment

- **Performance**: Full post-processing stack is GPU-heavy. Use AdaptiveDpr and LOD.
- **Bundle size**: Three.js + postprocessing = ~1.2MB gzipped. Acceptable for dashboard.
- **GLTF loading**: External models need error handling for offline/fallback states.
- **Browser support**: backdrop-filter works in 95%+ browsers. N8AO needs WebGL2.
