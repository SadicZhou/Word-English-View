import { remove } from "lodash";
import { defineStore } from "pinia";
import { usePermissonStore } from "./permission";

export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: localStorage.getItem('token') || ""
    }),
    actions: {
        /**
         * 刷新token
         * @param {string} token - 新的token
         */
        refeshToken(token: string) {
            this.token = token
            localStorage.setItem("token", token)
        },

        /**
         * 移除token
         */
        async removeToken() {
            this.token = ""
            localStorage.removeItem("token")
        },

        /**
         * 用户登出，清理所有相关数据
         */
        async logout() {
            // 先清除token，确保路由守卫能立即检测到
            this.token = "";
            localStorage.removeItem("token");

            // 清除其他用户相关数据
            localStorage.removeItem("username");
            localStorage.removeItem("avatar");

            // 清理权限相关缓存 - 等待完成以确保清理彻底
            const permissionStore = usePermissonStore();
            await permissionStore.resetRoutes();

            console.log('用户登出，所有缓存已清理');
        }
    },
    getters: {
        /**
         * 格式化token，添加Bearer前缀
         * @returns {string} 格式化后的token
         */
        formateToken(): string {
            return "Bearer " + this.token
        },

        /**
         * 获取token
         * @returns {string} 当前token
         */
        getToken(): string {
            return this.token
        },
    }
})
