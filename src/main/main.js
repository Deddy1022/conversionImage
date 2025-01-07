const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const os = require("os");
const { createDirectory } = require("../shared/createDirectory");
const { convertImage } = require("../helpers/convertImage");
const { writeLog } = require("../shared/logApp");

let corrompus = 0;

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
  ipcMain.handle("compress", async (event, fileBuffer, name, dossier) => {
    const fileDir = path.join(os.homedir(), "./Downloads/Compressed");
    imageDir = path.join(fileDir, dossier);
    createDirectory(imageDir);
    const outputPath = path.join(imageDir, `${name}.jpeg`);
    const corrompusParDossier = {};

    const result = await convertImage(fileBuffer, name, outputPath, imageDir, dossier, corrompusParDossier);

    return {
      success: result.success,
      corrompusParDossier: result.corrompuParDossier,
    };
  });

  ipcMain.handle("log", async(event, corrompu) => {
    const fileDir = path.join(os.homedir(), "./Downloads/Compressed");
    for(const [dossier, total] of Object.entries(corrompu)) {
      const result = total ? "KO": "OK"
      writeLog(`Retour sur la compression de ${dossier}`, fileDir, `${result}, ${total} corrompu(s)`)
    }
  })

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});