<template>
  <div class="content">
    <el-card :body-style="cardPad" class="mt-10">
      <el-row>
        <el-col :span="2">
          <el-button size="small" type="primary" :icon="Plus" @click="addClick"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-card>
    <div class="conheight">
      <el-table :data="tableData" v-bind="{ ...tableConfig }" row-key="id">
        <el-table-column prop="title" label="菜单标题" />
        <el-table-column prop="component" label="路由名称" />
        <el-table-column prop="sortValue" label="排序" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            {{ row.status == 1 ? "可用" : "禁用" }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column fixed="right" label="操作">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="updateClick(row)"
            >
              详情
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="deleteClick(row)"
              >删除</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="addChildren(row)"
              >添加子菜单</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
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
  <el-dialog v-model="dialogShow" width="500">
    <template #header>
      <div class="titStyle">{{ title }}</div>
    </template>
    <el-form :model="menu" v-bind="{ ...formConfig }">
      <el-form-item label="菜单标题" v-bind="{ ...formItemConfig }">
        <el-input v-model="menu.title" autocomplete="off" />
      </el-form-item>
      <el-form-item label="路由名称" v-bind="{ ...formItemConfig }">
        <el-input v-model="menu.component" autocomplete="off" />
      </el-form-item>
      <el-form-item label="排序" v-bind="{ ...formItemConfig }">
        <el-input v-model="menu.sortValue" autocomplete="off" />
      </el-form-item>
      <el-form-item label="状态" v-bind="{ ...formItemConfig }">
        <el-radio-group v-model="menu.status">
      <el-radio :value="1">正常</el-radio>
      <el-radio :value="0">禁用</el-radio>
    </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="cancelHandler">取消</el-button>
        <el-button type="primary" @click="confirmHandler()"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, Plus } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import {deleteById, save, update} from "@/service/menu"
import { pageNationConfig } from "@/config/pageConfig";
import { cardPad } from "@/config/cardConfig";
import { formConfig, formItemConfig } from "@/config/formConfig";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { tableConfig } from "@/config/tableConfig";
import { Code } from "@/config/code";
import { menuList } from "@/service/menu";
import { HOOKS } from "@/hooks";

let dialogShow = ref(false);
const menu = reactive<SYSTEM.menu>({
  title: "",
  component: "",
  status: 1,
  sortValue:1,
  parentId:0
});
let title = ref("");
let tableData = ref<SYSTEM.menu[]>([]);
let totalNum = ref(0);
let current = ref(1);

const getMenuList = async () => {
  try {
    const res = await menuList();
    console.log(res.data, "====>menuList");
    tableData.value = res.data;
    console.log(tableData, "tableData");
  } catch (error) {
    console.log(error);
    return [];
  }
};
const updateClick = (row: SYSTEM.menu) => {
  title.value = "菜单详情";
  menu.id = row.id;
  menu.title = row.title;
  menu.status = row.status;
  menu.component = row.component;
  menu.sortValue = row.sortValue;
  dialogShow.value = true;
};
const restForm = () => {
  menu.id = "";
  menu.title = "";
  menu.component = "";
  menu.sortValue = 1;
};
const cancelHandler = () => {
  dialogShow.value = false;
  restForm();
};
const confirmHandler = async () => {
  try {
    let res;
    switch (title.value) {
      case "添加子菜单":
      case "新增菜单":
        res = await save(menu);
        if (res.message == Code.SUCCESS && res.code == Code.SUCCESS_CODE) {
          dialogShow.value = false;
          restForm();
          ElMessage({
            message: res.message,
            type: "success",
          });
          getMenuList();
        } else {
          ElMessage({
            message: res.message,
            type: "warning",
          });
        }
        break;
      case "菜单详情":
        res = await update(menu);
        if (res.message == Code.SUCCESS && res.code == Code.SUCCESS_CODE) {
          dialogShow.value = false;
          restForm();
          ElMessage({
            message: res.message,
            type: "success",
          });
          getMenuList();
        } else {
          ElMessage({
            message: res.message,
            type: "warning",
          });
        }
      default:
        break;
    }
  } catch (error) {
    console.warn(error);
    HOOKS.useError()
  }
};
const addClick = () => {
  title.value = "新增菜单";
  restForm();
  dialogShow.value = true;
};
const addChildren = (row:SYSTEM.menu) =>{
  title.value = "添加子菜单"
  restForm()
  menu.parentId = row.id as number
  dialogShow.value = true
}
const deleteClick = (row: SYSTEM.role) => {
  ElMessageBox.confirm("确定要删除该菜单吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await deleteById({ id: row.id as string });
      if (res.code == Code.SUCCESS_CODE && res.message == Code.SUCCESS) {
        ElMessage({
          type: "success",
          message: "删除成功",
        });
        getMenuList();
      }else{
        ElMessage({
          type: "error",
          message: res.message,
        });
        getMenuList();
      }
    }).catch(()=>{
    
    })
};
onMounted(() => {
  getMenuList();
});
</script>
<style scoped lang="scss"></style>
