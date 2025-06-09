import { ElMessage } from "element-plus";

export const HOOKS = {
    useError: (message?: string) => {
        ElMessage({
            message: message || '操作失败',
            type: 'error',
            duration: 5000,
        });
    }
}

/**
 * 刷新路由的 composable 函数
 * @returns {Object} 包含刷新路由方法和加载状态的对象
 */
export const useRefreshRoutes = () => {
    const refreshRoutes = async (showMessage: boolean = true) => {
        try {
            const { usePermissonStore } = await import('@/store/permission');
            const permissionStore = usePermissonStore();

            const success = await permissionStore.refreshRoutes(showMessage);
            return success;
        } catch (error) {
            console.error('刷新路由失败:', error);
            if (showMessage) {
                ElMessage.error('刷新路由失败，请重试');
            }
            return false;
        }
    };

    return {
        refreshRoutes
    };
};