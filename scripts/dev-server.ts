/**dev-server with nodemon.js */
import path from 'path';

import nodemon, { NodemonSettings } from 'nodemon';

interface INodemonConfig extends NodemonSettings {
    /**指定需要监视的目录或文件，可以是数组形式 */
    watch: string[];
    /**忽略的根目录 */
    ignoreRoot: string[];
    /**忽略监视的文件或目录 */
    ignore: string[];
}

function runDevServer(config: INodemonConfig) {
    let isRunning = false;
    nodemon(config);
    nodemon
        .on('start', function () {
            !isRunning && console.log('========== ⭐️Nodemon watch has started⭐️ =========\n');
            isRunning = true;
        })
        .on('restart', function (files: any) {
            console.log(`\n=======================================`);
            console.log(`restart due to:\n`, files);
            console.log(`=======================================\n`);
        })
        .on('quit', function () {
            console.log('App has quit');
            process.exit();
        });
}

runDevServer({
    script: path.join(__dirname, '../src/main.ts'),
    watch: ['src'],
    ignoreRoot: ['node_modules', '.git'],
    ignore: ['src/test-ignore.ts'],
});
