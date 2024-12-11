import { ElMessage } from 'element-plus';
import { login } from "@/service/user"
import { useRouter } from "vue-router";
import { Ref } from 'vue';
import router from "@/router"
import { useUserStore } from '@/store/user';
const userStore = useUserStore()
export async function useLogin(form: LOGIN.loginParams, saving: Ref<boolean>) {
    if (!form.account) {
        return ElMessage.error("账号不能为空");
    }
    if (!form.password) {
        return ElMessage.error("密码不能为空");
    }
    saving.value = true;
    try {
        const res = await login(form)
        if (res.message == '操作成功' && res.code === 200) {
            const { data, message } = res
            console.log(data, "data=====>")
            ElMessage.success(message)
            const dynamicRoue = await userStore.getDynamicRoue()
            // 跳转首页
            console.log(router, useRouter)
            router.push("/layout");
        } else {
            ElMessage.error(res.message);

        }

    } catch (err: any) {
        ElMessage.error(err.message);
    }

    saving.value = false;

}
