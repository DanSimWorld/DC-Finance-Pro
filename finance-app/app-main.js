const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    icon: path.join(__dirname, 'src/assets/icons/dclogo.ico'), // Let op je pad naar assets!
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Check of we in development mode zijn of productie
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    // Na 'ng build' staan je bestanden in dist/dc-finance-pro/browser/index.html
    mainWindow.loadFile(path.join(__dirname, 'dist/dc-finance-pro/browser/index.html'));
  }
}

// Hier gebeurt de echte magie: Opslaan op de harde schijf!
ipcMain.handle('save-data', async (event, { key, data }) => {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data));
  return { success: true };
});

ipcMain.handle('get-data', async (event, key) => {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, `${key}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }
  return null;
});

app.on('ready', createWindow);
