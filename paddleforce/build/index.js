'use strict'

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

const isDevelopment = process.env.DEBUG;

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

  const window = new BrowserWindow({
    width: width,
    height: height,
  })

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  window.loadURL(`file://${__dirname}/index.html`)

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  function handleRedirect(e, url) {
    console.log('handleRedirect');
    if(url != window.webContents.getURL()) {
      console.log(url);
      e.preventDefault();
      electron.shell.openExternal(url);
    }
  };

  window.webContents.on('new-window', handleRedirect);

  window.setBackgroundColor('#000');

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
