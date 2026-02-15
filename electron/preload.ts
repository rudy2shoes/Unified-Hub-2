import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,

  openApp: (url: string, appId: string): Promise<{ success: boolean; appId?: string; error?: string }> => {
    return ipcRenderer.invoke("open-app", url, appId);
  },

  closeApp: (appId: string): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("close-app", appId);
  },

  showHub: (): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("show-hub");
  },

  getOpenApps: (): Promise<string[]> => {
    return ipcRenderer.invoke("get-open-apps");
  },

  getAppList: (): Promise<any[]> => {
    return ipcRenderer.invoke("get-app-list");
  },
});
