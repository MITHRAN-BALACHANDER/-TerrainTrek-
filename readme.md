# Infinite World

An infinite, procedurally generated 3D world in WebGL using [Three.js](https://threejs.org/), built for fun and exploration.

![Infinite World Screenshot](public/social/share-1200x630.png?raw=true "Infinite World Screenshot")

## Features

- **Procedural Terrain:** Infinite terrain generation using noise and chunking.
- **Day/Night Cycle:** Dynamic sun and sky simulation.
- **Player Movement:** WASD controls, pointer lock, and multiple camera modes (fly/third-person).
- **Debug Tools:** Toggle debug UI and performance stats with `#debug` hash or `B` key.
- **Custom Shaders:** Realistic grass, water, sky, and terrain materials using GLSL.
- **Responsive UI:** In-game controls and mobile warning overlay.

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

| Key         | Action                |
|-------------|-----------------------|
| W/A/S/D     | Move                  |
| F           | Fullscreen            |
| P           | Pointer lock          |
| V           | Switch view mode      |
| B           | Toggle debug UI       |

## Project Structure

- `sources/` - Main source code
	- `Game/` - Core game logic, state, debug, and workers
	- `View/` - Rendering, materials, shaders, and scene objects
	- `style.css` - Main styles
- `public/` - Static assets (images, social previews)
- `index.html` - App entry point
- `vite.config.js` - Vite configuration (with GLSL plugin)

## Development Notes

- Uses [Vite](https://vitejs.dev/) for fast development and hot reload.
- Custom GLSL shaders are located in `sources/Game/View/Materials/shaders/`.
- Debug UI uses [lil-gui](https://github.com/georgealways/lil-gui) and [stats.js](https://github.com/mrdoob/stats.js).
- Procedural generation uses [simplex-noise](https://github.com/jwagner/simplex-noise) and [gl-matrix](http://glmatrix.net/).

### Production Build

```sh
npm run build
```