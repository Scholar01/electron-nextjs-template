import {app, BrowserWindow} from "electron";
import {CustomScheme} from "./CustomScheme.ts";


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

let mainWindow: BrowserWindow;
/**
 * 初始化窗口
 */
app.whenReady().then(() => {
    let config: any = {
        show: false,
        frame: false,
        minWidth: 1300,
        minHeight: 850,
        width: 1300,
        height: 850,
        webPreferences: {
            nodeIntegration: false, // 不允许使用nodejs
            webSecurity: false,// 禁用同源策略
            allowRunningInsecureContent: true, // 允许不安全的资源被加载
            contextIsolation: true, // 上下文隔离
            sandbox: false, // 沙箱
            webviewTag: true, // 允许使用webview标签
            spellcheck: false, //   禁用拼写检查
            disableHtmlFullscreenWindowResize: true, // 禁用窗口全屏时的窗口大小调整
            //加载preload/preload.ts
            preload: `${__dirname}/preload.js`,
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: true,

    };
    mainWindow = new BrowserWindow(config);
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({mode: "undocked"});
    }


    if (process.argv[2]) {
        mainWindow.loadURL(process.argv[2]).then();
    } else {
        CustomScheme.registerScheme();
        mainWindow.loadURL(`app://index.html`).then();
    }

})

//@ts-ignore
app.on("browser-window-created", (e, win) => {


    win.once("ready-to-show", () => {
        win.show();
    })
})