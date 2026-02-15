# HUB Desktop App

Desktop application for HUB | Unified Workspace. Built with Electron, providing fully embedded app browsing with persistent login sessions.

## Features

- Every connected app loads inside HUB with its own isolated session
- Logins persist across restarts (including banks and secure sites)
- Available for Mac (.dmg), Windows (.exe), and Linux (.AppImage)

## Setup for Development

```bash
cd electron
npm install
npm start
```

To point at a different HUB instance:
```bash
HUB_URL=https://my-hub.example.com npm start
```

## Building for Distribution

### Automated Builds (Recommended)

Push a version tag to trigger the GitHub Actions build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build the app for Mac, Windows, and Linux
2. Create a GitHub Release with all download files attached

### Manual Build

```bash
cd electron
npm install
npm run build
```

Output files will be in `electron/dist/`.

## Configuration

Set the `HUB_URL` environment variable to point to your HUB instance:
- Default: `https://hubhub.co`
- For GitHub Actions: Set `HUB_URL` as a repository variable in Settings > Secrets and variables > Actions > Variables

## Setting Up GitHub Repository

1. Create a new repository on GitHub (e.g., `hub-desktop`)
2. Push this code to the repository
3. Add `HUB_URL` as a repository variable (Settings > Secrets and variables > Actions > Variables)
4. Create a release by pushing a version tag: `git tag v1.0.0 && git push origin v1.0.0`
5. The GitHub Action will automatically build and create a release with downloadable files
6. Update the download links on your landing page with your GitHub release URL

## Architecture

- **main.ts** — Main process: creates the window, manages BrowserViews for each connected app, handles IPC
- **preload.ts** — Preload script: exposes `window.electronAPI` to the renderer via contextBridge
- Each third-party app opens in its own BrowserView with a separate persistent session (`persist:app-{id}`), so logins are preserved across restarts
