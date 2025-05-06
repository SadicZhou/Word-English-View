<script lang="ts" setup>
import { onMounted} from "vue";
import { useCategory } from "./hooks";
import {tableConfig} from '@/config/tableConfig'
const { tableData, loading, columns, getTableData, load } = useCategory()
onMounted(() => {
  getTableData();
});
</script>
<template>
    <div class="content">
      <!-- 表格区域 -->
      <div class="table-container">
        <sz-table 
          :tableData="tableData" 
          :columns="columns"
          v-bind="tableConfig"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :loading="loading"
          lazy
          :load="load"
        />
      </div>
    </div>
  </template>
  <style scoped lang="scss">
  .content {
    width: 99%;
    // 搜索卡片样式
    .search-card {
      margin-bottom: 20px;
      
      .keyword {
        font-weight: bold;
        font-size: 15px;
        color: #909399;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 10px;
      }
      
      // 按钮容器样式 - 新增
      .button-container {
        display: flex;
        justify-content: flex-end; // 按钮靠右对齐
        margin-top: 15px;
        
        .el-button {
          margin-left: 10px; // 按钮之间的间距
          
          &:first-child {
            margin-left: 0; // 第一个按钮不需要左边距
          }
        }
      }
      
      // 为搜索栏中的每个元素添加间距
      :deep(.el-row) {
        margin-bottom: 15px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  </style>
  