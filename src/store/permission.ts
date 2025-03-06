import { Code } from "@/config/code";
import { HOOKS } from "@/hooks";
import { dynamicRoue } from "@/service/user"
import { defineStore } from "pinia";
import { RouteRecordRaw } from "vue-router";

export const usePermissonStore = defineStore("PermissonStore", {
    state: () => ({
        dynamicRoues: <RouteRecordRaw>{},
        menus: <SYSTEM.menu[]>[]
    }),
    actions: {
        async getDynamicRoue() {
            try {
                const res = await dynamicRoue()
                const { data, code, message } = res
                if (code == Code.SUCCESS_CODE && message == Code.SUCCESS) {
                    console.log(data, 'menus===>')
                    this.menus = data
                    this.dynamicRoues = this.getGenerateRoutes()
                }
            } catch (error) {
                HOOKS.useError()
            }
        },
        /**
         * 生成动态路由配置
         * @returns {RouteRecordRaw} 路由配置对象
         */
        getGenerateRoutes(): RouteRecordRaw {
            /**
             * 递归处理菜单项，生成路由配置
             * @param {SYSTEM.menu[]} menus - 菜单数据
             * @returns {RouteRecordRaw[]} 路由配置数组
             */
            const generateChildRoutes = (menus: SYSTEM.menu[]): RouteRecordRaw[] => {
                const routes: RouteRecordRaw[] = [];

                menus.forEach(menu => {
                    if (menu.path) {
                        // 创建当前菜单的路由配置
                        const route: RouteRecordRaw = {
                            path: menu.path,
                            name: menu.name,
                            component: menu.component
                                ? () => import(`@/views/${menu.component}.vue`)
                                : () => import('@/views/404page/index.vue'),
                            meta: {
                                title: menu.title,
                                hidden: false
                            },
                            children: [] // 初始化children为空数组
                        };

                        // 如果有子菜单，递归处理子菜单
                        if (menu.children && menu.children.length > 0) {
                            route.children = generateChildRoutes(menu.children);
                        }

                        routes.push(route);
                    } else if (menu.children && menu.children.length > 0) {
                        // 如果当前菜单没有路径但有子菜单，直接将子菜单添加到routes中
                        // 这种情况通常是菜单分组，不对应实际页面
                        const childRoutes = generateChildRoutes(menu.children);
                        routes.push(...childRoutes);
                    }
                });

                return routes;
            };

            // 返回layout路由，包含所有子路由
            return {
                path: "/",
                name: 'layout',
                component: () => import('@/views/Layout/index.vue'),
                redirect: this.menus.length > 0 && this.menus[0].children && this.menus[0].children.length > 0
                    ? (this.menus[0].children[0].path || '/system/user')  // 重定向到第一个子菜单
                    : '/system/user',  // 默认重定向
                children: generateChildRoutes(this.menus)
            };
        }
    },
    getters: {

    }
})