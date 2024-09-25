<template>
  <router-view />
</template>
<script lang="ts" setup>
import { onBeforeMount } from 'vue';

onBeforeMount(()=>{
  const debounce = (fn: any, delay: number) => {
    let timer: number
    return (...args: any) => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: any) {
        callback = debounce(callback, 1);
        super(callback);
    }
}
})


</script>
<style lang="scss"></style>
