<template>
  <div class="layout" :class="[
      themeStore.menuTheme === 'light' ? 'light-menu' : 'dark-menu',
      themeStore.compactMenu ? 'compact-menu' : '',
]">
    <!-- 左侧菜单 -->
    <div class="menus" :class="{ 'is-collapsed': isCollapse }">
      <!-- Logo 区域 -->
      <div class="tech-logo" :class="{ 'light-logo': themeStore.menuTheme === 'light' }">
        <div class="logo-text" v-if="!isCollapse">管理系统</div>
        <div class="logo-icon" v-else>系</div>
      </div>

      <!-- 菜单 -->
      <el-menu :active-text-color="themeStore.menuTheme === 'dark' ? '#fff' : themeStore.themeColor
        " :background-color="themeStore.menuTheme === 'dark' ? '#001529' : '#fff'" :text-color="themeStore.menuTheme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#333'
          " :default-active="activeMenu" class="el-menu-vertical-demo" :collapse="isCollapse" router>
        <!-- 动态生成菜单 -->
        <template v-for="menu in menuList" :key="menu.id || menu.path">
          <!-- 有子菜单的情况 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path || String(menu.id)">
            <template #title>
              <el-icon>
                <component :is="getMenuIcon(menu.icon)" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>

            <!-- 递归渲染子菜单 -->
            <template v-for="subMenu in menu.children" :key="subMenu.id || subMenu.path">
              <!-- 子菜单还有子菜单 -->
              <el-sub-menu v-if="subMenu.children && subMenu.children.length > 0"
                :index="subMenu.path || String(subMenu.id)">
                <template #title>
                  <el-icon>
                    <component :is="getMenuIcon(subMenu.icon)" />
                  </el-icon>
                  <span>{{ subMenu.title }}</span>
                </template>

                <el-menu-item v-for="item in subMenu.children" :key="item.id || item.path" :index="item.path">
                  <el-icon>
                    <component :is="getMenuIcon(item.icon)" />
                  </el-icon>
                  <template #title>{{ item.title }}</template>
                </el-menu-item>
              </el-sub-menu>

              <!-- 子菜单没有子菜单 -->
              <el-menu-item v-else :index="subMenu.path">
                <el-icon>
                  <component :is="getMenuIcon(subMenu.icon)" />
                </el-icon>
                <template #title>{{ subMenu.title }}</template>
              </el-menu-item>
            </template>
          </el-sub-menu>

          <!-- 没有子菜单的情况 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon>
              <component :is="getMenuIcon(menu.icon)" />
            </el-icon>
            <template #title>{{ menu.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <div class="content">
      <el-card>
        <div class="content_top">
          <img @click="toggleCollapse" class="control" :src="isCollapse ? open : close" alt="" />
          <div class="content_top_right">
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <!-- 功能按钮区域 -->
          <div class="header-actions">
            <el-tooltip content="主题设置" placement="bottom">
              <el-icon class="header-icon" @click="openThemeSettings">
                <Setting />
              </el-icon>
            </el-tooltip>
          </div>

          <!-- 用户信息 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{ userInfo.username || "管理员" }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="refresh">刷新路由</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-card>
      <div class="content_btm">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>

    <!-- 主题设置抽屉 -->
    <ThemeSettings ref="themeSettingsRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePermissonStore } from "@/store/permission";
import { useUserStore } from "@/store/user";
import { useThemeStore } from "@/store/theme";
import {
  Setting,
  Menu as IconMenu,
  User,
  List,
  Odometer,
  DataAnalysis,
  UserFilled,
  HomeFilled,
  Document,
  Location,
  Tickets,
  Bell,
  CreditCard,
  Goods,
  Shop,
  Picture,
  Histogram,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Component } from "vue";
import ThemeSettings from "@/components/ThemeSettings/index.vue";

// 导入图片
const open = require("@/assets/open_menu.png");
const close = require("@/assets/close_menu.png");

// 获取store和路由
const permissionStore = usePermissonStore();
const userStore = useUserStore();
const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter();

