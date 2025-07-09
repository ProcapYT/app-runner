import { mainFolderFile, appsDataFile, lastAppsFile } from "./constants.js";
import { userDataFolder, updateAppsData } from "./userData.js"

const { spawn } = require("node:child_process");
const kill = require("tree-kill");
const { ipcRenderer } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const runningApps = {};

/**
 * 
 * @param {string} appPath 
 * @param {string} appName 
 */
export function launchProcess(appPath, appName) {
    let runner = "";
    let extraParams = "";

    if (appPath.endsWith(".js")) runner = "node";
    if (appPath.endsWith(".php")) runner = "php";

    if (appPath.endsWith(".jar")) {
        runner = "java";
        extraParams = "-jar";
    }

    let child;

    if (runner != "") {
        child = spawn(runner, [extraParams, appPath], {
            detached: true,
            stdio: "ignore",
        });
    } else {
        child = spawn(appPath, {
            detached: true,
            stdio: "ignore",
        });
    }

    child.unref();

    runningApps[appName] = child;
}

/**
 * Checks if an app is running and cleans the "running apps" object
 * @param {string} appName 
 * @returns {boolean}
 */
export function isAppRunning(appName) {
    if (!appName in runningApps) return false;

    if (!runningApps[appName]) {
        delete runningApps[appName];
        return false;
    }

    try {
        process.kill(runningApps[appName].pid, 0);
        return true;
    } catch(e) {
        return false;
    }
}

/**
 * 
 * @param {string} appName 
 */
export function killProcess(appName) {
    if (isAppRunning(appName)) {
        kill(runningApps[appName].pid);
    }
}

/**
 * 
 * @param {string} appName 
 */
export async function launchApp(appName) {
    const mainFolderPath = await fs.readFile(path.join(userDataFolder, mainFolderFile), "utf-8");

    const rawDataJson = await fs.readFile(path.join(userDataFolder, appsDataFile), "utf-8");
    const appsData = JSON.parse(rawDataJson);

    if (!Object.hasOwn(appsData, appName)) {
        await updateAppsData(appName, {
            executable: "",
            launchParameters: "",
        });
    }

    launchProcess(path.join(mainFolderPath, appName, appsData[appName].executable) + ` ${appsData[appName].launchParameters}`, appName);

    const rawLastAppsJson = await fs.readFile(path.join(userDataFolder, lastAppsFile));
    const lastApps = JSON.parse(rawLastAppsJson);

    lastApps.reverse();
    lastApps.push(appName);
    
    for (let i = 0; i < lastApps.length - 1; i++) {
        if (lastApps[i] == appName) lastApps.splice(i, 1);
    }

    lastApps.reverse();

    if (lastApps.length > 5) lastApps.splice(5);

    ipcRenderer.send("lastApps", lastApps);

    await fs.writeFile(path.join(userDataFolder, lastAppsFile), JSON.stringify(lastApps), "utf-8");
}

/**
 * 
 * @param {string} file
 * @returns {string} 
 */
export function getFileExtension(file) {
    const extensions = file.split(".");
    return extensions[extensions.length - 1];
}
