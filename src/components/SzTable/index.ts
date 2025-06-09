import type { App } from "vue";
import SzTable from "./index.vue";

/**
 * 注册按钮组件
 */
export default {
    install(app: App) {
        app.component("SzTable", SzTable);
    }
};

export { SzTable as DsButton };