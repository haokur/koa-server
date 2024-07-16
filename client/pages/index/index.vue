<template>
    <div class="index">
        <div class="link-list">
            <router-link
                v-for="(item, index) in HomeLinkList"
                class="link-item"
                :to="item.link"
                :key="index"
            >
                {{ index + 1 }}、{{ item.label }}
            </router-link>
        </div>
    </div>
</template>
<script lang="ts" setup>
// import { MultiChannel } from '../../classes/MultiChannel';
import { HomeLinkList } from '../../configs/data.config';

// const wait = async (duration) => {
//     return new Promise<void>((resolve, reject) => {
//         setTimeout(() => {
//             resolve();
//         }, duration);
//     });
// };
// const queue = new MultiChannel(1, () => {});
// queue.addManyTask(
//     [
//         { start: 1, end: 10, index: 0 },
//         { start: 11, end: 20, index: 1 },
//         { start: 11, end: 20, index: 2 },
//         { start: 11, end: 20, index: 3 },
//         { start: 11, end: 20, index: 4 },
//         { start: 11, end: 20, index: 5 },
//     ],
//     async (data, channel) => {
//         console.log(data, 'index.vue::30行');
//         await wait(3000);
//     }
// );
// queue.run();
// queue
//     .pause()
//     .addTask({ start: 99, end: 111, index: 6 }, async (...args) => {
//         console.log(args, 'index.vue::45行');
//     })
//     .run();
</script>
<style lang="scss" scoped>
.link {
    &-list {
        padding: 20px;
    }
    &-item {
        line-height: 1.3;
        display: block;
        margin-bottom: 16px;
    }
}
</style>
