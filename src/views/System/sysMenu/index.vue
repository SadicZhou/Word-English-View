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
          <el-button type="success" :icon="Refresh" @click="refreshRoutes" :loading="loading">刷新路由</el-button>
          <el-button type="info" @click="debugRoutes">调试路由</el-button>
          <el-button type="warning" @click="fixMenuData">修复菜单</el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <el-table 
        :data="tableData" 
        v-bind="{ ...tableConfig }"
        row-key="id"
        v-loading="loading"
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
        <el-input 
          v-model="menu.component" 
          autocomplete="off"
          @blur="handleComponentInput"
        >
          <template #prepend>@/views/</template>
          <template #append>.vue</template>
        </el-input>
      </el-form-item>
      <el-form-item label="图标" v-bind="{ ...formItemConfig }">
        <el-select v-model="menu.icon" placeholder="请选择图标" filterable>
          <el-option
            v-for="icon in iconList"
            :key="icon"
            :label="icon"
            :value="icon"
          >
            <component :is="icon" style="margin-right: 8px;" />
            {{ icon }}
          </el-option>
        </el-select>
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
import { Search, Plus, Refresh, Setting, User, Menu as MenuIcon, Location, Document, 
  Folder, Bell, House as Home, Star, Delete, Edit, Calendar, Camera, ChatLineRound, 
  Check, CircleCheck, Close, Download, Upload, Warning, InfoFilled, 
  SuccessFilled, QuestionFilled, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
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
import { usePermissonStore } from "@/store/permission";
import { useRouter } from "vue-router";

// 获取 permission store 实例
const permissionStore = usePermissonStore();
const router = useRouter();

// 图标列表
const iconList = [
  Search, Plus, Refresh, Setting, User, MenuIcon, Location, Document, 
  Folder, Bell, Home, Star, Delete, Edit, Calendar, Camera, ChatLineRound, 
  Check, CircleCheck, Close, Download, Upload, Warning, InfoFilled, 
  SuccessFilled, QuestionFilled, ArrowDown, ArrowUp, ArrowLeft, ArrowRight
];

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
  path:'',
  icon: ''
});

