import { remove } from "lodash";
import { defineStore } from "pinia";
import { usePermissonStore } from "./permission";

export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: localStorage.getItem('token') || "",
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
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
         * 设置用户信息
         * @param {object} userInfo - 用户信息对象
         */
        setUserInfo(userInfo: any) {
            this.userInfo = userInfo
            localStorage.setItem("userInfo", JSON.stringify(userInfo))

            // 如果用户信息中包含token，同时更新token
            if (userInfo.token) {
                this.refeshToken(userInfo.token)
            }
        },

        /**
         * 更新用户信息
         * @param {object} updateData - 要更新的用户信息
         */
        updateUserInfo(updateData: any) {
            this.userInfo = { ...this.userInfo, ...updateData }
            localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
        },

        /**
         * 移除用户信息
         */
        removeUserInfo() {
            this.userInfo = {}
            localStorage.removeItem("userInfo")
        },

        /**
         * 用户登出，清理所有相关数据
         */
        async logout() {
            // 先清除token，确保路由守卫能立即检测到
            this.token = "";
            localStorage.removeItem("token");

            // 清除用户信息
            this.userInfo = {};
            localStorage.removeItem("userInfo");

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

        /**
         * 获取用户信息
         * @returns {object} 当前用户信息
         */
        getUserInfo(): any {
            return this.userInfo
        },

        /**
         * 获取用户名
         * @returns {string} 用户名
         */
        getUserName(): string {
            return this.userInfo.name || this.userInfo.username || ''
        },

        /**
         * 获取用户头像
         * @returns {string} 用户头像URL
         */
        getUserAvatar(): string {
            return this.userInfo.avatar || ''
        },

        /**
         * 获取用户角色
         * @returns {string} 用户角色
         */
        getUserRole(): string {
            return this.userInfo.role || ''
        }
    }
})
