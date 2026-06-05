const { app, BrowserWindow, ipcMain, dialog, globalShortcut, screen } = require('electron')
const path = require('path')

let splash
let win
let isMini = false

function createWindow() {

  win = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false, // 🔥 ВАЖНО
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  win.loadFile('index.html')
  win.setMenu(null)

  // Показываем только когда готово
  win.once("ready-to-show", () => {
    if (splash) splash.close()
    win.show()
  })
}

function toggleMiniMode() {

  if (!win) return

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize

  if (!isMini) {

    const miniWidth = 380
    const miniHeight = 600
    const x = screenWidth - miniWidth - 20
    const y = Math.floor((screenHeight - miniHeight) / 2)

    win.setBounds({ x, y, width: miniWidth, height: miniHeight })
    win.setAlwaysOnTop(true)
    win.setResizable(false)

    win.webContents.send('mini-mode', true)

    isMini = true

  } else {

    win.setBounds({ width: 1000, height: 700 })
    win.center()
    win.setAlwaysOnTop(false)
    win.setResizable(true)

    win.webContents.send('mini-mode', false)

    isMini = false
  }
}

app.whenReady().then(() => {

  // Splash
  splash = new BrowserWindow({
    width: 400,
    height: 250,
    frame: false,
    alwaysOnTop: true,
    transparent: true
  })

  splash.loadFile('splash.html')

  createWindow()

  globalShortcut.register('Control+Shift+B', () => {
    toggleMiniMode()
  })

})

ipcMain.handle('select-program', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe'] }]
  })

  if (result.canceled) return null
  return result.filePaths[0]
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})