import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged
const DEV_URL = process.env.ELECTRON_START_URL || 'http://localhost:5174'
const PROD_FILE = path.join(__dirname, '../../frontend-admin/dist/index.html')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#FFFDFB',
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false
    }
  })

  // Security: open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(DEV_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(PROD_FILE)
  }

  win.once('ready-to-show', () => win.show())

  // Custom menu (minimal)
  const template = [
    {
      label: 'VÉLORA Admin',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
        { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Backend',
      submenu: [
        { label: `API: ${process.env.VITE_API_URL || process.env.ELECTRON_API_URL || 'http://localhost:5000'}`, enabled: false },
        { label: 'Open Health', click: () => shell.openExternal(`${process.env.VITE_API_URL || 'http://localhost:5000'}/api/health`) },
        { label: 'Open Docs (/docs)', click: () => shell.openExternal(`${process.env.VITE_API_URL || 'http://localhost:5000'}/docs`) }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  return win
}

// IPC: renderer can ask for app info / API url
ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  isPackaged: app.isPackaged,
  apiUrl: process.env.VITE_API_URL || process.env.ELECTRON_API_URL || 'http://localhost:5000',
  platform: process.platform
}))

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Graceful
process.on('uncaughtException', (err) => console.error('[electron] uncaught', err))
