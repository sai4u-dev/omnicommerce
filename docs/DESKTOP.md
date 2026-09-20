# Desktop — Electron 32 (Admin + Vendor)

> Wraps `frontend-admin :5174` + `frontend-vendor :5175` Vite builds → native `BrowserWindow` (`contextIsolation` + `preload`).

## Packages

* **Admin** `desktop-admin` `com.velora.admin` `VÉLORA Admin` `main electron/main.js` `type:module`, scripts `dev: wait-on 5174 && electron .` + `dev:standalone: concurrently vite + wait-on` + `build: pnpm --filter frontend-admin build && electron-builder`, `pack|dist` `electron-builder`, deps `electron-store`, devDeps `electron 32, electron-builder 25, concurrently 9, wait-on 8`, `build.appId com.velora.admin, productName, directories output release, files [electron/**/*, ../frontend-admin/dist/**/*], win nsis, mac dmg, linux AppImage`.
* **Vendor** `desktop-vendor` `com.velora.vendor` similarly `wait-on 5175`.

## Main Process `electron/main.js:1`

```js
import {app, BrowserWindow, Menu, shell, ipcMain} from 'electron'
import path from 'path'
const __filename = fileURLToPath(import.meta.url), __dirname = path.dirname(__filename)
const isDev = !app.isPackaged
const DEV_URL = process.env.ELECTRON_START_URL || 'http://localhost:5174|5175'
const PROD_FILE = path.join(__dirname, '../../frontend-*/dist/index.html')
function createWindow(){
  const win = new BrowserWindow({
    width:1400, height:900, minWidth:1100, minHeight:700, show:false,
    backgroundColor:'#FFFDFB', titleBarStyle:'hiddenInset', autoHideMenuBar:true,
    webPreferences:{preload: path.join(__dirname,'preload.js'), contextIsolation:true, nodeIntegration:false, sandbox:true}
  })
  win.webContents.setWindowOpenHandler(({url})=>{ if(url.startsWith('http')) shell.openExternal(url); return {action:'deny'}})
  if(isDev) win.loadURL(DEV_URL), win.webContents.openDevTools({mode:'detach'}); else win.loadFile(PROD_FILE)
  win.once('ready-to-show', ()=>win.show())
  const template = [{label:'VÉLORA Admin', submenu:[{role:'about'}, {role:'reload'}, {role:'toggleDevTools'}, {role:'quit'}]}, ...Edit/View/Backend API/Open Health/Open Docs]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
ipcMain.handle('get-app-info', ()=>({version:app.getVersion(), isPackaged, apiUrl: VITE_API_URL||ELECTRON_API_URL||:5000, platform:process.platform}))
app.whenReady().then(()=>{createWindow(); app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0) createWindow()})})
app.on('window-all-closed', ()=>{if(process.platform!=='darwin') app.quit()})
```

## Preload `electron/preload.js:1`

```js
import {contextBridge, ipcRenderer} from 'electron'
contextBridge.exposeInMainWorld('electronAPI', {getAppInfo: ()=>ipcRenderer.invoke('get-app-info'), platform: process.platform})
contextBridge.exposeInMainWorld('appMeta', {type:'desktop', role:'admin|vendor', version:'1.0.0'})
```

Renderer `src/api/client.js` still `x-app-type:desktop, x-app-role:admin|vendor` (reads `window.appMeta` if present).

## Run

```bash
# needs frontend up (turbo dev runs webs by default)
pnpm dev                                    # backend + 4 webs (desktop excluded)
pnpm --filter desktop-admin dev             # wait-on 5174 → Electron (fails if 5174 not up)
# standalone (spawns own Vite on 5174, may collide with pnpm dev → 5177 fallback)
pnpm --filter desktop-admin run dev:standalone
pnpm --filter desktop-vendor run dev:standalone
# all including desktop
pnpm dev:all                                # turbo run dev (14 packages, desktop waits)

# build installers (needs web dist first)
pnpm --filter frontend-admin build          # vite 33 modules → dist
pnpm --filter desktop-admin build           # → desktop-admin/release (nsis/dmg/AppImage)
pnpm --filter frontend-vendor build && pnpm --filter desktop-vendor build
pnpm --filter desktop-admin run pack        # --dir (unpackaged)
```

## Troubleshooting

* `Error: Electron failed to install correctly` → `pnpm-workspace.yaml` now `allowBuilds: electron:true, electron-builder:true, esbuild:true` → `pnpm install` shows `electron postinstall$ node install.js Done` (Node 24, `allowBuilds` true). If still fails: `rm -rf node_modules/.pnpm/electron*` + `rm node_modules/.modules.yaml` + `pnpm install`.
* `Port 5174/5175 is in use` → `pnpm dev` already runs Vite on `5174|5175`; `desktop dev:standalone` spawns second Vite → `5177|5178` fallback (wait-on still 5174 succeeds because first Vite exists, but second Vite is waste). Use `dev` (wait-only) when `pnpm dev` is running.
* `Failed to connect to localhost:5174` → `wait-on` 60s timeout, ensure `frontend-admin dev` is up and `CORS_ORIGIN` allows.

## Packaging & Updates

* `electron-builder` `appId`, `productName VÉLORA Admin|Vendor`, `win: nsis, mac: dmg (notarize), linux: AppImage`, `files` includes `electron/**/*` + `../frontend-*/dist/**/*`.
* `electron-updater` + S3/CloudFront for auto-update (stub: add `autoUpdater` in `main.js`, `release` → S3).

See `ARCHITECTURE.md` for `x-app-*`, `../README.md#quick-start` for `pnpm dev` ports.
