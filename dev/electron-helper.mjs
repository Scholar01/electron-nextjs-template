import path from "path";
import {build} from "esbuild";
import child_process from "child_process";


export const rendererPath = path.join(process.cwd(), 'src', 'renderer')
export const mainPath = path.join(process.cwd(), 'src', 'main')
export const preloadPath = path.join(process.cwd(), 'src', 'preload')


export const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));


export const buildMain = async () => {
    await build({
        entryPoints: [path.join(mainPath, 'entry.ts')],
        bundle: true,
        platform: "node",
        outfile: "dist/entry.js",
        external: ["electron"],
        minify: process.env.NODE_ENV === 'production'
    })

    await build({
        entryPoints: [path.join(preloadPath, 'preload.ts')],
        bundle: true,
        platform: "node",
        outfile: "dist/preload.js",
        external: ["electron"],
        minify: process.env.NODE_ENV === 'production'
    })
}

export const buildRenderer = async () => {
    const child = child_process.spawn('npm', ['run', 'build'], {
        cwd: rendererPath,
        stdio: 'inherit',
    })
    return new Promise((resolve, reject) => {
        child.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(code)
            }
        })
    })
}
