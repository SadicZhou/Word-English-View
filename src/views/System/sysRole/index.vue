<template>
  <div class="content">
    <!-- 搜索区域 -->
    <el-card :body-style="cardPad" class="search-card">
      <el-row>
        <div class="keyword">关键字</div>
        <el-col :span="4">
          <el-input
            v-model="searchForm.roleName"
            style="width: 95%"
            placeholder="请输入角色名"
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
              @click="getRoleList()"
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
          <el-button type="primary" :icon="Plus" @click="addClick">新增角色</el-button>
        
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <el-table 
        :data="tableData" 
        v-bind="{ ...tableConfig }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名" />
        <el-table-column prop="roleCode" label="角色码" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
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
              type="success"
              size="small"
              @click="assignMenu(row)"
              >分配菜单</el-button
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
        :page-sizes="[10, 20, 50, 100]"
        v-model:current-page="current"
        v-model:page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  
  <!-- 新增/修改角色对话框 -->
  <el-dialog v-model="dialogShow" width="500" :title="title" destroy-on-close>
    <el-form :model="role" v-bind="{ ...formConfig }">
      <el-form-item label="角色名" v-bind="{ ...formItemConfig }">
        <el-input v-model="role.roleName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="角色码" v-bind="{ ...formItemConfig }">
        <el-input v-model="role.roleCode" autocomplete="off" />
      </el-form-item>
      <el-form-item label="描述" v-bind="{ ...formItemConfig }">
        <el-input
          v-model="role.description"
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
  
  <!-- 分配菜单对话框 -->
  <el-dialog v-model="assiginMenuDialog" width="500">
    <template #header>
      <div class="titStyle">{{ title }}</div>
    </template>
    <el-tree
      style="max-width: 600px"
      :data="menuList"
      :props="defaultProps"
      node-key="id"
      :default-checked-keys="roleMenuIds"
      :default-expand-all="true"
      @check="handleMenuNodeClick"
      show-checkbox
    />
    <template #footer>
      <div>
        <el-button @click="assginMenuCancelHandler">取消</el-button>
        <el-button type="primary" @click="assginMenuConfirmHandler">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, Plus, Delete, Download, Refresh } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import {
  deleteRoleById,
  roleList,
  saveSysRole,
  updateSysRole,
} from "@/service/role";
import { pageNationConfig } from "@/config/pageConfig";
import { cardPad } from "@/config/cardConfig";
import { formConfig, formItemConfig } from "@/config/formConfig";
import { ElMessage, ElMessageBox } from "element-plus";
import { tableConfig } from "@/config/tableConfig";
import { Code } from "@/config/code";
import { doAssignMenu, findSysRoleMenuByRoleId } from "@/service/role_menu";
import { HOOKS } from "@/hooks";

const searchForm = reactive({
  roleName: "",
});
let title = ref("");
let tableData = ref<SYSTEM.role[]>([]);
let totalNum = ref(0);
let current = ref(1);
let pageSize = ref(10);
let dialogShow = ref(false);
let role = reactive<SYSTEM.role>({
  roleName: "",
  roleCode: "",
  description: "",
});
let assiginMenuDialog = ref(false);
let menuList = ref<SYSTEM.menu[]>([]);
let roleMenuIds = ref<number[]>([]);
let assignMenuIdList = ref<{ id: string, isHalf: number }[]>([]);
const defaultProps = {
  children: "children",
  label: "title",
};

const resetSearch = () => {
  searchForm.roleName = '';
  getRoleList();
};

const handleSizeChange = (size:number) => {
  pageSize.value = size;
  getRoleList();
};

const handleCurrentChange = (page:number) => {
  current.value = page;
  getRoleList();
};

const getRoleList = async () => {
  try {
    const { data } = await roleList({
      current: current.value,
      limit: pageSize.value,
      roleName: searchForm.roleName,
    });
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

const updateClick = (row: SYSTEM.role) => {
  title.value = "修改角色";
  role.id = row.id;
  role.roleName = row.roleName;
  role.roleCode = row.roleCode;
  role.description = row.description;
  dialogShow.value = true;
};

const restForm = () => {
  role.id = "";
  role.roleName = "";
  role.roleCode = "";
  role.description = "";
  roleMenuIds.value = [];
};

const cancelHandler = () => {
  dialogShow.value = false;
  restForm();
};

const confirmHandler = async () => {
  try {
    let res;
    if (title.value == "修改角色") {
      res = await updateSysRole(role);
    } else {
      res = await saveSysRole(role);
    }
    if (res.message == Code.SUCCESS && res.code == Code.SUCCESS_CODE) {
      dialogShow.value = false;
      restForm();
      ElMessage({
        message: res.message,
        type: "success",
      });
      getRoleList();
    } else {
      ElMessage({
        message: res.message,
        type: "warning",
      });
    }
  } catch (error) {
    console.warn(error);
    HOOKS.useError()
  }
};

const deleteClick = (row: SYSTEM.role) => {
  ElMessageBox.confirm("确定要删除该角色吗", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await deleteRoleById({ id: row.id as string });
      if (res.code == Code.SUCCESS_CODE && res.message == Code.SUCCESS) {
        ElMessage({
          type: "success",
          message: "删除成功",
        });
        getRoleList();
      }
    })
    .catch(() => {
      HOOKS.useError()
    });
};

const assignMenu = async (row: SYSTEM.role) => {
  title.value = "分配菜单";
  role.id = row.id;
  try {
    const { data } = await findSysRoleMenuByRoleId({ id: String(row.id) });
    menuList.value = data.menus;
    roleMenuIds.value = data.menusIds;
    console.log(data, roleMenuIds, "当前角色菜单");
    assiginMenuDialog.value = true;
  } catch (error) {
    HOOKS.useError()
  }
};

const handleMenuNodeClick = (menu: SYSTEM.menu, tree: any) => {
  assignMenuIdList.value = [].concat(
    tree.checkedKeys.map((item: number) => {
      return { id: item, isHalf: 0 };
    }),
    tree.halfCheckedKeys.map((item: number) => {
      return { id: item, isHalf: 1 };
    })
  );
};

const assginMenuCancelHandler = () => {
  assiginMenuDialog.value = false;
  restForm();
};

const assginMenuConfirmHandler = async () => {
  try {
    const { code, message } = await doAssignMenu({
      roleId: role.id as number,
      menuIdList: assignMenuIdList.value,
    });
    if (code == Code.SUCCESS_CODE && message == Code.SUCCESS) {
      ElMessage({
        type: "success",
        message: "分配成功",
      });
      assiginMenuDialog.value = false;
      restForm();
    } else {
      ElMessage({
        message: message,
        type: "warning",
      });
    }
  } catch (error) {
    console.warn(error);
    HOOKS.useError()
  }
};

const addClick = () => {
  title.value = "新增角色";
  restForm();
  dialogShow.value = true;
};

onMounted(() => {
  getRoleList();
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