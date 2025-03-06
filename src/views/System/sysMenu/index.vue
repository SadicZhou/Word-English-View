<template>
  <div class="content">
    <!-- 搜索区域 -->
    <el-card :body-style="cardPad" class="search-card">
      <el-row>
        <div class="keyword">关键字</div>
        <el-col :span="4">
          <el-input
            v-model="searchForm.menuName"
            style="width: 95%"
            placeholder="请输入菜单名"
            :prefix-icon="Search"
          />
        </el-col>
      </el-row>
      <el-row class="search-buttons">
        <el-col :span="24">
          <div class="button-container">
            <el-button
              type="primary"
              :icon="Search"
              @click="getMenuList()"
            >搜索</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 操作区域 -->
    <el-card :body-style="cardPad" class="action-card">
      <el-row>
        <el-col :span="24">
          <el-button type="primary" :icon="Plus" @click="addClick">新增菜单</el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <el-table 
        :data="tableData" 
        v-bind="{ ...tableConfig }"
        row-key="id"
      >
      <el-table-column prop="title" label="菜单标题" />
        <el-table-column prop="component" label="路由名称" />
        <el-table-column prop="sortValue" label="排序" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            {{ row.status == 1 ? "可用" : "禁用" }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column fixed="right" label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="updateClick(row)"
            >
              修改
            </el-button>
            <el-button
              link
              type="danger"
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
    
    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNum"
        :page-sizes="pageNationConfig.pageSizes"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  
  <!-- 新增/修改菜单对话框 -->
  <el-dialog v-model="dialogShow" width="500" :title="title" destroy-on-close>
    <el-form :model="menu" v-bind="{ ...formConfig }">
      <el-form-item label="菜单名" v-bind="{ ...formItemConfig }">
        <el-input v-model="menu.title" autocomplete="off" />
      </el-form-item>
      <el-form-item label="组件" v-bind="{ ...formItemConfig }">
        <el-input v-model="menu.component" autocomplete="off" />
      </el-form-item>
      <el-form-item label="路由" v-bind="{ ...formItemConfig }">
        <el-input
          v-model="menu.path"
          autocomplete="off"
          :rows="2"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelHandler">取消</el-button>
        <el-button type="primary" @click="confirmHandler()">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, Plus,Refresh } from "@element-plus/icons-vue";
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
let currentPage =ref(1);
let pageSize =ref(pageNationConfig.pageSize);
const searchForm = reactive({
  menuName: ""
});
const menu = reactive<SYSTEM.menu>({
  title: "",
  component: "",
  status: 1,
  sortValue:1,
  parentId:0,
  path:''
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
  menu.path = row.path
  dialogShow.value = true;
};
const restForm = () => {
  menu.id = "";
  menu.title = "";
  menu.component = "";
  menu.sortValue = 1;
  menu.path = '';
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
const resetSearch = () => {
  searchForm.menuName = "";
  getMenuList();
};
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getMenuList();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getMenuList();
};
onMounted(() => {
  getMenuList();
});
</script>
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
