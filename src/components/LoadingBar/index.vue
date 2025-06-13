<template>
    <transition name="loading-bar">
        <div v-if="isLoading" class="loading-bar">
            <div class="loading-bar-inner" :style="{ width: progress + '%' }"></div>
        </div>
    </transition>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 响应式数据
const isLoading = ref(false);
const progress = ref(0);
let timer: number | null = null;

/**
 * 开始加载进度条
 */
const start = () => {
    isLoading.value = true;
    progress.value = 0;

    // 模拟更真实的进度增长
    const increment = () => {
        if (progress.value < 90) {
            // 根据当前进度调整增长速度，越接近90%越慢
            const randomIncrement = Math.random() * (15 - progress.value * 0.1);
            progress.value = Math.min(progress.value + randomIncrement, 90);

            // 动态调整间隔时间
            const interval = 80 + Math.random() * 40;
            timer = setTimeout(increment, interval);
        }
    };

    // 立即开始并快速达到10%
    progress.value = 10;
    setTimeout(increment, 50);
};

/**
 * 完成加载进度条
 */
const finish = () => {
    progress.value = 100;

    setTimeout(() => {
        isLoading.value = false;
        progress.value = 0;
    }, 200);

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};

/**
 * 出错时的处理
 */
const error = () => {
    progress.value = 100;

    setTimeout(() => {
        isLoading.value = false;
        progress.value = 0;
    }, 500);

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};

// 清理定时器
onUnmounted(() => {
    if (timer) {
        clearTimeout(timer);
    }
});

// 暴露方法
defineExpose({
    start,
    finish,
    error
});
</script>

<style scoped lang="scss">
.loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 9999;
    background-color: rgba(255, 255, 255, 0.1);
}

.loading-bar-inner {
    height: 100%;
    background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
    transition: width 0.2s ease;
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
}

// 进度条显示/隐藏动画
.loading-bar-enter-active,
.loading-bar-leave-active {
    transition: opacity 0.3s ease;
}

.loading-bar-enter-from,
.loading-bar-leave-to {
    opacity: 0;
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
    .loading-bar {
        background-color: rgba(0, 0, 0, 0.2);
    }
}
</style>