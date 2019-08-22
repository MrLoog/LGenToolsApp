const { app, BrowserWindow , ipcMain} = require('electron')
const basepath = app.getAppPath();
//const appName=  basepath.substring(basepath.lastIndexOf("\\")+1,basepath.length);
const appName='LGenToolsApp'
let win;

function createWindow () {
  console.log('omg');
  var temp='D:/ThangTT/Dropbox/Project/LGenToolsApp';
  //icon: `file://${__dirname}/dist/${appName}/assets/logo.png`
  // Create the browser window.
  win = new BrowserWindow({
    width: 600, 
    height: 600,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/${appName}/assets/logo.png`
  })
  win.loadURL(`file://${temp}/dist/${appName}/index.html`);

  
  

  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

function openModal(){
  const win2 = new BrowserWindow({
    height: 600,
    width: 800
  });

  win2.loadURL('https://www.sitepoint.com');
}

ipcMain.on('openModal', (event, arg) => {
  openModal();
})

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})