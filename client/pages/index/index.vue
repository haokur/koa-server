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
import { onMounted } from 'vue';
import { HomeLinkList } from '../../configs/data.config';

onMounted(() => {});
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
