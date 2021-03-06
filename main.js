const { app, globalShortcut, BrowserWindow, shell } = require('electron');
const path = require('path');

const initSideBarToggle = win => {
  let visible = true;

  const toggleSidebar = () => {
    visible = !visible;

    win.webContents.executeJavaScript(`
      document.querySelectorAll(
        '.p-workspace--iap1.p-workspace--context-pane-collapsed'
      )[0].style.gridTemplateColumns = '${visible ? '220px auto' : '0px auto'}';
    `);
  };

  app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+Tab', toggleSidebar);
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+Tab');
  });
};

const initExternalLinks = win => {
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      partition: 'persist:sitePoller'
    }
  });

  const sub = process.env.WORKSPACE ? `${process.env.WORKSPACE}.` : '';

  mainWindow.loadURL(`https://${sub}slack.com/`);
  mainWindow.menuBarVisible = false;

  initSideBarToggle(mainWindow);
  initExternalLinks(mainWindow);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
