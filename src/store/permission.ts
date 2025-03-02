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
                    // 处理一级菜单
                    if (menu.children && menu.children.length > 0) {
                        // 如果有子菜单，将子菜单直接添加到routes中
                        menu.children.forEach(child => {
                            routes.push({
                                path: child.path,
                                name: child.name,
                                component: child.component
                                    ? () => import(`@/views/${child.component}.vue`)
                                    : () => import('@/views/404page/index.vue'),
                                meta: {
                                    title: child.title,
                                    hidden: false
                                }
                            });
                        });
                    } else if (menu.path) {
                        // 如果没有子菜单但有路径，直接添加到routes
                        routes.push({
                            path: menu.path,
                            name: menu.name,
                            component: menu.component
                                ? () => import(`@/views/${menu.component}.vue`)
                                : () => import('@/views/404page/index.vue'),
                            meta: {
                                title: menu.title,
                                hidden: false
                            }
                        });
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
                    ? this.menus[0].children[0].path  // 重定向到第一个子菜单
                    : '/system/user',  // 默认重定向
                children: generateChildRoutes(this.menus)
            };
        }
    },
    getters: {

    }
})