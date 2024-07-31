### Koa-server

- [x] nodemon监听变化自动重新执行
- [x] eslint+prettier+cell-speller，代码规范
- [x] husky,提交规范
- [x] koa2基本项目架构配置
- [x] client端使用vue3+vite+ts
- [x] 文件分片上传下载
- [x] ~~SQLite~~Mysql
- [x] Redis
- [x] mysql，redis联动API，数据一致性
- [x] github访问统计svg
- [x] 错误日志上报，sourcemap还原
- [x] 使用c++模块示例
- [x] 使用rust模块示例
- [ ] 音视频


#### 对应文档

- <a href="https://haokur.github.io/business" target="_blank">https://haokur.github.io/business</a>

##### Mysql使用

```typescript
import { SqlService } from '../services/sql.service';

// 创建表
const createResult = await SqlService.createTable({
    tableName: 'user',
    tableComment: '用户表',
    tableColumns: {
        username: 'varchar(255)|false|false|false|用户名',
        email: 'varchar(255)|false|false|false|用户邮箱',
    },
});

// 增
const createResult = await SqlService.insert('user', {
    username:"jack",
    email:"jack@qq.com",
});
// 增加多个
await SqlService.insert('user', 
    [
        { username:"jack", email:"jack@qq.com",},
        { username:"jack2",email:"jack2@qq.com",},
    ]
);

// 删
const deleteResult = await SqlService.delete('user', { username: 'jack' });

// 改
const updateResult = await SqlService.update('user', {
    from: { username: 'jack' },
    to: { username: 'bob' },
});

// 查单个
await SqlService.first('user',{ username: 'jack' });
// 查多个
await SqlService.find('user',{ username: 'jack' })
// 分页查找
await SqlService.findByPage('user',,{ username: 'jack' },{
    pageIndex: 1, pageSize: 4
})
// 查总数
await SqlService.count('user', { username: 'jack' });

```

QueryService中实现的功能，使用QueryService自动处理redis缓存。

##### 环境变量配置

- /.env/.env.example.ini，配置模板
- src/services/config.service.ts 中配置 IKoaConfig
- development 环境使用 .env.development.ini
- production 环境使用 .env.production.ini
- node 启动的 process.env.NODE_ENV 变量注入，由 cross-env 提供兼容
- .gitignore 已忽略各种环境的配置的提交，只留了配置模板

##### c++模块代码目录 `src/cpp/modules`

- 编译 nodejs 能使用的 .node 文件，根目录：npm run build:cpp
- 统一在 src/cpp/index.ts 中定义导出类型和导出的模块
- src/cpp/modules 下定义 c++ 代码
- src/binding.gyp 中定义模块打包
- 多个 sources 打包时会只有最后一个模块的方法，问题待确定

##### 使用 rust 模块，目录 `src/rusts/native`

- 安装 rust 环境：
    - 方式1. `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
    - 方式2. `brew install rust`
    - 方式3. `https://forge.rust-lang.org/infra/other-installation-methods.html` 找到对应系统安装包后，下载后安装
- rust 模块源码，在 `src/rusts/native/src/` 下
- rust 编译，命令行运行 `npm run build:rust`
- 在 `src/rusts/index.ts` 中定义方法类型，且导出 rust 的方法