// 主题设置抽屉引用
const themeSettingsRef = ref();

// 菜单折叠状态
const isCollapse = ref(false);

// 用户信息
const userInfo = reactive({
  username: localStorage.getItem("username") || "管理员",
  avatar: localStorage.getItem("avatar") || "",
});

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 获取菜单列表
const menuList = computed(() => {
  return permissionStore.menus || [];
});

// 面包屑导航
const breadcrumbList = computed(() => {
  const result: any[] = [];
  const path = route.path;

  // 查找当前路由对应的菜单项
  const findMenuByPath = (menus: any[], targetPath: string): any | null => {
    for (const menu of menus) {
      if (menu.path === targetPath) {
        return menu;
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuByPath(menu.children, targetPath);
        if (found) {
          result.unshift(menu); // 添加父级菜单
          return found;
        }
      }
    }
    return null;
  };

  const currentMenu = findMenuByPath(menuList.value, path);
  if (currentMenu) {
    result.push(currentMenu);
  }

  return result;
});

/**
 * 根据菜单图标名称获取对应的图标组件
 * @param {string | undefined} iconName - 菜单图标名称
 * @returns {Component} 图标组件
 */
const getMenuIcon = (iconName: string | undefined): Component => {
  if (!iconName) return IconMenu;

  const iconMap: Record<string, Component> = {
    setting: Setting,
    menu: IconMenu,
    user: User,
    list: List,
    dashboard: Odometer,
    analysis: DataAnalysis,
    profile: UserFilled,
    home: HomeFilled,
    document: Document,
    location: Location,
    tickets: Tickets,
    bell: Bell,
    "credit-card": CreditCard,
    goods: Goods,
    shop: Shop,
    picture: Picture,
    histogram: Histogram,
    // 可以根据需要添加更多图标映射
  };

  return iconMap[iconName] || IconMenu;
};

/**
 * 切换菜单折叠状态
 */
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
  // 将折叠状态保存到localStorage
  localStorage.setItem("menuCollapsed", isCollapse.value.toString());
};

/**
 * 处理下拉菜单命令
 */
const handleCommand = async (command: string) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        // 使用新的logout方法，清理所有相关数据
        await userStore.logout();

        // 跳转到登录页
        router.push("/login");
        ElMessage.success("退出登录成功");
      })
      .catch(() => {});
  } else if (command === "profile") {
    router.push("/profile");
  } else if (command === "password") {
    ElMessage.info("修改密码功能开发中");
  } else if (command === "refresh") {
    try {
      await permissionStore.refreshRoutes(true);
    } catch (error) {
      console.error('刷新路由失败:', error);
      ElMessage.error('刷新路由失败，请重试');
    }
  }
};

// 打开主题设置抽屉
const openThemeSettings = () => {
  themeSettingsRef.value.openDrawer();
};

// 获取菜单数据
const fetchMenuData = async () => {
  try {
    await permissionStore.getDynamicRoue();
  } catch (error) {
    console.error("获取菜单数据失败:", error);
    ElMessage.error("获取菜单数据失败，请刷新页面重试");
  }
};

// 组件挂载时
onMounted(async () => {
  // 从localStorage恢复菜单折叠状态
  const savedCollapsed = localStorage.getItem("menuCollapsed");
  if (savedCollapsed !== null) {
    isCollapse.value = savedCollapsed === "true";
  }

  // 清除缓存确保路径修正生效（临时措施）
  permissionStore.clearCache();

  // 获取菜单数据
  await fetchMenuData();
});

// 监听路由变化，更新激活的菜单
watch(
  () => route.path,
  (newPath) => {
  },
  { immediate: true }
);

