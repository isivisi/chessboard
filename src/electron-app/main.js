"use strict";

// Modules to control application life and create native browser window.
const { app, BrowserWindow, ipcMain } = require("electron");
const { resolve } = require("path");
const { format } = require("url");

const isDev = process.env.NODE_ENV === "development";
var mainWindow = null;

app.commandLine.appendSwitch('no-sandbox');

// setup chessboard://{roomCode} deeplink
const deeplinkProtocol = 'chessboard';
if (isDev && process.platform === 'win32') {
	app.setAsDefaultProtocolClient(deeplinkProtocol, process.execPath, [
	  resolve(process.argv[1])
	]);
  } else {
	app.setAsDefaultProtocolClient(deeplinkProtocol);
  }

app.on('open-url', function (event, url) {
	event.preventDefault();
	console.log(url);
	mainWindow.send('joinRoom', url.replace(`${deeplinkProtocol}://`, '').slice(0, -1));
});

// once main vue application is ready for inputs
ipcMain.on('ready', () => {

	if (process.platform !== 'darwin') {
		var deeplinkingUrl = process.argv.find((arg) => arg.startsWith(`${deeplinkProtocol}://`));
	
		if (deeplinkingUrl) {
			console.log(deeplinkingUrl);
			mainWindow.send('joinRoom', deeplinkingUrl.replace(`${deeplinkProtocol}://`, '').slice(0, -1));
		}
	}

});

const createWindow = () => {

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		icon: resolve(__dirname, "./assets/icon.png"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		}
	}); 

	// Remove menu from browser window.
	if (process.env.NODE_ENV != "development") mainWindow.setMenu(null);

	//if (process.env.NODE_ENV != "development") mainWindow.setAspectRatio(1.45);

	// Load the index.html of the app.
	mainWindow.loadURL(process.env.NODE_ENV === "development" ? format({
		hostname: "localhost",
		pathname: "index.html",
		protocol: "http",
		slashes: true,
		port: 8080
	}) : format({
		pathname: resolve(__dirname, "../vue-app/index.html"),
		protocol: "file",
		slashes: true
	}));

	// Open the DevTools.
	if(process.env.NODE_ENV === "development") {
		mainWindow.webContents.openDevTools();
		// require("devtron").install(); // TypeError: electron.BrowserWindow.addDevToolsExtension is not a function
		require("vue-devtools").install();
	}
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => createWindow());

// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
