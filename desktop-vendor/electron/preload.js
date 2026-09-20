import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  platform: process.platform
})

contextBridge.exposeInMainWorld('appMeta', {
  type: 'desktop',
  role: 'vendor',
  version: '1.0.0'
})

console.log('[preload] VÉLORA Vendor Desktop preload ready — x-app-type: desktop, x-app-role: vendor')
