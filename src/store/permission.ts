import { Code } from "@/config/code";
import { HOOKS } from "@/hooks";
import { dynamicRoue } from "@/service/user"
import { defineStore } from "pinia";
import { RouteRecordRaw } from "vue-router";

export const usePermissonStore = defineStore("PermissonStore", {
    state: () => ({
        dynamicRoues: <RouteRecordRaw[]>[],
        menus: <SYSTEM.menu[]>[]
    }),
    actions: {
        async getDynamicRoue() {
            try {
                const res = await dynamicRoue()
                console.log(res, '动态路由')
                const { data, code, message } = res
                if (code == Code.SUCCESS_CODE && message == Code.SUCCESS) {
                    this.menus = data
                }
            } catch (error) {
                HOOKS.useError()
            }
        }
    },
    getters: {
        getGenerateRoutes(): RouteRecordRaw[] {
            const generateRoutes = (menus: SYSTEM.menu[]): RouteRecordRaw[] => {
                return menus.map(item => {
                    const route: RouteRecordRaw = {
                        path: `/${item.path}`,
                        name: item.component, // 假设菜单项中有name属性
                        component: () => import(`@/views/${item.component}.vue`), // 假设组件路径是views下的
                        children: item.children ? generateRoutes(item.children) : [] // 递归处理子菜单
                    };
                    return route;
                });
            };
            return generateRoutes(this.menus);
        },
    }
})