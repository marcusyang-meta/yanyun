const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('overlay', {
  onClickThrough: (cb) => ipcRenderer.on('click-through', (_, v) => cb(v)),
  setClickThrough: (v) => ipcRenderer.send('set-click-through', v),
});
