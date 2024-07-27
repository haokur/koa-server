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
                                    * {{ stack }}
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
    &-list {
    }
    &-item {
    }
    &-row {
        display: flex;
        margin-bottom: 6px;
        .label {
            flex-shrink: 0;
            width: 120px;
        }
        .content {
        }
    }
}
.stack {
    &-item {
        margin-bottom: 4px;
    }
}
</style>
