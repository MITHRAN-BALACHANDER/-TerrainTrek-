# TerrainTrek

> **A high-performance, infinite 3D procedural world built with WebGL, Three.js, and modern web technologies**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://terrain-trek.mithran.app/)
[![Built with Three.js](https://img.shields.io/badge/three.js-r149-blue)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

"TerrainTrek - Infinite Procedural World")

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [Controls](#controls)
- [Game Features](#game-features)
- [Debug Mode](#debug-mode)
- [Performance](#performance)
- [Browser Compatibility](#browser-compatibility)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**TerrainTrek** is a cutting-edge web-based 3D exploration game featuring an infinite procedurally generated world. Built from the ground up using Three.js and WebGL, it showcases advanced graphics programming, real-time terrain generation, and optimized performance architecture.

### What Makes It Special?

- **60fps Performance** - Maintains smooth gameplay through aggressive optimization
- **Truly Infinite World** - Explore endlessly with dynamic chunk loading/unloading
- **Custom Shader Pipeline** - All visual effects written in GLSL from scratch
- **Cross-Platform** - Desktop (mouse/keyboard) and mobile (touch controls) support
- **Zero Audio Files** - Procedurally synthesized sound effects via Web Audio API
- **Persistent Progress** - LocalStorage-based save system

---

## Key Features

### Procedural World Generation

#### Infinite Terrain System
- **Adaptive Chunking**: Quadtree-based spatial partitioning for efficient world management
- **LOD (Level of Detail)**: 4-level subdivision system based on player distance
- **Simplex Noise Algorithm**: Multi-octave noise generation with configurable parameters
  - Lacunarity, persistence, frequency, and amplitude controls
  - Seeded generation for reproducible worlds
- **Web Worker Architecture**: Terrain generation offloaded to background threads
- **Real-time Heightmaps**: Dynamic normal calculation and elevation data
- **Seamless Transitions**: Zero visible seams between chunk boundaries

#### Technical Specs
- **Min Chunk Size**: 64 units
- **Max Depth**: 4 subdivision levels
- **View Distance**: Dynamic based on chunk size (up to 512 units)
- **Generation Time**: <16ms per chunk (non-blocking)

---

### Player & Camera Systems

#### Player Character
- **3D Humanoid Model**: Procedurally generated capsule-based figure
  - Head, torso, arms, and legs with proper proportions
  - Dynamic rotation to face movement direction
  - Smooth interpolation for natural movement
- **Movement Mechanics**:
  - WASD directional controls with 8-way movement
  - Boost mode (Shift) for 3x speed multiplier
  - Terrain-following elevation tracking
  - Velocity-based momentum

#### Camera Modes (3)
1. **Third-Person View (3PV)** - Default orbiting camera
   - Mouse-controlled orbit with smooth damping
   - Distance: 12-15 units from player
   - Auto-follows player movement
   
2. **Second-Person View (2PV)** - Close over-the-shoulder
   - Tighter camera angle for detail viewing
   - Enhanced immersion

3. **First-Person/Fly Mode (FPV)** - Free exploration
   - Unrestricted camera movement
   - Decoupled from player model
   - Ideal for debugging and screenshots

#### Custom Model Support
- **GLB/GLTF Loader**: Import custom 3D models via debug UI
- **File Sources**: URL or local file upload
- **Scale Controls**: Adjust model size dynamically
- **Material Override**: Optional color customization

---

### Dynamic Environment

#### Day/Night Cycle
- **Configurable Duration**: Default 15-second cycle (adjustable)
- **Automatic Progression**: Smooth time-of-day transitions
- **Manual Override**: Direct time control via debug panel
- **Sun Position**: Real-time sun movement affects lighting

#### Volumetric Sky System
- **Custom Sky Sphere**: Hand-written shader with atmospheric scattering
- **Dawn/Dusk Gradients**: Color transitions based on sun elevation
- **Sun Glow Effect**: Volumetric bloom around sun position
- **Starfield**: Procedural night sky with twinkling stars
- **Atmospheric Fog**: Distance-based fog matching sky color

#### Environmental Details
- **Instanced Grass Rendering**:
  - 40,000+ individual grass blades per chunk
  - Wind animation via shader displacement
  - Distance culling for performance (fade at 100+ units)
  - Per-blade randomization (height, width, rotation)
- **Water System**:
  - Reflective plane with Fresnel effects
  - Follows player to maintain visual consistency
  - Shader-based ripple animation
- **Terrain Texturing**:
  - Slope-based coloring (grass → rock → snow)
  - Height-based biome coloring
  - Triplanar mapping for seamless textures

---

### Advanced Graphics Pipeline

#### Custom GLSL Shaders (8+)
All visual effects are hand-coded shaders, no pre-built materials:

1. **TerrainMaterial** - Advanced terrain rendering
   - Triplanar mapping
   - Slope-based texturing
   - Sun shading with Fresnel
   - Fog integration

2. **GrassMaterial** - Instanced vegetation
   - Wind animation (sin/cos waves)
   - Distance-based alpha fading
   - Sun shading and ambient occlusion

3. **SkySphereMaterial** - Volumetric atmosphere
   - Rayleigh scattering simulation
   - Sun glow with radial gradient
   - Day/night color interpolation

4. **SkyBackgroundMaterial** - Far-field rendering
   - Gradient color mixing
   - Horizon line definition

5. **WaterMaterial** - Reflective water
   - Fresnel reflections
   - Animated normal maps
   - Depth-based transparency

6. **CoinMaterial** - Collectible rendering
   - Metallic/gold appearance
   - Rotation animation
   - Emission glow

7. **PlayerMaterial** - Character rendering
   - Cel-shading style
   - Rim lighting
   - Customizable color

8. **StarsMaterial** - Night sky
   - Point sprite rendering
   - Twinkling animation

#### Rendering Features
- **PBR-Style Lighting**: Physically-based shading models
- **Sun Shading**: Directional lighting with configurable intensity
- **Fresnel Effects**: View-angle dependent reflections
- **Rim Lighting**: Edge highlighting for depth
- **Fog Rendering**: Exponential distance fog
- **Normal Mapping**: Real-time normal calculation for terrain

---

### Game Mechanics

#### Collectible System
- **20 Procedurally Placed Coins**: 
  - Distributed in circular pattern with randomization
  - Float 2 units above terrain elevation
  - Golden animated models with glow effect
- **Collection Detection**:
  - Horizontal radius: 2.0 units
  - Vertical tolerance: 3.0 units (accounts for terrain following)
  - Shatter animation on collection (0.5s duration)
- **Visual Feedback**:
  - Particle burst effect
  - Sound effect on collection
  - UI counter update

#### Progression System
- **Experience Points (XP)**:
  - Gain XP from coin collection (10 XP each)
  - Mission completion rewards (100-500 XP)
  - Level-up formula: `xpToNextLevel = level * 100`
- **Level System**:
  - Starts at level 1
  - Animated level-up popup with celebration
  - Speed multiplier increases with level
- **Player Attributes**:
  - Health: 100/100 (extendable system)
  - Stamina: 100/100 with regeneration
  - Speed: Scales from 1.0x up (level-based)
- **Persistence**: Auto-saves to LocalStorage

#### Mission System (5 Mission Types)
1. **Collect Missions** - "Collect N coins"
   - Targets: 5, 10, 20 coins
   - Rewards: 100-500 XP + bonus coins

2. **Reach Missions** - "Travel N meters from spawn"
   - Distance tracking from starting position
   - Reward: 150 XP + 15 coins

3. **Speed Missions** - "Collect N coins in X seconds"
   - Time-limited collection challenge
   - Reward: Variable based on difficulty

4. **Exploration Missions** - "Visit different areas"
   - Encourages world exploration

5. **Time Trial Missions** - "Complete objectives quickly"
   - Countdown timer with urgency

**Mission UI Features**:
- Modern card-based design with progress bars
- Real-time progress tracking
- Completion popup with rewards display
- Auto-advance to next mission

#### Stamina System
- **Sprint Mechanic**: Holding Shift drains stamina
- **Regeneration**: Auto-refills when not sprinting
- **Visual Indicator**: (Placeholder for future UI bar)

---

### Audio System

#### Web Audio API Implementation
- **Zero External Files**: All sounds procedurally generated
- **Oscillator-Based Synthesis**: Custom waveform generation
- **Sound Effects**:
  - **Coin Collection**: A major chord (A5-C#6-E6)
  - **Level Up**: Ascending arpeggio (C5-E5-G5-C6)
  - **Mission Complete**: Triumphant chord progression
  - **Footsteps**: White noise with low-pass filter
  - **Ambient Drone**: Low-frequency background (110-220Hz)
- **Volume Controls**: Separate music and SFX sliders
- **Master Gain**: Global volume adjustment
- **Auto-Init**: Activates on first user interaction (browser policy)

---

### User Interface

#### HUD Elements
- **Stats Panel** (Top-left):
  - Level indicator with gold color
  - Speed multiplier in real-time
  - Coin counter
  - Compact design (110-260px width)
  - Semi-transparent background with backdrop filter

- **Mission Panel** (Top-left, below stats):
  - Current mission title and objective
  - Progress bar with percentage
  - Close/minimize button
  - Modern gradient styling

- **Minimap** (Bottom-right):
  - Real-time radar visualization
  - Player position indicator (green dot)
  - Coin positions (gold dots)
  - Responsive sizing (100-180px, 12% of viewport)
  - Circular design with backdrop blur
  - Camera mode toggle button integrated

#### Mobile Support
- **Virtual Joystick**:
  - Touch-based directional control
  - Left-side positioning (configurable)
  - Visual feedback with gradient knob
  - Supports both touch and pointer events
  - Responsive sizing based on viewport
- **Touch Gestures**:
  - Tap to lock pointer
  - Pinch/zoom support (future enhancement)
- **Orientation Handling**: Auto-adjusts on device rotation
- **Viewport Warnings**: Alerts for non-ideal aspect ratios

---

### Debug & Development Tools

#### Debug Interface (`#debug` in URL)
Access comprehensive development tools via lil-gui panels:

##### State Controls
- **Day/Night Cycle**:
  - Auto-update toggle
  - Manual time scrubbing (0-1)
  - Duration adjustment (5-100 seconds)
  
- **Terrain Parameters**:
  - Noise frequency, amplitude
  - Lacunarity (2.0-4.0)
  - Persistence (0.1-1.0)
  - Octave count
  - Chunk min/max sizes
  - Split ratio per size

- **Sun Controls**:
  - Elevation angle
  - Azimuth position
  - Intensity multiplier
  - Color temperature

- **Camera Settings**:
  - FOV adjustment
  - Near/far plane
  - Camera mode switching

##### Visual Options
- **Wireframe Mode**: Toggle mesh visualization
- **Chunk Boundaries**: Display quadtree structure
- **Normal Visualization**: Show surface normals
- **LOD Levels**: Color-code by subdivision depth

##### Player Customization
- **Model Color**: RGB sliders
- **Model Loader**: URL or file upload
- **Scale Factor**: 0.1-10x
- **Movement Speed**: Base speed multiplier

#### Performance Monitoring
- **Stats.js Integration**:
  - FPS counter (real-time)
  - Frame time (ms)
  - Memory usage (MB)
- **GPU Timing** (WebGL2):
  - Render pass duration
  - Draw call count
- **Profiling Data**:
  - Triangle count
  - Active chunks
  - Generated terrain vertices

---

## Getting Started

### Prerequisites

- **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
- **npm**: v7+ (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/terraintrek.git
cd terraintrek

# Install dependencies
npm install

# Start development server
npm run dev
The application will open at [http://localhost:5173](http://localhost:5173)
```bash
# Clone the repository
npm run preview
cd -TerrainTrek-

# Install dependencies
npm install

# Start development server
npm run dev
```
```

Output will be in the `dist/` directory.

---

## Controls

### Keyboard (Desktop)

| Key | Action |
|-----|--------|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Move player (forward/left/backward/right) |
| <kbd>Shift</kbd> | Sprint/boost speed (3x multiplier) |
| <kbd>Space</kbd> | (Reserved for future jump mechanic) |
| <kbd>F</kbd> | Toggle fullscreen mode |
| <kbd>P</kbd> | Toggle pointer lock |
| <kbd>V</kbd> | Cycle camera modes (3PV → 2PV → FPV) |
| <kbd>B</kbd> | Toggle debug interface visibility |
| <kbd>Esc</kbd> | Release pointer lock |

### Mouse (Desktop)

| Input | Action |
|-------|--------|
| **Move** | Look around (when pointer locked) |
| **Click** | Lock pointer (for camera control) |
| **Scroll** | (Reserved for future zoom control) |

### Touch (Mobile)

| Gesture | Action |
|---------|--------|
| **Joystick** | Move player directionally |
| **Tap** | Lock pointer / interact |
| **Minimap Button** | Cycle camera modes |

---

## Technical Architecture

### Technology Stack

#### Core Technologies
- **Three.js** (r149) - WebGL rendering engine
- **GLSL** - Custom shader programming
- **JavaScript (ES6+)** - Modern syntax with modules
- **Vite** - Build tool and dev server
- **gl-matrix** - Efficient vector/matrix operations
- **simplex-noise** - Procedural noise generation

#### Libraries & Tools
- **lil-gui** (0.17) - Debug interface
- **stats.js** (0.17) - Performance monitoring
- **seedrandom** (3.0) - Deterministic random generation
- **events** - EventEmitter pattern for decoupling

### Architecture Patterns

#### Singleton Pattern
Core systems (Game, State, View, Debug) use singleton pattern for global access:
```javascript
Game.getInstance()
State.getInstance()
View.getInstance()
```

#### Event-Driven Communication
Components communicate via EventEmitter:
```javascript
this.chunks.events.on('create', (chunk) => { ... })
```

#### Separation of Concerns
- **State** (`/State/*`): Game logic, data, and calculations
- **View** (`/View/*`): Rendering, visuals, and Three.js objects
- **Debug** (`/Debug/*`): Development tools and monitoring

#### Web Worker Architecture
Terrain generation runs in dedicated worker:
```javascript
// Main thread
worker.postMessage({ type: 'generate', data })

// Worker thread (Terrain.js)
onmessage = (e) => { /* Generate terrain */ }
```

### File Structure

```
3d-world/
├── sources/
│   ├── index.js                 # Entry point
│   ├── style.css               # Global styles
│   └── Game/
│       ├── Game.js             # Main game loop
│       ├── State/              # Game logic layer
│       │   ├── State.js        # State coordinator
│       │   ├── Player.js       # Player mechanics
│       │   ├── Camera.js       # Camera controller
│       │   ├── Chunks.js       # Chunk manager
│       │   ├── Terrains.js     # Terrain state
│       │   ├── Coins.js        # Collectible logic
│       │   ├── Progression.js  # XP/Level system
│       │   ├── Missions.js     # Mission system
│       │   ├── Audio.js        # Sound system
│       │   ├── Controls.js     # Input handling
│       │   ├── DayCycle.js     # Time system
│       │   ├── Sun.js          # Sun positioning
│       │   └── Time.js         # Delta time tracking
│       ├── View/               # Rendering layer
│       │   ├── View.js         # View coordinator
│       │   ├── Renderer.js     # WebGL renderer
│       │   ├── Camera.js       # Three.js camera
│       │   ├── Player.js       # Player visual
│       │   ├── Chunks.js       # Chunk visuals
│       │   ├── Terrain.js      # Terrain mesh
│       │   ├── Grass.js        # Instanced grass
│       │   ├── Sky.js          # Sky sphere
│       │   ├── Water.js        # Water plane
│       │   ├── CoinsView.js    # Coin rendering
│       │   ├── Minimap.js      # Radar UI
│       │   ├── Joystick.js     # Touch controls
│       │   └── Materials/      # Custom shaders
│       │       ├── TerrainMaterial.js
│       │       ├── GrassMaterial.js
│       │       ├── SkySphereMaterial.js
│       │       ├── WaterMaterial.js
│       │       ├── CoinMaterial.js
│       │       ├── PlayerMaterial.js
│       │       ├── StarsMaterial.js
│       │       └── shaders/    # GLSL files
│       │           ├── terrain/
│       │           ├── grass/
│       │           ├── skySphere/
│       │           ├── player/
│       │           ├── coin/
│       │           └── partials/  # Shared functions
│       ├── Workers/
│       │   ├── Terrain.js      # Terrain gen worker
│       │   └── SimplexNoise.js # Noise utilities
│       └── Debug/
│           ├── Debug.js        # Debug coordinator
│           ├── Stats.js        # Performance stats
│           └── UI.js           # lil-gui panels
├── public/                     # Static assets
├── index.html                  # HTML entry
├── vite.config.js             # Build config
└── package.json               # Dependencies
```

---

## ⚡ Performance

### Optimization Techniques

#### Rendering Optimizations
- **Frustum Culling**: Only render visible chunks
- **LOD System**: Reduce polygon count at distance
- **Instanced Rendering**: Single draw call for 40k+ grass blades
- **Shader Optimizations**: Minimize texture lookups, vectorized operations
- **Geometry Pooling**: Reuse BufferGeometry instances

#### Memory Management
- **Chunk Disposal**: Proper cleanup of Three.js resources
- **Worker Offloading**: Terrain generation doesn't block main thread
- **Texture Atlas**: (Future) Single texture for multiple materials
- **Garbage Collection**: Manual disposal of unused objects

#### Target Metrics
- **60 FPS** on modern hardware (GTX 1060 / RX 580 equivalent)
- **30-45 FPS** on integrated graphics (Intel Iris / AMD Vega 8)
- **<16ms** frame time for smooth gameplay
- **<500MB** memory usage

### Performance Tips
- Enable hardware acceleration in browser settings
- Close unnecessary tabs to free up GPU memory
- Use debug mode to disable grass for low-end systems
- Reduce window size on integrated graphics

---

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 90+ | Best performance, WebGL2 support |
| **Firefox** | 88+ | Excellent performance, WebGL2 support |
| **Safari** | 14+ | Good performance, some WebGL2 limitations |
| **Edge** | 90+ | Chromium-based, same as Chrome |
| **Opera** | 76+ | Chromium-based, same as Chrome |

### Required Features
- ✅ WebGL2 (falls back to WebGL1 with reduced features)
- ✅ Web Workers
- ✅ ES6 Modules
- ✅ LocalStorage
- ✅ Pointer Lock API
- ✅ Fullscreen API
- ✅ Web Audio API

### Mobile Support
- **iOS Safari**: 14+ (iPhone 8 or newer recommended)
- **Android Chrome**: 90+ (mid-range devices, 2020+)
- **Performance**: Limited by mobile GPU, reduced grass density recommended

---

## 🔧 Development

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code (if configured)
npm run lint

# Format code (if configured)
npm run format
```

### Debug Mode

Add `#debug` to the URL to enable developer tools:

```
http://localhost:5173/#debug
```

Features unlocked:
- lil-gui control panels
- Performance stats overlay
- Wireframe rendering toggle
- Real-time parameter tweaking
- Custom model loading
- Chunk visualization

### Adding Custom Shaders

1. Create shader files in `sources/Game/View/Materials/shaders/`
2. Create a Material class extending `THREE.ShaderMaterial`
3. Import vertex/fragment shaders using Vite's GLSL plugin
4. Add material to relevant view component

Example:
```javascript
import vertexShader from './shaders/myshader/vertex.glsl'
import fragmentShader from './shaders/myshader/fragment.glsl'

export default class MyMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: { /* ... */ }
    })
  }
}
```

### Modifying Terrain Generation

Edit `sources/Game/Workers/Terrain.js` to change generation algorithm:

```javascript
// Adjust noise parameters
const frequency = 0.02
const amplitude = 20
const octaves = 4
```

---

## Deployment

### Static Hosting (Recommended)

The built application is a static site and can be deployed to:

#### Vercel (Easiest)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Drag dist/ folder to netlify.com/drop
```

#### GitHub Pages
```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

#### Cloudflare Pages
```bash
# Connect repo to Cloudflare Pages dashboard
# Build command: npm run build
# Output directory: dist
```

### Environment Variables

No environment variables required for base deployment.

### Production Checklist

- [ ] Update demo URL in README badges
- [ ] Add Google Analytics (optional)
- [ ] Configure CDN for assets
- [ ] Enable gzip/brotli compression
- [ ] Set up custom domain
- [ ] Add meta tags for SEO
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Configure CSP headers
- [ ] Add sitemap.xml

---

## Contributing

Contributions are welcome! Please follow these guidelines:

### Reporting Bugs

Open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Submitting Features

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ES6+ features
- Follow existing file structure
- Comment complex algorithms
- Keep functions focused and small
- Write descriptive variable names
- Use camelCase for variables, PascalCase for classes

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 TerrainTrek Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## Acknowledgments

### Technologies & Libraries
- [Three.js](https://threejs.org/) - 3D rendering engine
- [Vite](https://vitejs.dev/) - Lightning-fast build tool
- [lil-gui](https://lil-gui.georgealways.com/) - Lightweight GUI controls
- [simplex-noise](https://github.com/jwagner/simplex-noise.js) - Noise generation

### Inspiration
- Minecraft's infinite world generation
- No Man's Sky's procedural universe
- Sebastian Lague's procedural terrain tutorials

### Resources
- [The Book of Shaders](https://thebookofshaders.com/)
- [Three.js Journey](https://threejs-journey.com/) by Bruno Simon
- [WebGL Fundamentals](https://webglfundamentals.org/)

---

## Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/MITHRAN-BALACHANDER/-TerrainTrek-/issues)
- **Discussions**: [Join community discussions](https://github.com/MITHRAN-BALACHANDER/-TerrainTrek-/discussions)
- **Contact**: https://github.com/MITHRAN-BALACHANDER (preferred contact / profile)

---

<div align="center">

**[Back to Top](#terraintrek)**

Made with WebGL

</div>
