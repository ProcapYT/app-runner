import { isAppRunning, killProcess, launchApp, getFileExtension } from "./runApp.js";
import { exchangeEvents, showPrompt } from "./connections.js";
import { appsDataFile, mainFolderFile } from "./constants.js";
import { createMissingFiles, updateAppsData, userDataFolder, exists, getAppsData } from "./userData.js";

const fs = require("node:fs/promises");
const path = require("node:path");

let currentApp;

const $selectFolderContainer = document.querySelector(".selectFolder");
const $selectFolderButton = document.querySelector("#selectFolderButton");
const $mainContainer = document.querySelector(".mainContainer");
const $appDetailsContainer = document.querySelector(".appDetailsContainer");
const $executableFileInput = document.querySelector("#executableFileInput");
const $appPathText = document.querySelector(".appPathText");
const $launchParametersInput = document.querySelector("#launchParameters");
const $appNameTitle = document.querySelector(".appNameTitle");
const $launchAppButton = document.querySelector(".launchAppButton");
const $renameButton = document.querySelector("#renameButton");
const $normalAppsContainer = document.querySelector(".normalApps");
const $favouriteAppsContainer = document.querySelector(".favouriteApps");
const $favouriteButton = document.querySelector("#favouriteButton");

if (await exists(path.join(userDataFolder, mainFolderFile))) {
    $selectFolderContainer.classList.add("hidden");
    $mainContainer.classList.remove("hidden");

    startMainThread();
}

await createMissingFiles();

$selectFolderButton.addEventListener("click", async () => {
    const folderPath = await exchangeEvents("selectFolder");
    if (!folderPath) return;

    await fs.writeFile(path.join(userDataFolder, mainFolderFile), folderPath, "utf-8");

    $selectFolderContainer.classList.add("hidden");

    startMainThread();
});

async function startMainThread() {
    const mainFolderPath = await fs.readFile(path.join(userDataFolder, mainFolderFile), "utf-8");
    const apps = await fs.readdir(mainFolderPath);
    let appsData = await getAppsData();

    for await (const app of apps) {
        const $appButton = document.createElement("div");
        const $appName = document.createElement("div");
        const $appStatus = document.createElement("div");
        const $appIcon = document.createElement("img");

        if (!Object.hasOwn(appsData, app)) {
            appsData = await updateAppsData(app, {
                executable: "",
                launchParameters: "",
                customAppName: app,
                appName: app,
                isFavourite: false,
            });
        }

        $appButton.dataset.appName = app;
        $appStatus.textContent = "";
        setAppIcon($appIcon, appsData[app].executable);

        $appButton.classList.add("appButton");
        $appName.classList.add("appName");
        $appStatus.classList.add("appStatus");
        $appIcon.classList.add("appIcon");

        $appButton.append($appIcon);
        $appButton.append($appName);
        $appButton.append($appStatus);

        if (appsData[app].isFavourite) {
            $favouriteAppsContainer.classList.remove("hidden");
            $favouriteAppsContainer.append($appButton);
        } else {
            $normalAppsContainer.classList.remove("hidden");
            $normalAppsContainer.append($appButton);
        }

        $appName.textContent = appsData[app].customAppName ?? app;

        $appButton.addEventListener("click", async () => {
            appsData = await getAppsData();

            $appDetailsContainer.classList.remove("hidden");

            if ($appButton.dataset.status == "running") $launchAppButton.dataset.status = "cancel";
            else $launchAppButton.dataset.status = "launch";

            $appNameTitle.textContent = appsData[app].customAppName;
            $appName.textContent = appsData[app].customAppName;

            $appPathText.textContent = path.join(mainFolderPath, app);
            $executableFileInput.value = appsData[app].executable;
            $launchParametersInput.value = appsData[app].launchParameters;
            
            currentApp = app;

            if (appsData[app].isFavourite) $favouriteButton.classList.add("favourite");
            else $favouriteButton.classList.remove("favourite");
        });
    }

    setInterval(() => {
        for (const app of apps) {
            const $appButton = getAppButton(app);
            const appRunning = isAppRunning(app);

            if (appRunning && $appButton) {
                $appButton.dataset.status = "running";
                const $appStatus = $appButton.querySelector(".appStatus");
                $appStatus.textContent = "Running";
            } else if (!appRunning && $appButton) {
                $appButton.dataset.status = "";
                const $appStatus = $appButton.querySelector(".appStatus");
                $appStatus.textContent = "";
            }

            if (appRunning && $appButton.dataset.appName == currentApp) {
                $launchAppButton.dataset.status = "cancel";
            }

            if (!appRunning && $appButton.dataset.appName == currentApp) {
                $launchAppButton.dataset.status = "launch";
            }
        }
    }, 2000);
}

