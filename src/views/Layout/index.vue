<template>
  <!-- 加载进度条 -->
  <LoadingBar ref="loadingBarRef" />

  <div
    class="layout"
    :class="[
      themeStore.menuTheme === 'light' ? 'light-menu' : 'dark-menu',
      themeStore.compactMenu ? 'compact-menu' : '',
    ]"
  >
    <!-- 左侧菜单 -->
    <div class="menus" :class="{ 'is-collapsed': isCollapse }">
      <!-- Logo 区域 -->
      <div
        class="tech-logo"
        :class="{ 'light-logo': themeStore.menuTheme === 'light' }"
      >
        <div class="logo-text" v-if="!isCollapse">管理系统</div>
        <div class="logo-icon" v-else>系</div>
      </div>

      <!-- 菜单 -->
      <el-menu
        :active-text-color="
          themeStore.menuTheme === 'dark' ? '#fff' : themeStore.themeColor
        "
        :background-color="themeStore.menuTheme === 'dark' ? '#001529' : '#fff'"
        :text-color="
          themeStore.menuTheme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#333'
        "
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        :unique-opened="false"
        router
      >
        <!-- 动态生成菜单 -->
        <template v-for="menu in menuList" :key="menu.id || menu.path">
          <!-- 有子菜单的情况 -->
          <el-sub-menu
            v-if="menu.children && menu.children.length > 0"
            :index="getUniqueIndex(menu)"
          >
            <template #title>
              <el-icon>
                <component :is="getMenuIcon(menu.icon)" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>

            <!-- 递归渲染子菜单 -->
            <template
              v-for="subMenu in menu.children"
              :key="subMenu.id || subMenu.path"
            >
              <!-- 子菜单还有子菜单 -->
              <el-sub-menu
                v-if="subMenu.children && subMenu.children.length > 0"
                :index="getUniqueIndex(subMenu)"
              >
                <template #title>
                  <el-icon>
                    <component :is="getMenuIcon(subMenu.icon)" />
                  </el-icon>
                  <span>{{ subMenu.title }}</span>
                </template>

                <el-menu-item
                  v-for="item in subMenu.children"
                  :key="item.id || item.path"
                  :index="getUniqueIndex(item)"
                >
                  <el-icon>
                    <component :is="getMenuIcon(item.icon)" />
                  </el-icon>
                  <template #title>{{ item.title }}</template>
                </el-menu-item>
              </el-sub-menu>

              <!-- 子菜单没有子菜单 -->
              <el-menu-item v-else :index="getUniqueIndex(subMenu)">
                <el-icon>
                  <component :is="getMenuIcon(subMenu.icon)" />
                </el-icon>
                <template #title>{{ subMenu.title }}</template>
              </el-menu-item>
            </template>
          </el-sub-menu>

          <!-- 没有子菜单的情况 -->
          <el-menu-item v-else :index="getUniqueIndex(menu)">
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
          <img
            @click="toggleCollapse"
            class="control"
            :src="isCollapse ? open : close"
            alt=""
          />
          <div class="content_top_right">
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/">
              <!-- <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item> -->
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumbList"
                :key="index"
              >
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
              <el-avatar
                :size="32"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <span class="username">{{ userInfo.username || "管理员" }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="refresh">刷新页面</el-dropdown-item>
                <el-dropdown-item command="refreshRoutes"
                  >刷新路由</el-dropdown-item
                >
                <el-dropdown-item divided command="logout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-card>
      <div class="content_btm">
        <router-view v-slot="{ Component, route }">
          <transition :name="transitionName" mode="out-in" appear>
            <div :key="routeKey" class="route-wrapper">
              <component :is="Component" />
            </div>
          </transition>
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
import ThemeSettings from "@/components/ThemeSettings/index.vue";
import LoadingBar from "@/components/LoadingBar/index.vue";

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

// 加载进度条引用
const loadingBarRef = ref();

// 菜单折叠状态
const isCollapse = ref(false);

// 路由切换动画名称
const transitionName = ref("fade-slide");

// 路由key，确保每次路由变化都重新渲染组件
const routeKey = computed(() => {
  // 使用fullPath确保每次路由变化（包括查询参数）都重新渲染
  return route.fullPath;
});

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
 * @returns {any} 图标组件
 */
const getMenuIcon = (iconName: string | undefined): any => {
  if (!iconName) return IconMenu;

  const iconMap: Record<string, any> = {
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
 * 生成唯一的菜单索引
 * @param {any} menu - 菜单项
 * @returns {string} 唯一的索引值
 */
const getUniqueIndex = (menu: any): string => {
  // 优先使用 path，这是最稳定的标识符
  if (menu.path && menu.path.trim()) {
    return menu.path;
  }
  // 其次使用 id
  if (menu.id) {
    return `menu_${menu.id}`;
  }
  // 最后使用 title 作为标识符，不使用时间戳和随机数
  return `menu_${menu.title || "unknown"}`;
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
 * 切换路由动画效果
 * @param {string} animationType - 动画类型
 */
const changeTransition = (animationType: string) => {
  transitionName.value = animationType;
  localStorage.setItem("routeTransition", animationType);
};

/**
 * 强制刷新当前页面
 */
const forceRefreshCurrentPage = () => {
  // 简单的刷新方法：重新加载页面
  window.location.reload();
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
        try {
          // 使用新的logout方法，清理所有相关数据
          await userStore.logout();

          // 确保状态更新完成后再跳转
          setTimeout(async () => {
            // 跳转到登录页
            await router.push("/login");
            ElMessage.success("退出登录成功");
          }, 100);
        } catch (error) {
          console.error("退出登录失败:", error);
          ElMessage.error("退出登录失败，请重试");
        }
      })
      .catch(() => {});
  } else if (command === "profile") {
    router.push("/profile");
  } else if (command === "password") {
    ElMessage.info("修改密码功能开发中");
  } else if (command === "refresh") {
    // 刷新当前页面
    forceRefreshCurrentPage();
    ElMessage.success("页面刷新成功");
  } else if (command === "refreshRoutes") {
    // 刷新路由配置
    try {
      await permissionStore.refreshRoutes(true);
    } catch (error) {
      console.error("刷新路由失败:", error);
      ElMessage.error("刷新路由失败，请重试");
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

  // 从localStorage恢复路由动画类型
  const savedTransition = localStorage.getItem("routeTransition");
  if (savedTransition) {
    transitionName.value = savedTransition;
  }

  // 清除缓存确保路径修正生效（临时措施）
  permissionStore.clearCache();

  // 获取菜单数据
  await fetchMenuData();
});

// 监听路由变化，更新激活的菜单并控制进度条
watch(
  () => route.fullPath, // 使用 fullPath 而不是 path，这样查询参数变化也会触发
  (newPath, oldPath) => {
    // 如果是不同的路径才显示进度条
    if (newPath !== oldPath && oldPath) {
      // 开始进度条
      loadingBarRef.value?.start();

      // 模拟路由切换完成，结束进度条
      setTimeout(() => {
        loadingBarRef.value?.finish();
      }, 300);
    }
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
      overflow-y: auto;
      overflow-x: hidden;
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
// 路由切换动画样式
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 滑动淡入动画（备选）
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

// 缩放淡入动画（备选）
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.25s ease;
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

// 为路由切换区域添加相对定位，确保动画正常
.content_btm {
  position: relative;

  > * {
    width: 100%;
  }

  // 路由包装器样式
  .route-wrapper {
    width: 100%;
    height: 100%;
  }
}
</style>
