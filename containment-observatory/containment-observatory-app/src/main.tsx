import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import './index.css'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'

const modelUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/models/${fileName}`

const deskModels = [
  modelUrl('alien-blobby.glb'),
  modelUrl('desk-lamp.glb'),
  modelUrl('retro-screens.glb'),
  modelUrl('server-rack.glb'),
  modelUrl('data-center-rack.glb'),
  modelUrl('neon-bar-sign.glb'),
  modelUrl('hologram-projector.glb'),
  modelUrl('hologram-globe.glb'),
  modelUrl('gem-rock.glb'),
  modelUrl('boombox.glb'),
  modelUrl('chess-set.glb'),
  modelUrl('damaged-helmet.glb'),
  modelUrl('barn-lamp.glb'),
]

const otherModels = [
  modelUrl('doctor-alien.glb'),
  modelUrl('scifi-corridor.glb'),
  modelUrl('retro-tv.glb'),
  modelUrl('neon-sign-japanese.glb'),
  modelUrl('arcade-cabinet.glb'),
  modelUrl('cyberpunk-apartment.glb'),
  modelUrl('cyberpunk-floor.glb'),
  modelUrl('cartoon-race-car.glb'),
  modelUrl('lava-planet.glb'),
  modelUrl('avocado.glb'),
  modelUrl('car-concept.glb'),
  modelUrl('brain-stem.glb'),
  modelUrl('dragon.glb'),
  modelUrl('cesium-man.glb'),
  modelUrl('corset.glb'),
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
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
