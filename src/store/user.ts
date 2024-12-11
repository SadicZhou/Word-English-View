import { defineStore } from "pinia";
import { dynamicRoue } from "@/service/user"
import { HOOKS } from "@/hooks";
export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: localStorage.getItem('token') || ""
    }),
    actions: {
        refeshToken(token: string) {
            this.token = token
            localStorage.setItem("token", token)
        },
        async getDynamicRoue() {
            try {
                const res = await dynamicRoue()
                console.log(res, '动态路由')
            } catch (error) {
                HOOKS.useError()
            }
        }
    },
    getters: {
        formateToken(): string {
            return "Bearer " + this.token
        }
    }
})