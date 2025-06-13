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

                // 强制清理所有缓存，确保重新获取最新路由
                permissionStore.clearCache();

                // 强制重新获取路由数据（不使用任何缓存）
                console.log('登录成功，强制重新获取最新路由...');
                const routeSuccess = await permissionStore.forceRefreshRoutes();

                if (routeSuccess) {
                    console.log('路由获取成功，跳转首页');
                    // 跳转首页
                    router.push("/");
                } else {
                    console.error('获取路由失败，但仍然跳转首页，让路由守卫处理');
                    // 如果强制获取失败，仍然跳转，让路由守卫处理
                    router.push("/");
                }
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
