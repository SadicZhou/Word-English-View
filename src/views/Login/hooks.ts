import { ElMessage } from 'element-plus';
import { login } from "@/service/user"
import { useRouter } from "vue-router";
import { usePermissonStore } from '@/store/permission';
import { Ref } from 'vue';

export function useLogin() {
    const { getDynamicRoue } = usePermissonStore();
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
            const res = await login(form)
            await getDynamicRoue();
            if (res.message == '操作成功' && res.code === 200) {
                const { data, message } = res
                ElMessage.success(message)
                // 跳转首页
                router.push("/layout");
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
