import { ElMessage } from "element-plus";

export function useError(msg?: string) {
    ElMessage({
        type: "error",
        message: msg ? msg : "网络开小差了",
    });
}