// 处理组件输入，自动添加前缀和后缀
const handleComponentInput = () => {
  if (menu.component) {
    // 去除可能已存在的前缀和后缀
    let component = menu.component.replace(/^@\/views\//, '').replace(/\.vue$/, '');
    menu.component = component;
  }
};

let title = ref("");
let tableData = ref<SYSTEM.menu[]>([]);
let totalNum = ref(0);
let loading = ref(false); // 添加 loading 状态

/**
 * 刷新路由和菜单数据
 */
const refreshRoutes = async () => {
  try {
    loading.value = true;
    const success = await permissionStore.refreshRoutes(true);
    if (success) {
      // 刷新成功后重新获取表格数据
      await getMenuList();
    }
  } catch (error) {
    console.error('刷新路由失败:', error);
    ElMessage.error('刷新路由失败，请重试');
  } finally {
    loading.value = false;
  }
};

const getMenuList = async () => {
  loading.value = true; // 开始加载
  try {
    const res = await menuList();
    tableData.value = res.data;
  } catch (error) {
    return [];
  } finally {
    loading.value = false; // 加载完成
  }
};
const updateClick = (row: SYSTEM.menu) => {
  title.value = "菜单详情";
  menu.id = row.id;
  menu.title = row.title;
  menu.status = row.status;
  menu.component = row.component;
  menu.sortValue = row.sortValue;
  menu.path = row.path;
  menu.parentId = row.parentId;
  menu.icon = row.icon || '';
  dialogShow.value = true;
};
const restForm = () => {
  menu.id = "";
  menu.title = "";
  menu.component = "";
  menu.sortValue = 1;
  menu.path = '';
  menu.icon = '';
};
const cancelHandler = () => {
  dialogShow.value = false;
  restForm();
};
const confirmHandler = async () => {
  try {
    let res;
    let needRefreshRoutes = false; // 标记是否需要刷新路由

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
          needRefreshRoutes = true; // 新增菜单需要刷新路由
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
          needRefreshRoutes = true; // 更新菜单需要刷新路由
        } else {
          ElMessage({
            message: res.message,
            type: "warning",
          });
        }
      default:
        break;
    }

    // 如果需要刷新路由，则执行刷新
    if (needRefreshRoutes) {
      setTimeout(async () => {
        await permissionStore.refreshRoutes(false); // 不显示成功消息，避免重复提示
      }, 500); // 延迟500ms执行，确保数据库操作完成
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
        
        // 删除菜单后刷新路由
        setTimeout(async () => {
          await permissionStore.refreshRoutes(false); // 不显示成功消息，避免重复提示
        }, 500);
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
const debugRoutes = () => {
  console.log("=== 路由调试信息 ===");
  
  // 获取当前路由表
  const routes = router.getRoutes();
  console.log("当前注册的路由:", routes);
  
  // 检查菜单数据
  console.log("当前菜单数据:", tableData.value);
  
  // 检查问题路径
  const problemMenus = tableData.value.filter(menu => {
    return menu.path && (
      menu.path.includes('/system/Product') || 
      menu.path.includes('/system/Website') ||
      !menu.name || 
      menu.name.trim() === ''
    );
  });
  
  if (problemMenus.length > 0) {
    console.log("发现问题菜单:", problemMenus);
    ElMessage.warning(`发现 ${problemMenus.length} 个菜单存在路径或名称问题，建议点击"修复菜单"按钮`);
  } else {
    console.log("所有菜单路径和名称都正常");
    ElMessage.success("菜单配置检查通过");
  }
  
  // 检查路由匹配
  const testPaths = ['/Website/banner/index', '/Product/category/index'];
  testPaths.forEach(path => {
    const route = router.resolve(path);
    console.log(`路径 ${path} 解析结果:`, route);
  });
};

/**
 * 修复菜单数据中的路径和名称问题
 */
const fixMenuData = async () => {
  console.log("开始修复菜单数据...");
  
  try {
    // 找到有问题的菜单项并修复
    const menuUpdates = [];
    
    for (const menuItem of tableData.value) {
      let needUpdate = false;
      const updates: any = { id: menuItem.id };
      
      // 修复名称为空的问题
      if (!menuItem.name || menuItem.name.trim() === '') {
        if (menuItem.path) {
          // 基于路径生成名称
          const segments = menuItem.path.split('/').filter(s => s);
          const generatedName = segments.map(segment => 
            segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
          ).join('');
          
          updates.name = generatedName;
          needUpdate = true;
          console.log(`生成名称: ${menuItem.title} -> ${generatedName}`);
        }
      }
      
      // 检查并修复路径问题
      if (menuItem.path) {
        let fixedPath = menuItem.path;
        
        // 修复商品管理相关路径：从 /system/Product 开头改为 /Product
        if (menuItem.path.includes('/system/Product')) {
          fixedPath = menuItem.path.replace('/system/Product', '/Product');
          updates.path = fixedPath;
          needUpdate = true;
          console.log(`修复商品菜单路径: ${menuItem.path} -> ${fixedPath}`);
        }
        
        // 修复网站管理相关路径：从 /system/Website 开头改为 /Website
        if (menuItem.path.includes('/system/Website')) {
          fixedPath = menuItem.path.replace('/system/Website', '/Website');
          updates.path = fixedPath;
          needUpdate = true;
          console.log(`修复网站菜单路径: ${menuItem.path} -> ${fixedPath}`);
        }
        
        // 确保路径格式正确
        if (!fixedPath.startsWith('/')) {
          fixedPath = '/' + fixedPath;
          updates.path = fixedPath;
          needUpdate = true;
        }
      }
      
      if (needUpdate) {
        menuUpdates.push(updates);
      }
    }
    
    // 批量更新菜单
    if (menuUpdates.length > 0) {
      console.log(`需要更新 ${menuUpdates.length} 个菜单项:`, menuUpdates);
      
      // 这里可以调用批量更新API，或者逐个更新
      for (const updateData of menuUpdates) {
        try {
          const res = await update(updateData);
          if (res.code === Code.SUCCESS_CODE) {
            console.log(`菜单 ${updateData.id} 更新成功`);
          }
        } catch (error) {
          console.error(`菜单 ${updateData.id} 更新失败:`, error);
        }
      }
      
      // 刷新数据
      await getMenuList();
      await permissionStore.refreshRoutes(true);
      
      ElMessage.success(`已修复 ${menuUpdates.length} 个菜单配置`);
    } else {
      ElMessage.info('未发现需要修复的菜单配置');
    }
    
  } catch (error) {
    console.error('修复菜单数据失败:', error);
    ElMessage.error('修复菜单数据失败');
  }
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
