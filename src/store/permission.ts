import { Code } from "@/config/code";
import { HOOKS } from "@/hooks";
import { dynamicRoue } from "@/service/user"
import { defineStore } from "pinia";
import { RouteRecordRaw } from "vue-router";

export const usePermissonStore = defineStore("PermissonStore", {
    state: () => ({
        dynamicRoues: <RouteRecordRaw>{},
        menus: <SYSTEM.menu[]>[],
        hasLoadedRoutes: false, // 添加路由加载状态标志
        isLoading: false // 添加请求进行中标志，避免重复请求
    }),
    actions: {
        /**
         * 获取动态路由菜单数据
         * @returns {Promise<boolean>} 返回是否成功获取路由
         */
        async getDynamicRoue(): Promise<boolean> {
            // 如果已经加载过路由，直接返回成功
            if (this.hasLoadedRoutes && this.menus.length > 0) {
                console.log('动态路由已缓存，直接使用缓存数据');
                return true;
            }

            // 如果正在请求中，避免重复请求
            if (this.isLoading) {
                console.log('动态路由请求进行中，等待完成...');
                return false;
            }

            this.isLoading = true;

            try {
                console.log('开始获取动态路由...');
                const res = await dynamicRoue();
                const { data, code, message } = res;

                if (code == Code.SUCCESS_CODE && message == Code.SUCCESS) {
                    console.log('动态路由获取成功:', data);
                    // 修正菜单路径后再赋值
                    this.menus = this.fixMenuPaths(data);
                    this.dynamicRoues = this.getGenerateRoutes();
                    this.hasLoadedRoutes = true;

                    // 缓存到本地存储
                    try {
                        localStorage.setItem('cached_menus', JSON.stringify(data));
                        localStorage.setItem('menus_cache_time', Date.now().toString());
                    } catch (error) {
                        console.warn('缓存菜单数据失败:', error);
                    }

                    return true;
                } else {
                    console.error('获取动态路由失败:', message);
                    throw new Error(`获取菜单失败: ${message}`);
                }
            } catch (error) {
                console.error('动态路由请求异常:', error);
                this.hasLoadedRoutes = false;

                // 尝试使用缓存数据
                const success = this.loadFromCache();
                if (!success) {
                    // 显示错误提示
                    HOOKS.useError();
                    throw error; // 重新抛出错误，让路由守卫能够处理
                }
                return success;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 手动刷新路由和菜单数据
         * @param {boolean} showMessage - 是否显示成功消息，默认为true
         * @returns {Promise<boolean>} 返回是否刷新成功
         */
        async refreshRoutes(showMessage: boolean = true): Promise<boolean> {
            try {
                console.log('手动刷新路由开始...');

                // 清除当前缓存和状态
                this.clearCache();

                // 重新获取菜单数据
                const success = await this.getDynamicRoue();

                if (success && this.dynamicRoues && this.dynamicRoues.children && this.dynamicRoues.children.length > 0) {
                    console.log('路由刷新成功，更新路由表...');

                    // 动态导入 updateRouter 避免循环依赖
                    const { updateRouter } = await import('@/router/index');
                    updateRouter(this.dynamicRoues);

                    if (showMessage) {
                        // 动态导入 ElMessage 避免循环依赖
                        const { ElMessage } = await import('element-plus');
                        ElMessage.success('菜单刷新成功');
                    }
                    return true;
                } else {
                    console.error('路由刷新失败');
                    if (showMessage) {
                        const { ElMessage } = await import('element-plus');
                        ElMessage.error('菜单刷新失败');
                    }
                    return false;
                }
            } catch (error) {
                console.error('路由刷新异常:', error);
                if (showMessage) {
                    const { ElMessage } = await import('element-plus');
                    ElMessage.error('菜单刷新失败，请重试');
                }
                return false;
            }
        },

        /**
         * 从本地缓存加载菜单数据
         * @returns {boolean} 是否成功从缓存加载
         */
        loadFromCache(): boolean {
            try {
                const cachedMenus = localStorage.getItem('cached_menus');
                const cacheTime = localStorage.getItem('menus_cache_time');

                if (cachedMenus && cacheTime) {
                    const cacheAge = Date.now() - parseInt(cacheTime);
                    const maxAge = 24 * 60 * 60 * 1000; // 24小时缓存有效期

                    if (cacheAge < maxAge) {
                        console.log('使用缓存的菜单数据');
                        // 缓存数据也需要修正路径
                        this.menus = this.fixMenuPaths(JSON.parse(cachedMenus));
                        this.dynamicRoues = this.getGenerateRoutes();
                        this.hasLoadedRoutes = true;
                        return true;
                    } else {
                        console.log('缓存已过期，清除缓存');
                        this.clearCache();
                    }
                }
            } catch (error) {
                console.error('加载缓存失败:', error);
                this.clearCache();
            }
            return false;
        },

        /**
         * 清除缓存数据
         */
        clearCache() {
            localStorage.removeItem('cached_menus');
            localStorage.removeItem('menus_cache_time');
            this.hasLoadedRoutes = false;
            this.menus = [];
            this.dynamicRoues = {} as RouteRecordRaw;
        },

        /**
         * 重置路由状态（用于用户登出时清理）
         */
        resetRoutes() {
            this.clearCache();
            this.isLoading = false;
        },

        /**
         * 修正菜单路径，确保菜单点击时跳转到正确的路由
         * @param {SYSTEM.menu[]} menus - 原始菜单数据
         * @returns {SYSTEM.menu[]} 修正后的菜单数据
         */
        fixMenuPaths(menus: SYSTEM.menu[]): SYSTEM.menu[] {
            const fixPath = (menu: SYSTEM.menu): SYSTEM.menu => {
                const fixedMenu = { ...menu };

                // 修正路径中的问题
                if (fixedMenu.path) {
                    let originalPath = fixedMenu.path;

                    // 修正商品管理相关路径：从 /system/Product 开头改为 /Product
                    if (originalPath.includes('/system/Product')) {
                        fixedMenu.path = originalPath.replace('/system/Product', '/Product');
                    }

                    // 修正网站管理相关路径：从 /system/Website 开头改为 /Website
                    if (originalPath.includes('/system/Website')) {
                        fixedMenu.path = originalPath.replace('/system/Website', '/Website');
                    }

                    // 确保路径以 / 开头
                    if (!fixedMenu.path.startsWith('/')) {
                        fixedMenu.path = '/' + fixedMenu.path;
                    }
                }

                // 递归修正子菜单
                if (fixedMenu.children && fixedMenu.children.length > 0) {
                    fixedMenu.children = fixedMenu.children.map(child => fixPath(child));
                }

                return fixedMenu;
            };

            return menus.map(menu => fixPath(menu));
        },

        /**
         * 生成动态路由配置
         * @returns {RouteRecordRaw} 路由配置对象
         */
        getGenerateRoutes(): RouteRecordRaw {
            console.log('=== 开始生成动态路由 ===');
            console.log('原始菜单数据:', this.menus);

            /**
             * 生成路由名称
             * @param {string} path - 路径
             * @param {string} title - 标题
             * @returns {string} 路由名称
             */
            const generateRouteName = (path: string, title: string): string => {
                // 如果路径包含斜杠，用驼峰命名法生成名称
                const segments = path.split('/').filter(segment => segment);
                if (segments.length > 0) {
                    return segments.map((segment, index) => {
                        // 首字母大写，其余转驼峰
                        return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
                    }).join('');
                }
                // 回退到基于标题的名称
                return title.replace(/\s+/g, '');
            };

            /**
             * 递归处理菜单项，生成路由配置
             * @param {SYSTEM.menu[]} menus - 菜单数据
             * @returns {RouteRecordRaw[]} 路由配置数组
             */
            const generateChildRoutes = (menus: SYSTEM.menu[]): RouteRecordRaw[] => {
                const routes: RouteRecordRaw[] = [];

                menus.forEach(menu => {
                    console.log(`处理菜单: "${menu.title}"`);
                    console.log(`  - 原始路径: ${menu.path}`);
                    console.log(`  - 原始名称: ${menu.name}`);
                    console.log(`  - 组件: ${menu.component}`);

                    if (menu.path) {
                        // 确保路由名称不为空
                        let routeName = menu.name;
                        if (!routeName || routeName.trim() === '') {
                            routeName = generateRouteName(menu.path, menu.title);
                            console.log(`  - 生成新名称: ${routeName}`);
                        }

                        // 创建路由配置
                        const route: RouteRecordRaw = {
                            path: menu.path,
                            name: routeName,
                            component: menu.component
                                ? () => import(`@/views/${menu.component}.vue`)
                                : () => import('@/views/404page/index.vue'),
                            meta: {
                                title: menu.title,
                                hidden: false,
                                icon: menu.icon
                            }
                        };

                        console.log(`  - 最终路由: ${route.path} -> ${routeName}`);

                        // 处理子菜单
                        if (menu.children && menu.children.length > 0) {
                            console.log(`  - 有 ${menu.children.length} 个子菜单，开始递归处理`);
                            const childRoutes = generateChildRoutes(menu.children);

                            if (childRoutes.length > 0) {
                                (route as any).children = childRoutes;

                                // 设置重定向到第一个子路由
                                const firstValidChild = childRoutes.find(child => child.path && child.component);
                                if (firstValidChild) {
                                    (route as any).redirect = firstValidChild.path;
                                    console.log(`  - 设置重定向: ${route.path} -> ${firstValidChild.path}`);
                                }
                            }
                        }

                        routes.push(route);
                        console.log(`  ✓ 路由添加成功`);
                    } else if (menu.children && menu.children.length > 0) {
                        // 无路径但有子菜单的情况（菜单分组）
                        console.log(`  - 菜单分组，展开 ${menu.children.length} 个子菜单`);
                        const childRoutes = generateChildRoutes(menu.children);
                        routes.push(...childRoutes);
                        console.log(`  ✓ 子菜单展开完成`);
                    } else {
                        console.log(`  ⚠ 跳过菜单：无路径且无子菜单`);
                    }
                });

                return routes;
            };

            const generatedRoutes = generateChildRoutes(this.menus);

            console.log('=== 路由生成完成 ===');
            console.log(`总共生成 ${generatedRoutes.length} 个路由`);
            generatedRoutes.forEach((route, index) => {
                console.log(`${index + 1}. ${route.path} -> ${String(route.name)} (${route.meta?.title})`);
            });

            // 检查路由冲突
            const pathMap = new Map<string, number>();
            generatedRoutes.forEach(route => {
                const count = pathMap.get(route.path) || 0;
                pathMap.set(route.path, count + 1);
            });

            pathMap.forEach((count, path) => {
                if (count > 1) {
                    console.warn(`⚠ 路径冲突: ${path} 出现了 ${count} 次`);
                }
            });

            // 返回layout路由
            const layoutRoute = {
                path: "/",
                name: 'Layout',
                component: () => import('@/views/Layout/index.vue'),
                redirect: this.getDefaultRedirect(),
                children: generatedRoutes
            };

            console.log(`Layout 默认重定向: ${layoutRoute.redirect}`);
            console.log('=== 路由生成结束 ===');

            return layoutRoute;
        },

        /**
         * 获取默认重定向路径
         * @returns {string} 默认重定向路径
         */
        getDefaultRedirect(): string {
            const findFirstValidPath = (menus: SYSTEM.menu[]): string | null => {
                for (const menu of menus) {
                    if (menu.path) {
                        return menu.path;
                    }
                    if (menu.children && menu.children.length > 0) {
                        const childPath = findFirstValidPath(menu.children);
                        if (childPath) {
                            return childPath;
                        }
                    }
                }
                return null;
            };

            const defaultPath = findFirstValidPath(this.menus);
            return defaultPath || '/system/user';
        }
    },
    getters: {
        /**
         * 获取是否已加载路由
         */
        getHasLoadedRoutes: (state) => state.hasLoadedRoutes,

        /**
         * 获取是否正在加载中
         */
        getIsLoading: (state) => state.isLoading
    }
})