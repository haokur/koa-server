### Koa-server

- [x] nodemon监听变化自动重新执行
- [x] eslint+prettier+cell-speller，代码规范
- [x] husky,提交规范
- [x] koa2基本项目架构配置
- [x] client端使用vue3+vite+ts
- [x] 文件分片上传下载
- [x] ~~SQLite~~Mysql
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

##### 环境变量配置

- /.env/.env.example.ini，配置模板
- src/services/config.service.ts 中配置 IKoaConfig
- development 环境使用 .env.development.ini
- production 环境使用 .env.production.ini
- node 启动的 process.env.NODE_ENV 变量注入，由 cross-env 提供兼容
- .gitignore 已忽略各种环境的配置的提交，只留了配置模板