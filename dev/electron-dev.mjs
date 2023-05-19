import {spawn} from 'child_process';
import chokidar from "chokidar";
import chalk from 'chalk';
import {buildMain, mainPath, preloadPath, rendererPath, waitFor} from "./electron-helper.mjs";

process.env.NODE_ENV = 'development'


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
        await buildMain();
        electronProcess = spawn('electron', ["./dist/entry.js", 'http://localhost:3000'], {
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