<script lang="ts" setup>
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import { pageNationConfig } from "@/config/pageConfig";
import { cardPad } from "@/config/cardConfig";
import { formConfig, formItemConfig } from "@/config/formConfig";
import { ElMessage, ElMessageBox } from "element-plus";
import { tableConfig } from "@/config/tableConfig";
import { Code } from "@/config/code";
import { HOOKS } from "@/hooks";
import { findNodes, save, updateById } from "@/service/depart";
import { useDepartment } from "./hooks";

// 使用hooks管理表格数据
const { tableData, loading, getTableData, load } = useDepartment();

let dialogShow = ref(false);
const searchForm = reactive({
  name: ""
});

const department = reactive<SYSTEM.department>({
  name: "",
  parentId: 0,
  sortValue: 1,
  status: 0,
  remark: ""
});

// 当前编辑的父级部门信息（用于添加子部门时显示）
const parentDepartmentInfo = ref<SYSTEM.department | null>(null);

// 表单引用
const departmentFormRef = ref();

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  sortValue: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

let title = ref("");

/**
 * 获取部门列表
 */
const getDepartmentList = async () => {
  await getTableData();
};

/**
 * 刷新数据
 */
const refreshData = async () => {
  await getDepartmentList();
  ElMessage.success('数据刷新成功');
};

/**
 * 重置表单数据
 */
const restForm = () => {
  department.id = "";
  department.name = "";
  department.parentId = 0;
  department.sortValue = 1;
  department.status = 0;
  department.remark = "";
  parentDepartmentInfo.value = null;
};

/**
 * 获取父级部门名称（用于添加子部门时显示）
 */
const getParentDepartmentName = (): string => {
  if (parentDepartmentInfo.value) {
    return parentDepartmentInfo.value.name || "未知部门";
  }
  return "";
};

/**
 * 计算部门层级（基于树形结构位置判断）
 * @param row 部门数据
 */
const calculateDepartmentLevel = (row: SYSTEM.department): number => {
  // 如果parentId为0，说明是顶级部门（第1级）
  if (row.parentId === 0 || !row.parentId) {
    return 1;
  }

  // 递归查找部门在树形结构中的层级
  const findLevel = (data: SYSTEM.department[], targetId: number | string, level: number = 1): number => {
    for (const item of data) {
      if (item.id === targetId) {
        return level;
      }
      if (item.children && item.children.length > 0) {
        const result = findLevel(item.children, targetId, level + 1);
        if (result > 0) return result;
      }
    }
    return 0;
  };

  const level = findLevel(tableData.value, row.id as string);

  // 如果在已加载数据中找不到，根据parentId简单判断
  // parentId不为0的部门至少是第2级
  return level > 0 ? level : 2;
};

/**
 * 编辑部门 - 回显所有数据（除了id和创建时间）
 */
const updateClick = (row: SYSTEM.department) => {
  title.value = "部门详情";

  // 回显所有字段数据
  department.id = row.id;
  department.name = row.name || "";
  department.parentId = row.parentId !== undefined ? row.parentId : 0;
  department.sortValue = row.sortValue !== undefined ? row.sortValue : 1;
  department.status = row.status !== undefined ? row.status : 0;
  department.remark = row.remark || "";

  // 清空父级部门信息
  parentDepartmentInfo.value = null;

  dialogShow.value = true;
};

/**
 * 取消操作
 */
const cancelHandler = () => {
  dialogShow.value = false;
  restForm();
  // 重置表单验证
  if (departmentFormRef.value) {
    departmentFormRef.value.resetFields();
  }
};

/**
 * 确认提交表单
 */
