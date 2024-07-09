// 导入 Node.js 内置模块和依赖的外部模块
const { execSync } = require('child_process');

const commitMsgFile = process.argv[2];

console.log(commitMsgFile, 'validate-commit-msg.js::6行');
process.exit(1);
// try {
//     // 执行代码检查命令，比如运行 ESLint
//     execSync('npm run lint');

//     // 如果检查成功，则输出成功消息
//     console.log('Lint check passed.');

//     // 退出成功状态码
//     process.exit(0);
// } catch (error) {
//     // 如果检查失败，则输出错误消息
//     console.error('Lint check failed. Commit aborted.', error);

//     // 退出失败状态码
//     process.exit(1);
// }
