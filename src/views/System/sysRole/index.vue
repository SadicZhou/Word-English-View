<template>
  <div class="content">
    <el-card :body-style="cardPad" style="margin: 10px 0">
      <el-row>
        <el-col :span="4">
          <el-input
            v-model="searchForm.roleName"
            style="width: 95%"
            placeholder="请输入角色名"
            :prefix-icon="Search"
          />
        </el-col>
        <el-col :span="2">
          <el-button
            type="success"
            :icon="Search"
            @click="getRoleList(searchForm.roleName)"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </el-card>
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
      <el-table :data="tableData" v-bind="{ ...tableConfig }">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="roleName" label="角色名" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="description" label="备注" />
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
            <el-button link type="primary" size="small" @click="assignMenu(row)"
              >分配菜单</el-button
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
      <div>
        <el-button @click="cancelHandler">取消</el-button>
        <el-button type="primary" @click="confirmHandler()"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
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
        <el-button type="primary" @click="assginMenuConfirmHandler">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, Plus } from "@element-plus/icons-vue";
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
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { tableConfig } from "@/config/tableConfig";
import { Code } from "@/config/code";
import { doAssignMenu, findSysRoleMenuByRoleId } from "@/service/role_menu";

const searchForm = reactive({
  roleName: "",
});
let dialogShow = ref(false);
const role = reactive<SYSTEM.role>({
  roleName: "",
  roleCode: "",
  description: "",
});
let title = ref("");
let tableData = ref<SYSTEM.role[]>([]);
let totalNum = ref(0);
let current = ref(1);
let assiginMenuDialog = ref(false);
let menuList = ref<SYSTEM.menu[]>([]);
let roleMenuIds = ref<number[]>([]);
let assignMenuIdList = ref<{ id: string, isHalf: number }[]>([]);
const defaultProps = {
  children: "children",
  label: "title",
};
const getRoleList = async (roleName: string = "") => {
  try {
    const { data } = await roleList({
      current: 1,
      limit: 10,
      roleName: roleName,
    });
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
const updateClick = (row: SYSTEM.role) => {
  title.value = "角色详情";
  role.id = row.id;
  role.description = row.description;
  role.roleName = row.roleName;
  role.roleCode = row.roleCode;
  dialogShow.value = true;
};
const restForm = () => {
  role.id = "";
  role.description = "";
  role.roleCode = "";
  role.roleName = "";
  roleMenuIds.value = [];
};
const cancelHandler = () => {
  dialogShow.value = false;
  restForm();
};
const confirmHandler = async () => {
  try {
    let res;
    switch (title.value) {
      case "新增用户":
        res = await saveSysRole(role);
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
        break;
      case "角色详情":
        res = await updateSysRole(role);
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
      default:
        break;
    }
  } catch (error) {
    console.warn(error);
    ElMessage({
      type: "error",
      message: "网络开小差了",
    });
  }
};
const addClick = () => {
  title.value = "新增用户";
  restForm();
  dialogShow.value = true;
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
      ElMessage({
        type: "error",
        message: "网络开小差了",
      });
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
    ElMessage({
      type: "error",
      message: "网络开小差了",
    });
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
  restForm();
  assiginMenuDialog.value = false;
};
const assginMenuConfirmHandler = async () => {
  try {
    const res = await doAssignMenu({
      roleId: Number(role.id),
      menuIdList: assignMenuIdList.value,
    });
    console.log(res, "菜单分配结果");
  } catch (error) {}
};
onMounted(() => {
  getRoleList();
});
</script>
<style scoped lang="scss"></style>
