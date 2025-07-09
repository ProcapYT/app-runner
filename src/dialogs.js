const { dialog } = require("electron");

async function folderDialog(window) {
    const result = await dialog.showOpenDialog(window, {
        title: "Select a folder",
        properties: ["openDirectory"],
    });

    if (!result.canceled) {
        return result.filePaths[0];
    }
}

async function fileDialog(window) {
    const result = await dialog.showOpenDialog(window, {
        title: "Select a file",
        properties: ["openFile"],
    });

    if (!result.canceled) {
        return result.filePaths[0];
    }
}

module.exports = { folderDialog, fileDialog };
