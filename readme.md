# Infinite World

Infinite World is a web-based 3D game that showcases an infinitely explorable world generated procedurally using JavaScript, Three.js, and WebGL. The project focuses on demonstrating procedural content generation techniques rather than specific gameplay objectives.

![Infinite World Screenshot](public/social/share-1200x630.png?raw=true "Infinite World Screenshot")

## Key Features

*   Procedurally generated infinite terrain.
*   Real-time 3D graphics rendered with Three.js and WebGL.
*   Dynamic day/night cycle.
*   Basic player character controls for exploration.

## Technologies Used

*   JavaScript
*   Three.js
*   Vite
*   GLSL (for shaders)
*   Simplex Noise (for procedural generation)
*   lil-gui (for UI controls)

## Project Structure

*   `sources/Game/`: Contains the core game logic.
    *   `sources/Game/State/`: Manages the game's internal state (e.g., player position, terrain data, time).
    *   `sources/Game/View/`: Handles the visual representation of the game (e.g., rendering objects, camera).
    *   `sources/Game/Workers/`: Contains scripts for offloading tasks to web workers (e.g., terrain generation).
    *   `sources/Game/Debug/`: Includes utilities for debugging the game.
*   `sources/index.js`: The main entry point for the application.
*   `sources/style.css`: Main stylesheet for the application.

## Instructions

```
npm install
npm run dev
```