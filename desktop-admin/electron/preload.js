import { contextBridge, ipcRenderer } from 'electron'

// Secure bridge: only expose minimal safe API
contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  platform: process.platform
})

// Also expose appType for backend header injection in renderer
contextBridge.exposeInMainWorld('appMeta', {
  type: 'desktop',
  role: 'admin',
  version: '1.0.0'
})

console.log('[preload] VÉLORA Admin Desktop preload ready — x-app-type: desktop, x-app-role: admin')
