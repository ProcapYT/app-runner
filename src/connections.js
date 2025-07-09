const { ipcMain, app, Menu } = require("electron");
const { fileDialog, folderDialog } = require("./dialogs.js");
const prompt = require("electron-prompt");

// Dialogs
ipcMain.on("selectFolder", async (event) => {
    const folderPath = await folderDialog(global.mainWindow);
    event.reply("selectFolder", folderPath);
});

ipcMain.on("selectFile", async (event) => {
    const filePath = await fileDialog(global.mainWindow);
    event.reply("selectFile", filePath);
});

// Paths
ipcMain.on("getUserDataPath", (event) => {
    event.reply("getUserDataPath", app.getPath("userData"));
});

// Context Menu
ipcMain.on("lastApps", (_, lastApps) => {
    const appsMenu = [];

    for (const app of lastApps) {
        appsMenu.push({
            label: app, click: () => {
                global.mainWindow.webContents.send("launchApp", app);
            },
        });
    }

    const contextMenu = Menu.buildFromTemplate([...appsMenu, ...global.constantMenu]);
    global.tray.setContextMenu(contextMenu);
});

// Prompt
ipcMain.on("getPromptValue", async (event, title, label, _default) => {
    const res = await prompt({
        title,
        label,
        value: _default,
        type: "input",
    });

    event.reply("gotPromptValue", res);
});
