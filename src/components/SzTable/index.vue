<template>
    <div>
        <el-table :data="tableData" v-bind="$attrs" v-loading="loading">
            <el-table-column v-bind="{...column.cofing}"  v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" />
        </el-table>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
defineProps({
    tableData: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    columns: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    total: {
        type: Number,
        default: 0
    },
    tableConfig: {
        type: Object as PropType<any>,
        default: () => {}
    }
})
</script>

<style scoped>

</style>