// 监听 permissionStore.menus 的变化
watch(
  () => permissionStore.menus,
  (newMenus) => {
    // console.log("permissionStore.menus 已更新:", newMenus);
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
$mw: 200px;
.el-menu-vertical-demo {
  height: calc(100% - 60px) !important;
  overflow-y: auto;
  overflow-x: hidden;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: $mw;
}
.el-menu {
  border-right: 0px !important;
}
.layout {
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #f0f2f5;

  // 深色菜单主题
  &.dark-menu {
    .menus {
      background-color: #001529;

      .tech-logo {
        background-color: #002140;
        border-bottom: 1px solid #003a70;

        .logo-text,
        .logo-icon {
          color: #fff;
        }
      }

      // 覆盖 Element Plus 菜单样式
      :deep(.el-menu) {
        background-color: #001529 !important;

        .el-menu-item {
          color: rgba(255, 255, 255, 0.65) !important;

          &:hover {
            color: #fff !important;
            background-color: #1f2d3d !important;
          }

          &.is-active {
            color: #fff !important;
            background-color: var(--el-color-primary) !important;
          }
        }

        .el-sub-menu__title {
          color: rgba(255, 255, 255, 0.65) !important;

          &:hover {
            color: #fff !important;
            background-color: #1f2d3d !important;
          }
        }

        .el-sub-menu.is-active > .el-sub-menu__title {
          color: #fff !important;
        }
      }
    }
  }

  // 浅色菜单主题
  &.light-menu {
    .menus {
      background-color: #fff;

      .tech-logo {
        background-color: #fff;
        border-bottom: 1px solid #f0f0f0;

        .logo-text,
        .logo-icon {
          color: var(--el-color-primary);
        }
      }

      // 覆盖 Element Plus 菜单样式
      :deep(.el-menu) {
        background-color: #fff !important;

        .el-menu-item {
          color: #333 !important;

          &:hover {
            color: var(--el-color-primary) !important;
            background-color: #f5f5f5 !important;
          }

          &.is-active {
            color: var(--el-color-primary) !important;
            background-color: #e6f7ff !important;
          }
        }

        .el-sub-menu__title {
          color: #333 !important;

          &:hover {
            color: var(--el-color-primary) !important;
            background-color: #f5f5f5 !important;
          }
        }

        .el-sub-menu.is-active > .el-sub-menu__title {
          color: var(--el-color-primary) !important;
        }
      }
    }
  }

  // 紧凑菜单模式
  &.compact-menu {
    .menus {
      width: $mw;

      &.is-collapsed {
        width: 64px;
      }
    }

    :deep(.el-menu--collapse) {
      width: 64px;
    }

    .tech-logo {
      height: 48px;
    }

    .el-menu-item,
    :deep(.el-sub-menu__title) {
      height: 48px;
      line-height: 48px;
    }
  }

  // Logo 区域样式
  .tech-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      transition: color 0.3s;
    }

    .logo-icon {
      font-size: 20px;
      font-weight: 600;
      transition: color 0.3s;
    }
  }

  .menus {
    height: 100%;
    width: $mw;
    position: relative;
    transition: all 0.3s;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

    &.is-collapsed {
      width: 64px;
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .content_top {
      display: flex;
      align-items: center;

      .content_top_right {
        flex: 1;
        margin-left: 20px;
      }

      .control {
        width: 25px;
        height: 25px;
        cursor: pointer;
      }

      .control:hover {
        background-color: #f1f1f1;
      }

      .user-dropdown {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-left: 20px;

        .username {
          margin-left: 8px;
        }
      }

      // 功能按钮区域样式
      .header-actions {
        display: flex;
        align-items: center;
        margin-right: 10px;

        .header-icon {
          font-size: 20px;
          color: #666;
          cursor: pointer;
          margin-right: 16px;
          transition: all 0.3s;

          &:hover {
            color: var(--el-color-primary);
            transform: rotate(30deg);
          }
        }
      }
    }

    .content_btm {
      padding: 17px;
      box-sizing: border-box;
      overflow: auto;
      height: calc(100vh - 120px);
    }
  }
}

// 滚动条样式
:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu-vertical-demo::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-menu-vertical-demo::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

:deep(.el-menu-vertical-demo::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.1);
}
</style>
