import { launchApp } from "./runApp.js";

const { ipcRenderer } = require("electron");

/**
 * Sends and recieves an event with a specific name and arguments
 * @param {string} eventName 
 * @param {...any} args 
 * @returns {any}
 */
export function exchangeEvents(eventName, ...args) {
    return new Promise((resolve) => {
        ipcRenderer.send(eventName, ...args);
        ipcRenderer.once(eventName, (_, eventResult) => {
            resolve(eventResult);
        });
    });
}

ipcRenderer.on("launchApp", (_, appName) => {
    launchApp(appName);
});

/**
 * 
 * @param {string} title 
 * @param {string} label 
 * @param {string} _default 
 * @returns {Promise<string>}
 */
export function showPrompt(title, label, _default) {
    return new Promise((resolve) => {
        ipcRenderer.send("getPromptValue", title, label, _default);

        ipcRenderer.once("gotPromptValue", (_, value) => {
            resolve(value);
        });
    });
}
