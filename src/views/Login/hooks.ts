import { ElMessage } from 'element-plus';
import { login } from "@/service/user"
import { useRouter } from "vue-router";
import { usePermissonStore } from '@/store/permission';
import { Ref } from 'vue';

export function useLogin() {
    const permissionStore = usePermissonStore();
    const router = useRouter()

    const onSubmit = async (form: LOGIN.loginParams, saving: Ref<boolean>) => {
        if (!form.account) {
            return ElMessage.error("账号不能为空");
        }
        if (!form.password) {
            return ElMessage.error("密码不能为空");
        }

        saving.value = true;
        try {
            const res = await login(form);

            if (res.message == '操作成功' && res.code === 200) {
                const { data, message } = res;
                ElMessage.success(message);

                // 清理旧的路由缓存，让路由守卫重新获取
                permissionStore.clearCache();

                // 跳转首页，路由守卫会自动处理动态路由加载
                router.push("/");
            } else {
                ElMessage.error(res.message);
            }
        } catch (err: any) {
            ElMessage.error(err.message);
        }

        saving.value = false;
    }

    return {
        onSubmit
    }
}
