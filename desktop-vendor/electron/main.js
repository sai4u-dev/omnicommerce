import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged
const DEV_URL = process.env.ELECTRON_START_URL || 'http://localhost:5175'
const PROD_FILE = path.join(__dirname, '../../frontend-vendor/dist/index.html')

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
      sandbox: true
    }
  })

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

  const template = [
    {
      label: 'VÉLORA Vendor',
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
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }]
    },
    {
      label: 'Backend',
      submenu: [
        { label: `API: ${process.env.VITE_API_URL || process.env.ELECTRON_API_URL || 'http://localhost:5000'}`, enabled: false },
        { label: 'Open Health', click: () => shell.openExternal(`${process.env.VITE_API_URL || 'http://localhost:5000'}/api/health`) }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return win
}

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
