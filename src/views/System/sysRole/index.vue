<template>
  <div class="content">
    <el-row>
      <el-col :span="4">
        <el-input
          v-model="searchForm.roleName"
          style="width:95%"
          placeholder="请输入角色名"
          :prefix-icon="Search"
        />
      </el-col>
      <el-col :span="2">
        <el-button type="success" :icon="Search" @click="getRoleList(searchForm.roleName)">搜索</el-button>
      </el-col>
    </el-row>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="roleName" label="角色名" />
      <el-table-column prop="roleCode" label="角色编码" />
      <el-table-column prop="description" label="备注" />
      <el-table-column fixed="right" label="操作">
        <template #default>
          <el-button link type="primary" size="small" @click="handleClick">
            详情
          </el-button>
          <el-button link type="primary" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="page">
      <el-pagination
        size="small"
        background
        layout="prev, pager, next"
        :total="totalNum"
        class="mt-4"
        :page-sizes:="pageNationConfig.pageSizes"
        v-model:current-page="current"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { onMounted, reactive, ref } from "vue";
import { roleList } from "@/service/api";
import { pageNationConfig } from "@/config/pageConfig";
const handleClick = () => {
  console.log("click");
};
const searchForm = reactive({
  roleName:''
})
let tableData = ref<SYSTEM.role[]>([]);
let totalNum = ref(0);
let current = ref(1);
const getRoleList = async (roleName:string="") => {
  try {
    const { data } = await roleList({ current: 1, limit: 10, roleName: roleName});
    console.log(data, "====>rolelist");
    const { list, total, pageNum } = data;
    tableData.value = list;
    totalNum.value = total;
    current.value = pageNum;
    console.log(tableData, "tableData");
  } catch (error) {
    console.log(error);
    return [];
  }
};
onMounted(() => {
  getRoleList();
});
</script>
<style scoped lang="scss">
.content {
  width: 98%;
  .page {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
