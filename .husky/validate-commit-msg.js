// 仅验证第一行提交的开头
const gitTypes = {
    feat: '新功能',
    fix: '修复 bug',
    docs: '仅文档更改',
    style: '不影响代码含义的更改（空白、格式、缺少分号等）',
    refactor: '既不修复 bug 也不添加功能的代码更改',
    perf: '提高性能的代码更改',
    test: '添加缺失的测试或更正现有的测试',
    build: '影响构建系统或外部依赖的更改（例如：gulp、broccoli、npm）',
    ci: '更改 CI 配置文件和脚本（例如：Travis、Circle、BrowserStack、SauceLabs）',
    chore: '其他不修改 src 或 test 文件的更改',
    revert: '撤销先前的提交',
};
const gitTypeKeys = Object.keys(gitTypes);

const commitMsgFile = process.argv[2];
if (!gitTypeKeys.some((key) => commitMsgFile.startsWith(`${key}: `))) {
    console.error(
        `\n提交信息有误，请以${gitTypeKeys.join('，')}里面的一项开头，注意冒号后面的空格。\n`,
    );
    gitTypeKeys.forEach((key) => {
        console.log(`- ${key}，${gitTypes[key]}`);
    });
    console.log(`\n例如：\n\nfeat: ${commitMsgFile}\n\n- 完成登录页开发\n`);
    process.exit(1);
} else {
    fs.writeFile(commitMsgFile, newCommitMsg, 'utf8', (err) => {
        if (err) {
            console.error('Error writing commit message file:', err);
            process.exit(1);
        }
        process.exit(0);
    });
    process.exit(0);
}
