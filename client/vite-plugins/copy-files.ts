import fs from 'fs-extra';

interface IConfig {
    from: string;
    to: string;
    ext: string[];
}
export default function copyPlugin(config: IConfig) {
    return {
        name: 'copy-plugin',
        // apply: 'build', // 应用在 build 阶段
        async closeBundle() {
            const sourceFolder = config.from; // 源文件夹
            const targetFolder = config.to; // 目标文件夹

            try {
                // 创建目标文件夹
                await fs.ensureDir(targetFolder);

                // 指定要复制的文件后缀
                const fileExtensions = config.ext;
                //  ['.txt', '.pdf', '.jpg']; // 示例后缀，根据实际需要修改

                // 遍历源文件夹，复制符合后缀的文件到目标文件夹
                await Promise.all(
                    fileExtensions.map(async (ext) => {
                        const files = await fs.readdir(sourceFolder);
                        const filteredFiles = files.filter((file) => file.endsWith(ext));
                        await Promise.all(
                            filteredFiles.map(async (file) => {
                                // 构建源文件和目标文件路径
                                const sourceFile = `${sourceFolder}/${file}`;
                                const targetFile = `${targetFolder}/${file}`;

                                // 复制文件到目标文件夹
                                await fs.move(sourceFile, targetFile, { overwrite: true });

                                // 输出日志
                                console.log(`Copied '${sourceFile}' to '${targetFile}'`);

                                // 删除原文件
                                await fs.remove(sourceFile);

                                // 输出日志
                                console.log(`Deleted '${sourceFile}'`);
                            })
                        );
                    })
                );
                console.log('Copied files with specified extensions:', fileExtensions.join(', '));
            } catch (error) {
                console.log(error, 'copy-files.ts::19行');
            }
        },
    };
}