$launchAppButton.addEventListener("click", async () => {
    if ($launchAppButton.dataset.status == "launch") {
        await launchApp(currentApp);
    }

    if ($launchAppButton.dataset.status == "cancel") {
        killProcess(currentApp);
    }
});

$renameButton.addEventListener("click", async () => {
    const newAppName = await showPrompt("Rename App", "New name:", currentApp);
    if (newAppName.trim() == "") return;

    await updateAppsData(currentApp, {
        customAppName: newAppName,
    });

    $appNameTitle.textContent = newAppName;
    
    const $appButton = getAppButton(currentApp);
    const $appName = $appButton.querySelector(".appName");

    $appName.textContent = newAppName;
});

$favouriteButton.addEventListener("click", async () => {
    const $appButton = getAppButton(currentApp);

    if ($favouriteButton.classList.contains("favourite")) {
        $normalAppsContainer.append($appButton);
        $favouriteButton.classList.remove("favourite");
        $normalAppsContainer.classList.remove("hidden");

        if ($favouriteAppsContainer.childNodes.length == 1) $favouriteAppsContainer.classList.add("hidden");
        await updateAppsData(currentApp, { isFavourite: false });
    } else {
        $favouriteAppsContainer.append($appButton);
        $favouriteButton.classList.add("favourite");
        $favouriteAppsContainer.classList.remove("hidden");

        if ($normalAppsContainer.childNodes.length == 1) $normalAppsContainer.classList.add("hidden");
        await updateAppsData(currentApp, { isFavourite: true });
    }
});

$executableFileInput.addEventListener("keydown", async (e) => {
    if (e.key == "Enter") await updateAppDetails();
});

$launchParametersInput.addEventListener("keydown", async (e) => {
    if (e.key == "Enter") await updateAppDetails();
});

$executableFileInput.addEventListener("blur", updateAppDetails);
$launchParametersInput.addEventListener("blur", updateAppDetails);

async function updateAppDetails() {
    await updateAppsData(currentApp, {
        executable: $executableFileInput.value,
        launchParameters: $launchParametersInput.value,
    });

    const $appButton = getAppButton(currentApp);
    const $appIcon = $appButton.querySelector(".appIcon");

    setAppIcon($appIcon, $executableFileInput.value);
}

/**
 * 
 * @param {string} appName 
 * @returns {Element | null}
 */
function getAppButton(appName) {
    for (const $appButton of $favouriteAppsContainer.children) {
        if (!$appButton.hasAttribute("data-app-name")) continue;
        if ($appButton.dataset.appName == appName) return $appButton;
    }

    for (const $appButton of $normalAppsContainer.children) {
        if (!$appButton.hasAttribute("data-app-name")) continue;
        if ($appButton.dataset.appName == appName) return $appButton;
    }
}

/**
 * 
 * @param {Element} $appIcon 
 * @param {string} file 
 */
function setAppIcon($appIcon, file) {
    const fileExt = getFileExtension(file);

    switch (fileExt) {
        case "exe":
            $appIcon.src = path.join("img", "exe.png");
            break;

        case "":
            $appIcon.src = path.join("img", "app.png");
            break;

        case "jar":
            $appIcon.src = path.join("img", "jar.png");
            break;
        
        case "js":
            $appIcon.src = path.join("img", "js.png");
            break;

        case "php":
            $appIcon.src = path.join("img", "php.png");
            break;

        default:
            $appIcon.src = path.join("img", "default.png");
            break;
    }
}
