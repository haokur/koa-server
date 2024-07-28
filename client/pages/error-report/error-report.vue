<template>
    <div class="error-report">
        <div class="report-control">
            <img class="img" v-if="imgUrl" :src="imgUrl" />
            <el-button @click="triggerGlobalError">window.onerror捕获</el-button>
            <el-button @click="triggerListenerError">window.addEventListener捕获</el-button>
            <el-button @click="triggerUnhandledRejection">promise-reject未处理捕获</el-button>
        </div>
        <div class="report-showcase mt20">
            <el-button type="primary" @click="getLogList">刷新日志</el-button>
            <div class="report-showcase__wrap">
                <ul class="report-showcase__list">
                    <li
                        class="report-showcase__item"
                        :class="{ active: item.id === currentLogInfo?.id }"
                        @click="handleLogItemClick(item)"
                        v-for="(item, index) in logList"
                        :key="index"
                    >
                        <h4 class="message">{{ item.content.message }}</h4>
                        <a class="link" :href="item.content.href">{{ item.content.href }}</a>
                        <div class="time">{{ item.content.time }}</div>
                    </li>
                </ul>
                <div class="report-showcase__detail">
                    <div class="log-list">
                        <h3 class="log-row">
                            <label class="label">报错信息：</label>
                            <span class="content">{{ currentLogInfo?.content.message }}</span>
                        </h3>
                        <div class="log-row">
                            <label class="label">访问页面链接：</label>
                            <a :href="currentLogInfo?.content.href">{{
                                currentLogInfo?.content.href
                            }}</a>
                        </div>
                        <div class="log-row">
                            <label class="label">触发时间：</label>
                            <span class="content">{{ currentLogInfo?.content.time }}</span>
                        </div>
                        <div class="log-row">
                            <label class="label">来源：</label>
                            <span class="content">{{ currentLogInfo?.source }}</span>
                        </div>
                        <div class="log-row">
                            <label class="label">类型：</label>
                            <span class="content">{{ currentLogInfo?.content.type }}</span>
                        </div>
                        <div class="log-row">
                            <label class="label">触发元素：</label>
                            <span class="content">{{
                                currentLogInfo?.content.target_element
                            }}</span>
                        </div>
                        <div class="log-row stack">
                            <label class="label">调用堆栈：</label>
                            <div class="content">
                                <div
                                    class="stack-item"
                                    v-for="(stack, i) in currentLogInfo?.content.stacks"
                                    :key="i"
                                >
                                    <div @click="handleStackClick(stack, i)">* {{ stack }}</div>
                                    <div class="stack-item__source" v-if="matchStack[i]">
                                        <!-- <label class="label">Vscode链接：</label> -->
                                        <span>{{ matchStack[i] }}</span>
                                    </div>
                                    <div
                                        class="stack-item__source"
                                        v-if="typeof githubLink[i] === 'string'"
                                    >
                                        <!-- <label class="label">github链接：</label> -->
                                        <a :href="githubLink[i]" target="_blank">{{
                                            githubLink[i]
                                        }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="log-row">
                            <label class="label">userAgent：</label>
                            <span class="content">{{ currentLogInfo?.content.user_agent }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { IErrorItem } from '../../services/error.service';
import { copyText } from '../../utils/common.util';

declare const foo;

const imgUrl = ref('');

onMounted(() => {
    getLogList();
});

// js执行错误，触发window.onerror，window.addEventListener
function triggerGlobalError() {
    console.log(foo);
}

// 加载不存在的资源，触发window.addEventListener
function triggerListenerError() {
    imgUrl.value = 'https://abc.com/a.png';
}

// Promise 的 reject 未捕获
function triggerUnhandledRejection() {
    return new Promise((_, reject) => {
        reject('This is an unhandled rejection');
    });
}

// 获取日志列表
const logList = ref<IErrorItem[]>([]);
const currentLogInfo = ref<IErrorItem | null>(null);
async function getLogList() {
    const result = await fetch(`${$env.baseUrl}/log/query`);
    const data = await result.json();
    logList.value = data.list.map((item) => {
        return { ...item, content: JSON.parse(decodeURIComponent(item.content)) };
    });
}
function handleLogItemClick(item) {
    currentLogInfo.value = item;
    matchStack.value = [];
    githubLink.value = [];
}

function mockLinkClick(url) {
    let el = document.createElement('a');
    el.href = url;
    el.target = '_blank';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

function resolve(...paths) {
    const resolvedPath = paths.reduce((acc, path) => {
        const segments = path.split('/');
        segments.forEach((segment) => {
            if (segment === '..') {
                // Pop the last segment from the accumulator for ".."
                acc.pop();
            } else if (segment !== '.') {
                // Push new segments onto the accumulator
                acc.push(segment);
            }
        });
        return acc;
    }, []);

    return resolvedPath.join('/');
}

/**
 * vscode中打开文件对应行，不原生支持，将命令复制到剪切板，打开命令行粘贴执行
 * code -g //Users/haokur/code/Github/koa-server/client/pages/error-report/error-report.vue:91:16
 */
function openFileLineByVscode(config) {
    const sourceDir = `/Users/haokur/code/Github/koa-server/client/xxxx/xxxx`;
    let { source, line, column } = config;
    let localFilePath = '/' + resolve(sourceDir, source);
    let withLinePath = `${localFilePath}:${line}:${column}`;
    let vscodeCmdStr = `code -g ${withLinePath}`;
    copyText(vscodeCmdStr);
    // mockLinkClick(`vscode:${withLinePath}`);
    return `code -g ${withLinePath}`;
}

/**
 * 代码仓库中打开
 * https://github.com/user/repo/blob/branch/file#L10
 */
function openFileLineByGithub(config) {
    let { source, line } = config;
    const sourceDir = `https://github.com/haokur/koa-server/blob/main/client/xxxx/xxxx`;
    let urlPath = resolve(sourceDir, source);
    const githubUrl = `${urlPath}#L${line}`;
    // mockLinkClick(githubUrl);
    return githubUrl;
}

/**
 * 点击执行堆栈，定位到执行的位置
 * vscode中只能终端使用命令：
 * github代码定位到行
 */
const matchStack = ref<String[]>([]);
const githubLink = ref<String[]>([]);
async function handleStackClick(stack, index) {
    console.log(stack, 'error-report.vue::122行');
    let result = await fetch(`${$env.baseUrl}/log/parse-sourcemap?bundle_path=${stack}`);
    let data = await result.json();
    const vscodeCmdStr = openFileLineByVscode(data);
    const githubUrlStr = openFileLineByGithub(data);
    matchStack.value[index] = vscodeCmdStr;
    githubLink.value[index] = githubUrlStr;
    // openFileLineByGithub(data);

    // github打开
    // console.log(source, 'error-report.vue::134行');
    // let localFilePath = resolve(sourceDir, source);
    // console.log(localFilePath, 'error-report.vue::155行');
    // // code -g //Users/haokur/code/Github/koa-server/client/pages/error-report/error-report.vue:91:16
    // // https://github.com/octocat/Hello-World/blob/main/README.md#L10
    // // mockLinkClick(`vscode:${localFilePath}:${line}:${column}`);
    // console.log(`vscode:${localFilePath}:${line}:${column}`);
    // mockLinkClick(`electron-starter:${localFilePath}`);
}
</script>
<style lang="scss" scoped>
.error-report {
    padding: 20px;
}
.report {
    &-showcase {
        &__wrap {
            margin-top: 16px;
            display: flex;
        }
        &__list {
            width: 400px;
            flex-shrink: 0;
        }
        &__item {
            padding: 10px;
            margin-top: -1px;
            border: 1px solid #e6e6e6;
            cursor: pointer;
            .message {
                word-break: break-all;
            }
            .link {
                display: inline-block;
                margin-top: 8px;
            }
            .time {
                margin-top: 8px;
                color: #666;
            }
            &.active {
                background-color: #e6e6e6;
            }
        }
        &__detail {
            flex: 1;
            padding-left: 16px;
        }
    }
}
.log {
    &-row {
        display: flex;
        margin-bottom: 6px;
        .label {
            flex-shrink: 0;
            width: 120px;
        }
    }
}
.stack {
    &-item {
        margin-bottom: 4px;
        &__source {
            color: blue;
        }
    }
}
</style>
