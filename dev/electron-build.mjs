import path from "path";
import {buildMain, buildRenderer} from "./electron-helper.mjs";
import fs from "fs";
import {build as ebuild, Platform} from "electron-builder";

process.env.NODE_ENV = 'production'

//为生产环境准备package.json
async function preparePackageJson() {
    let pkgJsonPath = path.join(process.cwd(), "package.json");
    let localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    let electronConfig = localPkgJson.devDependencies.electron.replace("^", "");
    localPkgJson.main = "entry.js";
    delete localPkgJson.devDependencies;
    delete localPkgJson.scripts;
    localPkgJson.devDependencies = {electron: electronConfig};
    let tarJsonPath = path.join(process.cwd(), "dist", "package.json");
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson));
    fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"), {recursive: true});

}


/**
 * 获取安装包配置
 */
function getInstallerConfig() {
    let pkgJsonPath = path.join(process.cwd(), "package.json");
    let localPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"))
    return {
        protocols: {
            name: "Deeplink Example",
            schemes: [
                "deeplink"
            ]
        },

        compression: "normal",
        removePackageScripts: true,

        nodeGypRebuild: false,
        buildDependenciesFromSource: false,

        directories: {
            output: path.join(process.cwd(), "release"),
            app: path.join(process.cwd(), "dist"),
        },

        files: ["**"],

        // extraFiles: [
        //     {}
        // ],

        productName: localPkg.productName,
        appId: localPkg.appId,

        asar: true,

        win: {
            target: [
                {
                    "target": "nsis",
                    "arch": [
                        "x64"
                    ]
                }],
            artifactName: '${productName}-${version}-Windows-${arch}.${ext}',
        },
        nsis: {
            deleteAppDataOnUninstall: true,
            differentialPackage: true,
            oneClick: false,
            perMachine: false,
            allowToChangeInstallationDirectory: true,
        },

        mac: {
            "target": [
                {
                    "target": "dmg",
                    "arch": ["arm64"] // 添加 "x64" 和 "arm64" 以支持 Intel 和 Apple Silicon 平台
                },
                {
                    "target": "zip",
                    "arch": ["arm64"] // 添加 "x64" 和 "arm64" 以支持 Intel 和 Apple Silicon 平台
                }
            ],
            artifactName: '${productName}-${version}-${arch}.${ext}',
            hardenedRuntime: true,
            gatekeeperAssess: true,
        },
        dmg: {
            iconSize: 100,
            contents: [
                {
                    x: 255,
                    y: 85,
                    type: "file"
                },
                {
                    x: 253,
                    y: 325,
                    type: "link",
                    path: "/Applications"
                }
            ],
            window: {
                width: 500,
                height: 500
            }
        },

        linux: {
            desktop: {
                StartupNotify: "false",
                Encoding: "UTF-8",
                MimeType: "x-scheme-handler/deeplink"
            },
            target: [
                {
                    "target": "AppImage",
                    "arch": [
                        "x64",
                    ]
                },
            ]

        },
        deb: {
            priority: "optional",
        },
        rpm: {},


        // icon: path.join(process.cwd(), "public", 'assets', "icon.png"),


    };
}


await buildRenderer()
await buildMain()
await preparePackageJson()
const config = getInstallerConfig()
let macFiles = await ebuild({
        targets: Platform.MAC.createTarget(),
        config: config
    }
)

console.log('> Build finished')
