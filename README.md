![App Runner](./icon/horizontal.png)

App runner is a program that runs apps that are just executables in folders, it gives a GUI with configurations on how to run each app.

## Requisites
To install the app you don't need anything, just download the installer and run it.
To use the app in developer mode, edit it... You need:

- Node.js 20.x.x^ ([Node JS Download](https://nodejs.org/en/download))
- Npm.js 9.x.x^ (Will be automaticly installed with node.js)

## Usage
If you want to change some things for yourself follow the next steps

### Start
To run the app in developer mode do this: (running it in developer mode will automaticly open the developer tools)

1. Clone the repository
2. Install all the necesary packages: `npm i` or `npm install`
3. Create a filed called `fontawesomeLoader.js` in the directory `/public/`, you'll need to get a fontawesome kit, (the fontawesome icons used are free), you can get your kit here: [Fontawesome Kits](https://fontawesome.com/kits) and then put this content in the `fontawesomeLoader.js`:
```js
const $script = document.createElement("script");
$script.src = "your_fontawesome_kit.js"; // Put your kit here
$script.crossOrigin = "anonymous";
document.head.append($script);
```
4. Start the program by running `npm start` or `npx electron .`

### Build
To build the app (make it an installer or executable .exe, .deb, .appimage ...):

1. Modify the `"build"` in the `package.json` to be what you like, it should look something like this:
```json
{
    "build": {
        "appId": "com.sam.apprunner",
        "productName": "App Runner",
        "win": {
            "icon": "icon/256x256.png",
            "target": "nsis"
        },
        "nsis": {
            "oneClick": false,
            "perMachine": false,
            "allowToChangeInstallationDirectory": true
        },
        "mac": {
            "target": "dmg",
            "icon": "icon/256x256.png"
        },
        "linux": {
            "target": [
                "deb"
            ],
            "icon": "icon"
        }
    },
}
```
2. Linux: run `npm run build-linux` (by default it's .deb)
3. Windows: run `npm run build-win` (by default it's nsis, .exe installer)
4. Mac: run `npm run build-mac` (by default it's .dmg)

## Used resources

- Icons from [Flaticon](https://www.flaticon.com/), designed by:
  - Logo: [Judanna](https://www.flaticon.com/authors/judanna) — License [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  - Images: [FauzIDEA](https://www.flaticon.com/authors/fauzidea) — License [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

- Icons from [Font Awesome](https://fontawesome.com/) — License [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
