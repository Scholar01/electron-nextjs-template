import {spawn} from 'child_process';
import * as path from 'path';
import {build} from "esbuild";
import chokidar from "chokidar";
import chalk from 'chalk';


const rendererPath = path.join(process.cwd(), 'src', 'renderer')
const mainPath = path.join(process.cwd(), 'src', 'main')
const preloadPath = path.join(process.cwd(), 'src', 'preload')
let electronProcess = null;


async function start() {
    const startRendererProcess = () => {
        const child = spawn('npm', ['run', 'dev'], {
            cwd: rendererPath,
            stdio: 'inherit',
        })

        child.on('close', (code) => {
            console.log(`Renderer process exited with code ${code}`)
            process.exit(code);
        })
        return child
    }

    const startMainProcess = async () => {
        await build({
            entryPoints: [path.join(mainPath, 'entry.ts'), path.join(preloadPath, 'preload.ts')],
            bundle: true,
            platform: "node",
            outdir: 'dist',
            external: ["electron"],
        })
        electronProcess = spawn('electron', ["./dist/main/entry.js", 'http://localhost:3000'], {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        electronProcess.addListener('exit', process.exit)
    }

    const killAllProcesses = () => {

        if (mainWatcher) {
            mainWatcher.close();
        }

        if (electronProcess) {
            electronProcess.kill('SIGINT');
        }

        if (renderer) {
            renderer.kill('SIGINT');
        }


    }

    const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
    process.on('SIGINT', killAllProcesses);
    process.on('SIGTERM', killAllProcesses);
    process.on('exit', killAllProcesses);

    const renderer = startRendererProcess();

    await waitFor(3000);
    await startMainProcess();
    const mainWatcher = chokidar.watch([mainPath, preloadPath], {
        ignored: /(^|[\/\\])\../,
        ignoreInitial: true,
    }).on('all', async (event, path) => {
        console.log(`> ${chalk.bold.green("Main")} process file changed: ${path}`)
        if (electronProcess) {
            electronProcess.removeListener('exit', process.exit);
            electronProcess.kill('SIGINT');
            console.log(`> ${chalk.bold.cyan("Main")} process restarted with PID: ${electronProcess.pid}`)
            await startMainProcess();
        }
    })

}


start();