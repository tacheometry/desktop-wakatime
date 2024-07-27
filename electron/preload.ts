import { contextBridge, ipcRenderer } from "electron";

import { IpcKeys } from "./utils/constants";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  sendSync(...args: Parameters<typeof ipcRenderer.sendSync>) {
    const [channel, ...omit] = args;
    return ipcRenderer.sendSync(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  getSetting(section: string, key: string, internal = false) {
    return ipcRenderer.sendSync(IpcKeys.getSetting, section, key, internal);
  },
  setSetting(section: string, key: string, value: string, internal = false) {
    ipcRenderer.send(IpcKeys.setSetting, section, key, value, internal);
  },
  isMonitored(path: string) {
    return ipcRenderer.sendSync(IpcKeys.isMonitored, path);
  },
  setMonitored(path: string, monitor: boolean) {
    ipcRenderer.send(IpcKeys.setMonitored, path, monitor);
  },
  getInstalledApps() {
    return ipcRenderer.sendSync(IpcKeys.getApps);
  },
  getAppVersion() {
    return ipcRenderer.sendSync(IpcKeys.getAppVersion);
  },
  shouldLaunchOnLogIn() {
    return ipcRenderer.sendSync(IpcKeys.shouldLaunchOnLogin);
  },
  setShouldLaunchOnLogIn(shouldLaunchOnLogIn: boolean) {
    ipcRenderer.send(IpcKeys.setShouldLaunchOnLogin, shouldLaunchOnLogIn);
  },
  shouldLogToFile() {
    return ipcRenderer.sendSync(IpcKeys.shouldLogToFile);
  },
  setShouldLogToFile(shouldLogToFile: boolean) {
    ipcRenderer.send(IpcKeys.setShouldLogToFile, shouldLogToFile);
  },
});
