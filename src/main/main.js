const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const os = require("os");
const { createDirectory } = require("../shared/createDirectory");
const { convertImage } = require("../helpers/convertImage");

const isDev = process.env.environment !== "production";
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      nodeIntegration: true,
    }
  });

  // const mainMenu = Menu.buildFromTemplate(menu);
  // Menu.setApplicationMenu(mainMenu);
  
  if(isDev) mainWindow.webContents.openDevTools();
  mainWindow.loadFile("./index.html");
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  ipcMain.handle("compress", async (event, fileBuffer, input, name, dossier) => {
    const fileDir = path.join(os.homedir(), "./Downloads/Compressed");
    imageDir = path.join(fileDir, dossier);
    createDirectory(imageDir);
    const outputPath = path.join(imageDir, `${name}.jpeg`);
    await convertImage(fileBuffer, name, outputPath, imageDir);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});