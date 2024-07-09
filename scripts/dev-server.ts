/**dev-server with nodemon.js */
import path from 'path'

import nodemon from 'nodemon'

import { INodemonConfig } from '../@types/nodemon';

function runDevServer(config: INodemonConfig) {
    let isRunning = false
    nodemon(config)
    nodemon
        .on('start', function () {
            !isRunning && console.log('========== ⭐️Nodemon watch has started⭐️ =========\n');
            isRunning = true
        })
        .on('restart', function (files: any) {
            console.log(`\n=======================================`);
            console.log(`restart due to:\n`, files);
            console.log(`=======================================\n`);
        })
        .on('quit', function () {
            console.log('App has quit');
            process.exit();
        })
}

runDevServer({
    script: path.join(__dirname, '../src/main.ts'),
    watch: ["src"],
    ignoreRoot: ["node_modules", '.git'],
    ignore: ['src/test-ignore.ts'],
})