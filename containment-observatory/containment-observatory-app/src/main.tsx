import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import './index.css'
import App from './App'

useGLTF.preload('/assets/models/alien-blobby.glb')
useGLTF.preload('/assets/models/doctor-alien.glb')
useGLTF.preload('/assets/models/scifi-corridor.glb')
useGLTF.preload('/assets/models/server-rack.glb')
useGLTF.preload('/assets/models/retro-screens.glb')
useGLTF.preload('/assets/models/retro-tv.glb')
useGLTF.preload('/assets/models/desk-lamp.glb')
useGLTF.preload('/assets/models/data-center-rack.glb')
useGLTF.preload('/assets/models/neon-bar-sign.glb')
useGLTF.preload('/assets/models/neon-sign-japanese.glb')
useGLTF.preload('/assets/models/hologram-globe.glb')
useGLTF.preload('/assets/models/hologram-projector.glb')
useGLTF.preload('/assets/models/gem-rock.glb')
useGLTF.preload('/assets/models/arcade-cabinet.glb')
useGLTF.preload('/assets/models/cyberpunk-apartment.glb')
useGLTF.preload('/assets/models/cyberpunk-floor.glb')
useGLTF.preload('/assets/models/cartoon-race-car.glb')
useGLTF.preload('/assets/models/lava-planet.glb')
useGLTF.preload('/assets/models/damaged-helmet.glb')
useGLTF.preload('/assets/models/boombox.glb')
useGLTF.preload('/assets/models/avocado.glb')
useGLTF.preload('/assets/models/car-concept.glb')
useGLTF.preload('/assets/models/brain-stem.glb')
useGLTF.preload('/assets/models/dragon.glb')
useGLTF.preload('/assets/models/cesium-man.glb')
useGLTF.preload('/assets/models/chess-set.glb')
useGLTF.preload('/assets/models/corset.glb')
useGLTF.preload('/assets/models/barn-lamp.glb')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
