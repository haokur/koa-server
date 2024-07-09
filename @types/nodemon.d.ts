import { NodemonSettings } from 'nodemon';

export interface INodemonConfig extends NodemonSettings {
    /**指定需要监视的目录或文件，可以是数组形式 */
    watch: string[];
    /**忽略的根目录 */
    ignoreRoot: string[];
    /**忽略监视的文件或目录 */
    ignore: string[];
}
