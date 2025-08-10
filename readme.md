# Infinite World

An infinite, procedurally generated 3D world in WebGL using [Three.js](https://threejs.org/), built for fun and exploration.

![Infinite World Screenshot](public/social/share-1200x630.png?raw=true "Infinite World Screenshot")

## Core Features

### 🌍 Procedural Terrain Generation
- **Infinite World**: Seamless infinite terrain using adaptive chunking system
- **Simplex Noise**: Multi-octave noise with configurable lacunarity, persistence, and iterations
- **LOD System**: Adaptive level-of-detail with chunk subdivision based on player distance
- **Web Workers**: Terrain generation runs in background workers for smooth performance
- **Heightmaps**: Real-time normal calculation and terrain texture generation

### 🎮 Player & Camera System
- **3D Player Model**: Realistic human figure with head, torso, arms, and legs using capsule geometry
- **Dual Camera Modes**: 
  - Third-person orbiting camera with mouse controls
  - Free-fly camera for exploration
- **Smooth Movement**: WASD movement with boost mode (Shift)
- **Dynamic Rotation**: Player model rotates to face movement direction
- **Custom Model Support**: Load .glb/.gltf files via debug interface

### 🌅 Dynamic Environment
- **Day/Night Cycle**: Configurable sun position and atmospheric lighting
- **Volumetric Sky**: Custom sky sphere with dawn/dusk effects and sun glow
- **Realistic Grass**: Instanced grass rendering with wind animation and distance culling
- **Water System**: Reflective water plane that follows the player
- **Atmospheric Effects**: Fog rendering and sun reflections

### 🎨 Advanced Rendering
- **Custom Shaders**: Hand-written GLSL shaders for all materials
- **PBR-Style Lighting**: Sun shading, Fresnel reflections, and rim lighting
- **Performance Stats**: Real-time FPS, render time, and GPU query monitoring
- **Responsive Design**: Automatic viewport scaling and mobile device warnings

### 🛠️ Debug & Development Tools
- **Debug Interface**: Comprehensive lil-gui panels for real-time tweaking
- **Live Parameter Control**: Adjust terrain, lighting, and rendering parameters
- **Performance Monitoring**: Built-in stats.js integration with render timing
- **Visual Helpers**: Optional wireframe modes and debug overlays

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### Install & Run

```sh
npm install
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Controls

| Key         | Action                    |
|-------------|---------------------------|
| W/A/S/D     | Move player               |
| Shift       | Boost speed               |
| F           | Toggle fullscreen         |
| P           | Toggle pointer lock       |
| V           | Switch camera mode        |
| B           | Toggle debug interface    |
| Mouse       | Look around (when locked) |
| Space       | Jump (fly mode)           |
| C/Ctrl      | Crouch (fly mode)         |

## Debug Features (Add `#debug` to URL)

### Terrain Controls
- **Noise Parameters**: Lacunarity, persistence, frequency, amplitude
- **Chunk Settings**: Min/max sizes, split ratios, subdivision levels
- **Visual Options**: Wireframe mode, Fresnel lighting controls

### Sky & Lighting
- **Day/Night Cycle**: Manual time control or auto-progression
- **Sun Position**: Direct sun positioning for lighting tests
- **Atmosphere**: Dawn/dusk colors, glow intensity, elevation effects

### Player Customization
- **Model Color**: Real-time player color adjustment
- **Custom Models**: Load .glb/.gltf files from URL or local files
- **Scale Control**: Resize custom player models

### Performance Monitoring
- **FPS Counter**: Real-time frame rate display
- **Render Timing**: GPU render time measurement (WebGL2)
- **Memory Usage**: Triangle counts and buffer statistics

## Custom Player Models

The application supports loading custom 3D player models to replace the default stick figure. This feature allows users to personalize their in-world representation.

### Supported Formats
- **GLTF/GLB**: Industry-standard 3D format (.gltf, .glb)
- **Embedded Textures**: Models with built-in materials and textures
- **Animated Models**: Basic animation support (T-pose recommended)

### Loading Custom Models

#### Method 1: URL Loading
1. Enable debug mode by adding `#debug` to the URL
2. Open the **Player** debug panel
3. In the **Custom Model** section, enter a direct URL to your .glb/.gltf file
4. Click **Load from URL** to apply the model

#### Method 2: Local File Upload
1. Enable debug mode by adding `#debug` to the URL
2. Open the **Player** debug panel
3. In the **Custom Model** section, click **Choose File**
4. Select a .glb or .gltf file from your computer
5. The model will load automatically upon selection

### Model Requirements
- **Scale**: Models are automatically scaled, but optimal size is roughly 1-2 units tall
- **Origin**: Model should be centered at (0,0,0) with Y-up orientation
- **Complexity**: For best performance, keep models under 10,000 triangles
- **Textures**: Embedded textures work best; external texture files may not load

### Model Recommendations
- **T-Pose**: Characters in T-pose work best for the current player system
- **Single Mesh**: Models with a single combined mesh perform better
- **PBR Materials**: Standard PBR materials will render with proper lighting
- **File Size**: Keep files under 5MB for fast loading

### Troubleshooting
- **Model Not Appearing**: Check browser console for loading errors
- **Wrong Size**: Use the scale slider in the debug panel to adjust
- **Missing Textures**: Ensure textures are embedded in the model file
- **Performance Issues**: Reduce model complexity or texture resolution

### Popular Model Sources
- [Sketchfab](https://sketchfab.com/) - Free and paid 3D models
- [Mixamo](https://www.mixamo.com/) - Adobe's free character models
- [Blender](https://www.blender.org/) - Create your own models
- [Ready Player Me](https://readyplayer.me/) - Customizable avatars

## Technical Architecture

### Project Structure
```
sources/
├── Game/
│   ├── Debug/           # Debug UI, stats, and development tools
│   ├── State/           # Game state management and logic
│   │   ├── Camera.js    # Camera modes and controls
│   │   ├── Player.js    # Player movement and physics
│   │   ├── Chunks.js    # Infinite world chunking system
│   │   ├── Terrains.js  # Terrain generation coordinator
│   │   └── DayCycle.js  # Day/night progression
│   ├── View/            # Rendering and visual components
│   │   ├── Camera.js    # Three.js camera wrapper
│   │   ├── Player.js    # Player model rendering
│   │   ├── Grass.js     # Instanced grass system
│   │   ├── Sky.js       # Volumetric sky rendering
│   │   └── Materials/   # Custom shader materials
│   └── Workers/         # Web Workers for background processing
│       ├── Terrain.js   # Terrain mesh generation
│       └── SimplexNoise.js # Noise generation utilities
├── style.css           # Global styles and UI
└── index.js            # Application entry point
```

### Key Technologies
- **[Three.js](https://threejs.org/)**: WebGL rendering and 3D scene management
- **[Vite](https://vitejs.dev/)**: Fast development server and build tool
- **[gl-matrix](http://glmatrix.net/)**: High-performance vector/matrix math
- **[simplex-noise](https://github.com/jwagner/simplex-noise)**: Procedural noise generation
- **[lil-gui](https://github.com/georgealways/lil-gui)**: Runtime parameter tweaking
- **[stats.js](https://github.com/mrdoob/stats.js)**: Performance monitoring
- **Custom GLSL Shaders**: Hand-optimized vertex and fragment shaders

### Performance Optimizations
- **Frustum Culling**: Only render visible chunks
- **Distance-based LOD**: Adaptive mesh detail based on player proximity
- **Instanced Rendering**: Efficient grass blade rendering
- **Web Workers**: Non-blocking terrain generation
- **Texture Atlasing**: Shared terrain heightmap textures
- **Shader Optimization**: Minimal vertex/fragment operations

## Development Notes

- Uses [Vite](https://vitejs.dev/) for fast development and hot reload.
- Custom GLSL shaders are located in `sources/Game/View/Materials/shaders/`.
- Debug UI uses [lil-gui](https://github.com/georgealways/lil-gui) and [stats.js](https://github.com/mrdoob/stats.js).
- Procedural generation uses [simplex-noise](https://github.com/jwagner/simplex-noise) and [gl-matrix](http://glmatrix.net/).

### Production Build

```sh
npm run build
```