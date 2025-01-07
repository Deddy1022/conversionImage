const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sessions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  compress: async (fileBuffer, input, name, dossier) => await ipcRenderer.invoke("compress", fileBuffer, input, name, dossier),
  startProcessing: async() => await ipcRenderer.invoke("start-processing")
})