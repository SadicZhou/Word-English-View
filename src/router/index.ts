import { App } from 'vue';
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import pinia from '@/store/store';
import { usePermissonStore } from '@/store/permission'
import { useUserStore } from '@/store/user'
const PermissonStore = usePermissonStore(pinia)
const userStore = useUserStore(pinia)

// 记录路由是否已经添加，避免重复获取
let hasAddedRoutes = false;

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import("@/views/Login/Login.vue")
  },
  {
    path: "/",
    name: 'layout',
    component: () => import('@/views/Layout/index.vue'),
    children: [
      // 静态路由可以在这里添加
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/**
 * 添加动态路由
 * @param {RouteRecordRaw} route - 要添加的路由配置
 */
export const updateRouter = (route: RouteRecordRaw) => {
  // 先移除所有动态添加的路由
  try {
    router.getRoutes().forEach(r => {
      if (r.name && r.name !== 'Login') {
        router.removeRoute(r.name);
      }
    });
  } catch (error) {
    console.error('移除路由失败:', error);
  }

  // 添加新的动态路由
  if (route.children && route.children.length > 0) {
    // 确保layout路由存在
    const layoutRoute = {
      path: '/',
      name: 'Layout',
      component: () => import('@/views/Layout/index.vue'),
      children: route.children
    };

    // 添加layout路由
    router.addRoute(layoutRoute);

    // 打印添加后的路由
    console.log('动态路由添加成功，当前路由列表:',
      router.getRoutes().map(r => ({ name: r.name, path: r.path }))
    );
  } else {
    console.error('添加动态路由失败: 未找到layout路由或动态路由无子路由');
  }
}

/**
 * 前置路由导航守卫，用来根据用户刷新路由
 */
router.beforeEach(async (to, from, next) => {
  const hasToken = userStore.getToken;
  console.log('路由守卫执行 - hasToken:', hasToken, '目标路径:', to.path);

  // 1. 没有token的情况
  if (!hasToken) {
    // 如果访问的不是登录页，重定向到登录页
    if (to.path !== '/login') {
      console.log('无token，重定向到登录页');
      next('/login');
    } else {
      // 访问登录页，直接放行
      next();
    }
    return;
  }

  // 2. 有token的情况

  // 2.1 已登录用户访问登录页，重定向到首页
  if (to.path === '/login') {
    console.log('已登录用户访问登录页，重定向到首页');
    next('/');
    return;
  }

  // 2.2 检查是否已加载动态路由
  if (!PermissonStore.getHasLoadedRoutes) {
    console.log('动态路由未加载，开始获取...');

    // 如果正在加载中，等待加载完成
    if (PermissonStore.getIsLoading) {
      console.log('动态路由正在加载中，等待...');
      // 可以添加一个简单的等待逻辑或者直接返回
      next('/login'); // 或者显示加载页面
      return;
    }

    try {
      // 获取动态路由
      const success = await PermissonStore.getDynamicRoue();

      if (success && PermissonStore.dynamicRoues && PermissonStore.dynamicRoues.children && PermissonStore.dynamicRoues.children.length > 0) {
        console.log('动态路由获取成功，更新路由表');
        updateRouter(PermissonStore.dynamicRoues);

        // 如果访问的是根路径，重定向到默认页面
        if (to.path === '/') {
          // 获取第一个子路由作为默认路由
          const defaultRoute = PermissonStore.dynamicRoues.children[0]?.path || '/system/user';
          console.log('根路径重定向到:', defaultRoute);
          next(defaultRoute);
        } else {
          // 添加路由后，需要重新导航到目标页面，否则可能会404
          console.log('重新导航到目标页面:', to.path);
          next({ ...to, replace: true });
        }
      } else {
        console.error('获取动态路由失败: 返回的路由数据为空或加载失败');
        // 清除无效的token和缓存
        userStore.token = '';
        localStorage.removeItem('token');
        PermissonStore.clearCache();
        next('/login');
      }
    } catch (error) {
      console.error('获取动态路由异常:', error);
      // 获取失败时清除token和缓存，避免死循环
      userStore.token = '';
      localStorage.removeItem('token');
      PermissonStore.clearCache();
      next('/login');
    }
    return;
  }

  // 2.3 已加载动态路由，正常放行
  console.log('动态路由已加载，正常放行');
  next();
});

/**
 * 初始化路由
 * @param {App<Element>} app - Vue应用实例
 */
export const initRouter = (app: App<Element>) => {
  app.use(router)
}

// 导出路由实例
export default router