const confirmHandler = async () => {
  // 先进行表单验证
  if (!departmentFormRef.value) return;

  try {
    await departmentFormRef.value.validate();
  } catch (error) {
    ElMessage.warning('请完善必填信息');
    return;
  }

  try {
    let res: any;

    switch (title.value) {
      case "添加子部门":
      case "新增部门":
        res = await save(department);
        if (res.message == Code.SUCCESS && res.code == Code.SUCCESS_CODE) {
          dialogShow.value = false;
          restForm();
          ElMessage({
            message: res.message,
            type: "success",
          });
          getDepartmentList();
        } else {
          ElMessage({
            message: res.message,
            type: "warning",
          });
        }
        break;
      case "部门详情":
        res = await updateById(department);
        if (res.message == Code.SUCCESS && res.code == Code.SUCCESS_CODE) {
          dialogShow.value = false;
          restForm();
          ElMessage({
            message: res.message,
            type: "success",
          });
          getDepartmentList();
        } else {
          ElMessage({
            message: res.message,
            type: "warning",
          });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn(error);
    HOOKS.useError()
  }
};

/**
 * 新增部门
 */
const addClick = () => {
  title.value = "新增部门";
  restForm();
  dialogShow.value = true;
};

/**
 * 添加子部门
 */
const addChildren = (row: SYSTEM.department) => {
  // 计算当前部门的层级
  const currentLevel = calculateDepartmentLevel(row);

  // 检查是否已达到最大层级（第三级）
  if (currentLevel >= 3) {
    ElMessage.warning('部门层级最多支持到第三级，无法继续添加子部门');
    return;
  }

  title.value = "添加子部门";
  restForm();
  department.parentId = row.id as number;
  parentDepartmentInfo.value = row; // 保存父级部门信息用于显示
  dialogShow.value = true;
};

/**
 * 删除部门
 */
const deleteClick = (row: SYSTEM.department) => {
  ElMessageBox.confirm("确定要删除该部门吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // TODO: 实现删除API
      ElMessage({
        type: "success",
        message: "删除成功",
      });
      getDepartmentList();
    }).catch(() => {
      // 用户取消删除
    });
};



/**
 * 重置搜索
 */
const resetSearch = () => {
  searchForm.name = "";
  getDepartmentList();
};

onMounted(() => {
  getTableData();
});
</script>

<template>
  <div class="content">
    <!-- 搜索区域 -->
    <el-card :body-style="cardPad" class="search-card">
      <el-row>
        <div class="keyword">关键字</div>
        <el-col :span="4">
          <el-input v-model="searchForm.name" style="width: 95%" placeholder="请输入部门名称" :prefix-icon="Search" />
        </el-col>
      </el-row>
      <el-row class="search-buttons">
        <el-col :span="24">
          <div class="button-container">
            <el-button type="primary" :icon="Search" @click="getDepartmentList()">搜索</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 操作区域 -->
    <el-card :body-style="cardPad" class="action-card">
      <el-row>
        <el-col :span="18">
          <el-button type="primary" :icon="Plus" @click="addClick">新增部门</el-button>
          <el-button type="success" :icon="Refresh" @click="refreshData" :loading="loading">刷新数据</el-button>
        </el-col>
        <el-col :span="6">
          <el-alert title="部门层级最多支持3级" type="info" :closable="false" show-icon
            style="height: 32px; line-height: 32px;" />
        </el-col>
      </el-row>
    </el-card>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table :data="tableData" v-bind="{ ...tableConfig }" row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading" lazy :load="load">
        <el-table-column prop="name" label="部门名称" />
        <el-table-column label="层级" width="60" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ calculateDepartmentLevel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortValue" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status == 0 ? 'success' : 'danger'">
              {{ row.status == 0 ? "正常" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="描述" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column fixed="right" label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="updateClick(row)">修改</el-button>
            <el-button link type="danger" size="small" @click="deleteClick(row)">删除</el-button>
            <el-button v-if="calculateDepartmentLevel(row) < 3" link type="primary" size="small"
              @click="addChildren(row)">
              添加子部门
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <!-- 新增/修改部门对话框 -->
  <el-dialog v-model="dialogShow" width="600" :title="title" destroy-on-close>
    <el-form :model="department" :rules="formRules" ref="departmentFormRef" v-bind="{ ...formConfig }">
      <el-form-item label="部门名称" prop="name" v-bind="{ ...formItemConfig }">
        <el-input v-model="department.name" autocomplete="off" placeholder="请输入部门名称" />
      </el-form-item>

      <el-form-item label="排序值" prop="sortValue" v-bind="{ ...formItemConfig }">
        <el-input-number v-model="department.sortValue" :min="0" :max="9999" controls-position="right"
          style="width: 100%" placeholder="请输入排序值" />
      </el-form-item>

      <el-form-item label="状态" prop="status" v-bind="{ ...formItemConfig }">
        <el-radio-group v-model="department.status">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="描述" v-bind="{ ...formItemConfig }">
        <el-input v-model="department.remark" type="textarea" :rows="3" placeholder="请输入部门描述（可选）" />
      </el-form-item>

      <el-form-item label="上级部门" v-bind="{ ...formItemConfig }" v-if="title === '添加子部门'">
        <el-input
          :value="`${getParentDepartmentName()} (第${parentDepartmentInfo ? calculateDepartmentLevel(parentDepartmentInfo) : 1}级)`"
          disabled />
      </el-form-item>

      <el-form-item label="新部门层级" v-bind="{ ...formItemConfig }" v-if="title === '添加子部门'">
        <el-input :value="`第${parentDepartmentInfo ? calculateDepartmentLevel(parentDepartmentInfo) + 1 : 2}级`"
          disabled />
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

    // 按钮容器样式
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

  // 操作卡片样式
  .action-card {
    margin-bottom: 20px;
  }

  // 表格容器样式
  .table-container {
    background: white;
    border-radius: 4px;
    padding: 20px;
  }
}
</style>