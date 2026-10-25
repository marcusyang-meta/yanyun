const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let win;
let clickThrough = true;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const w = 380, h = Math.floor(height * 0.85);

  win = new BrowserWindow({
    width: w,
    height: h,
    x: width - w - 10,
    y: Math.floor((height - h) / 2),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile('index.html');

  // Ctrl+Shift+O 切换鼠标穿透
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    clickThrough = !clickThrough;
    win.setIgnoreMouseEvents(clickThrough, { forward: true });
    win.webContents.send('click-through', clickThrough);
  });

  // Ctrl+Shift+X 隐藏/显示
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });

  ipcMain.on('set-click-through', (_, v) => {
    clickThrough = v;
    win.setIgnoreMouseEvents(v, { forward: true });
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => globalShortcut.unregisterAll());
