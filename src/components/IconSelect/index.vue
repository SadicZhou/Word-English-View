<template>
    <div ref="iconSelectRef" :style="{ width: props.width }">
        <el-popover :visible="popoverVisible" :width="props.width" placement="bottom-end">
            <template #reference>
                <div @click="popoverVisible = !popoverVisible">
                    <slot>
                        <el-input v-model="selectedIcon" readonly placeholder="点击选择图标" class="reference">
                            <template #prepend>
                                <!-- 显示选中的图标 -->
                                <el-icon v-if="selectedIcon">
                                    <component :is="getIconComponent(selectedIcon)" />
                                </el-icon>
                                <el-icon v-else>
                                    <Setting />
                                </el-icon>
                            </template>
                            <template #suffix>
                                <!-- 清空按钮 -->
                                <el-icon v-if="selectedIcon" style="margin-right: 8px; cursor: pointer;"
                                    @click.stop="clearSelectedIcon">
                                    <CircleClose />
                                </el-icon>

                                <el-icon :style="{
                                    transform: popoverVisible ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform .5s',
                                    cursor: 'pointer'
                                }">
                                    <ArrowDown @click.stop="togglePopover" />
                                </el-icon>
                            </template>
                        </el-input>
                    </slot>
                </div>
            </template>

            <!-- 图标选择弹窗 -->
            <div ref="popoverContentRef">
                <el-input v-model="filterText" placeholder="搜索图标" clearable @input="filterIcons" />
                <el-scrollbar height="300px" style="margin-top: 10px;">
                    <ul class="icon-grid">
                        <li v-for="icon in filteredElementIcons" :key="icon" class="icon-grid-item"
                            :class="{ active: selectedIcon === icon }" @click="selectIcon(icon)">
                            <el-tooltip :content="icon" placement="bottom" effect="light">
                                <el-icon>
                                    <component :is="getIconComponent(icon)" />
                                </el-icon>
                            </el-tooltip>
                        </li>
                    </ul>
                </el-scrollbar>
            </div>
        </el-popover>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
    ArrowDown, CircleClose, Setting,
    Search, Plus, Refresh, User, Menu as MenuIcon, Location, Document,
    Folder, Bell, House as Home, Star, Delete, Edit, Calendar, Camera, ChatLineRound,
    Check, CircleCheck, Close, Download, Upload, Warning, InfoFilled,
    SuccessFilled, QuestionFilled, ArrowUp, ArrowLeft, ArrowRight
} from "@element-plus/icons-vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    width: {
        type: String,
        default: "200px",
    },
});

const emit = defineEmits(["update:modelValue"]);

const iconSelectRef = ref();
const popoverContentRef = ref();
const popoverVisible = ref(false);

// 可用的图标列表
const elementIcons = ref<string[]>([
    'Search', 'Plus', 'Refresh', 'Setting', 'User', 'MenuIcon', 'Location', 'Document',
    'Folder', 'Bell', 'Home', 'Star', 'Delete', 'Edit', 'Calendar', 'Camera', 'ChatLineRound',
    'Check', 'CircleCheck', 'Close', 'Download', 'Upload', 'Warning', 'InfoFilled',
    'SuccessFilled', 'QuestionFilled', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'
]);

const selectedIcon = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const filterText = ref("");
const filteredElementIcons = ref<string[]>(elementIcons.value);

/**
 * 根据图标名称获取图标组件
 */
const getIconComponent = (iconName: string): any => {
    const iconMap: Record<string, any> = {
        'Search': Search,
        'Plus': Plus,
        'Refresh': Refresh,
        'Setting': Setting,
        'User': User,
        'MenuIcon': MenuIcon,
        'Location': Location,
        'Document': Document,
        'Folder': Folder,
        'Bell': Bell,
        'Home': Home,
        'Star': Star,
        'Delete': Delete,
        'Edit': Edit,
        'Calendar': Calendar,
        'Camera': Camera,
        'ChatLineRound': ChatLineRound,
        'Check': Check,
        'CircleCheck': CircleCheck,
        'Close': Close,
        'Download': Download,
        'Upload': Upload,
        'Warning': Warning,
        'InfoFilled': InfoFilled,
        'SuccessFilled': SuccessFilled,
        'QuestionFilled': QuestionFilled,
        'ArrowDown': ArrowDown,
        'ArrowUp': ArrowUp,
        'ArrowLeft': ArrowLeft,
        'ArrowRight': ArrowRight
    };

    return iconMap[iconName] || Setting;
};

/**
 * 过滤图标
 */
function filterIcons() {
    filteredElementIcons.value = filterText.value
        ? elementIcons.value.filter((icon) =>
            icon.toLowerCase().includes(filterText.value.toLowerCase())
        )
        : elementIcons.value;
}

/**
 * 选择图标
 */
function selectIcon(icon: string) {
    selectedIcon.value = icon;
    popoverVisible.value = false;
    filterText.value = '';
    filterIcons();
}

/**
 * 切换弹窗显示状态
 */
function togglePopover() {
    popoverVisible.value = !popoverVisible.value;
}

/**
 * 清空已选图标
 */
function clearSelectedIcon() {
    selectedIcon.value = "";
}

/**
 * 处理点击外部关闭弹窗
 */
function handleClickOutside(event: Event) {
    if (!iconSelectRef.value || !popoverContentRef.value) return;

    const target = event.target as Element;
    // 检查点击的元素是否在组件内部或弹窗内容区域
    if (!iconSelectRef.value.contains(target) && !popoverContentRef.value.contains(target)) {
        popoverVisible.value = false;
    }
}

onMounted(() => {
    filterIcons();
    // 添加点击外部关闭弹窗的事件监听器
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    // 移除事件监听器
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
.reference :deep(.el-input__wrapper),
.reference :deep(.el-input__inner) {
    cursor: pointer;
}

.icon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 0;
}

.icon-grid-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
        border-color: #409eff;
        background-color: #ecf5ff;
        transform: scale(1.1);
    }

    &.active {
        border-color: #409eff;
        background-color: #409eff;
        color: white;
    }

    .el-icon {
        font-size: 18px;
    }
}
</style>