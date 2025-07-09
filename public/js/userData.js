import { exchangeEvents } from "./connections.js";
import { appsDataFile, lastAppsFile } from "./constants.js";

const path = require("node:path");
const fs = require("node:fs/promises");

export const userDataFolder = await exchangeEvents("getUserDataPath");
export const lastAppsPath = path.join(userDataFolder, lastAppsFile);
export const appsDataPath = path.join(userDataFolder, appsDataFile);

export async function createMissingFiles() {
    if (!await exists(appsDataPath)) {
        await fs.writeFile(appsDataPath, "{}", "utf-8");
    }

    if (!await exists(lastAppsPath)) {
        await fs.writeFile(lastAppsPath, "[]", "utf-8");
    }
}

/**
 * 
 * @param {object} appsData 
 */
export async function writeAppsData(appsData) {
    const strAppsData = JSON.stringify(appsData, null, 4);
    await fs.writeFile(appsDataPath, strAppsData, "utf-8");
}

/**
 * 
 * @param {string} appName 
 * @param {object} data 
 * @returns {Promise<object>}
 */
export async function updateAppsData(appName, data) {
    const rawJson = await fs.readFile(appsDataPath, "utf-8");
    const appsData = JSON.parse(rawJson);

    appsData[appName] = {
        ...(appsData[appName] ?? {}),
        ...data,
    };

    const strAppsData = JSON.stringify(appsData, null, 4);
    await fs.writeFile(appsDataPath, strAppsData, "utf-8");

    return appsData;
}

/**
 * 
 * @returns {Promise<object>}
 */
export async function getAppsData() {
    const rawJson = await fs.readFile(appsDataPath, "utf-8");
    const appsData = JSON.parse(rawJson);
    return appsData;
}

/**
 * 
 * @param {string} dir 
 * @returns {Promise<boolean>}
 */
export async function exists(dir) {
    try {
        await fs.access(dir);
        return true;
    } catch {
        return false;
    }
}
