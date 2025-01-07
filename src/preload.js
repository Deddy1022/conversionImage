const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sessions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  compress: async (fileBuffer, name, dossier) => await ipcRenderer.invoke("compress", fileBuffer, name, dossier),
  log: (corrompus) => ipcRenderer.invoke("log", corrompus),
  startProcessing: async() => await ipcRenderer.invoke("start-processing")
})