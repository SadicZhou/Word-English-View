import { defineStore } from "pinia";

export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: localStorage.getItem('token') || ""
    }),
    actions: {
        refeshToken(token: string) {
            this.token = token
            localStorage.setItem("token", token)
        }
    },
    getters: {
        formateToken(): string {
            return "Bearer " + this.token
        }
    }
})