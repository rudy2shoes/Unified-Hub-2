import { app, BrowserWindow, ipcMain, session, BrowserView } from "electron";
import * as path from "path";

const HUB_URL = process.env.HUB_URL || "https://hubhub.co";

let mainWindow: BrowserWindow | null = null;

const appViews: Map<string, BrowserView> = new Map();
let activeViewId: string | null = null;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "HUB Desktop",
    backgroundColor: "#0d0d0d",
    titleBarStyle: "hiddenInset",
    frame: process.platform === "darwin" ? true : false,
    darkTheme: true,
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:hub-main",
    },
  });

  mainWindow.loadURL(HUB_URL);

  mainWindow.on("closed", () => {
    mainWindow = null;
    appViews.clear();
    activeViewId = null;
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.insertCSS(`
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    `);
  });
}

function showAppView(appId: string): void {
  if (!mainWindow) return;

  appViews.forEach((view, id) => {
    if (id !== appId) {
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  });

  const view = appViews.get(appId);
  if (view) {
    const bounds = mainWindow.getContentBounds();
    view.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
    });
    activeViewId = appId;
  }
}

function hideAllViews(): void {
  appViews.forEach((view) => {
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  });
  activeViewId = null;
}

function removeAppView(appId: string): void {
  if (!mainWindow) return;
  const view = appViews.get(appId);
  if (view) {
    mainWindow.removeBrowserView(view);
    (view.webContents as any).destroy?.();
    appViews.delete(appId);
    if (activeViewId === appId) {
      activeViewId = null;
    }
  }
}

ipcMain.handle("open-app", async (_event, url: string, appId: string) => {
  if (!mainWindow) return { success: false, error: "No main window" };

  try {
    let view = appViews.get(appId);

    if (!view) {
      view = new BrowserView({
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          partition: `persist:app-${appId}`,
        },
      });

      mainWindow.addBrowserView(view);
      appViews.set(appId, view);
      await view.webContents.loadURL(url);
    }

    showAppView(appId);
    return { success: true, appId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("close-app", async (_event, appId: string) => {
  removeAppView(appId);
  return { success: true };
});

ipcMain.handle("show-hub", async () => {
  hideAllViews();
  return { success: true };
});

ipcMain.handle("get-open-apps", async () => {
  return Array.from(appViews.keys());
});

ipcMain.handle("get-app-list", async () => {
  try {
    const response = await fetch(`${HUB_URL}/api/apps`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
});

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = `HUBDesktop/1.0.0 ${details.requestHeaders["User-Agent"]}`;
    callback({ requestHeaders: details.requestHeaders });
  });

  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

if (mainWindow) {
  mainWindow.on("resize", () => {
    if (activeViewId && mainWindow) {
      const view = appViews.get(activeViewId);
      if (view) {
        const bounds = mainWindow.getContentBounds();
        view.setBounds({
          x: 0,
          y: 0,
          width: bounds.width,
          height: bounds.height,
        });
      }
    }
  });
}
