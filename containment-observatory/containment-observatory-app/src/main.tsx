import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import './index.css'
import App from './App'

const deskModels = [
  '/assets/models/alien-blobby.glb',
  '/assets/models/desk-lamp.glb',
  '/assets/models/retro-screens.glb',
  '/assets/models/server-rack.glb',
  '/assets/models/data-center-rack.glb',
  '/assets/models/neon-bar-sign.glb',
  '/assets/models/hologram-projector.glb',
  '/assets/models/hologram-globe.glb',
  '/assets/models/gem-rock.glb',
  '/assets/models/boombox.glb',
  '/assets/models/chess-set.glb',
  '/assets/models/damaged-helmet.glb',
  '/assets/models/barn-lamp.glb',
]

const otherModels = [
  '/assets/models/doctor-alien.glb',
  '/assets/models/scifi-corridor.glb',
  '/assets/models/retro-tv.glb',
  '/assets/models/neon-sign-japanese.glb',
  '/assets/models/arcade-cabinet.glb',
  '/assets/models/cyberpunk-apartment.glb',
  '/assets/models/cyberpunk-floor.glb',
  '/assets/models/cartoon-race-car.glb',
  '/assets/models/lava-planet.glb',
  '/assets/models/avocado.glb',
  '/assets/models/car-concept.glb',
  '/assets/models/brain-stem.glb',
  '/assets/models/dragon.glb',
  '/assets/models/cesium-man.glb',
  '/assets/models/corset.glb',
]

for (const path of deskModels) {
  useGLTF.preload(path)
}

function preloadOthers() {
  for (const path of otherModels) {
    useGLTF.preload(path)
  }
}

if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(preloadOthers)
} else {
  setTimeout(preloadOthers, 2000)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
