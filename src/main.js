const { app, BrowserWindow, Tray, Menu, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

let isQuiting = false;

function createMainWindow() {
    // Main window config
    global.mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, "..", "icon", "64x64.png"), // preferably 16x16 or 32x32
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    global.mainWindow.setTitle("App Runner");
    global.mainWindow.setMenu(null);
    global.mainWindow.loadFile(path.join(__dirname, "..", "public", "index.html"));

    // Open dev tools if the app is not exported
    if (!app.isPackaged) {
        global.mainWindow.openDevTools();
    }

    // Hide the main window instead of closing it
    global.mainWindow.on("close", (event) => {
        if (!isQuiting) {
            event.preventDefault();
            global.mainWindow.hide();
        }
    });
}

app.on("ready", () => {
    createMainWindow();

    let lastApps;

    try {
        const rawJson = fs.readFileSync(path.join(app.getPath("userData"), "last-apps.json"), "utf-8");
        lastApps = JSON.parse(rawJson);
    } catch {
        lastApps = [];
    }

    const appsMenu = [];

    for (const app of lastApps) {
        appsMenu.push({
            label: app, click: () => {
                global.mainWindow.webContents.send("launchApp", app);
            }
        });
    }

    global.constantMenu = [
        {
            label: "Open App Runner", click: () => {
                global.mainWindow.show();
            }
        },
        {
            label: "Exit", click: () => {
                isQuiting = true;
                app.quit();
            }
        }
    ];

    global.tray = new Tray(path.join(__dirname, "..", "icon", "16x16.png"));
    const contextMenu = Menu.buildFromTemplate([...appsMenu, ...global.constantMenu]);

    global.tray.setToolTip("App Runner Background");
    global.tray.setContextMenu(contextMenu);

    global.tray.on("double-click", () => {
        global.mainWindow.show();
    });

    if (!fs.existsSync(app.getPath("userData"))) {
        fs.mkdirSync(app.getPath("userData"));
    }
});

app.on("window-all-closed", () => {
    // On macOS it is comon not closing the full app
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (global.mainWindow == null) {
        createMainWindow();
    } else {
        global.mainWindow.show();
    }
});

require("./connections.js");
