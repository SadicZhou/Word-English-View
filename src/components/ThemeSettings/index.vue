<template>
  <el-drawer
    v-model="drawerVisible"
    title="主题设置"
    size="300px"
    :with-header="true"
    :destroy-on-close="false"
  >
    <div class="theme-settings">
      <el-divider content-position="left">主题颜色</el-divider>
      
      <!-- 主题颜色选择 -->
      <div class="theme-color-section">
        <div class="color-title">主题色</div>
        <div class="color-picker">
          <div
            v-for="(color, index) in themeColors"
            :key="index"
            class="color-item"
            :style="{ backgroundColor: color }"
            :class="{ active: themeColor === color }"
            @click="changeThemeColor(color)"
          ></div>
        </div>
      </div>
      
      <!-- 菜单主题选择 -->
      <div class="menu-theme-section">
        <div class="section-title">菜单主题</div>
        <div class="theme-options">
          <div
            class="theme-option"
            :class="{ active: menuTheme === 'dark' }"
            @click="changeMenuTheme('dark')"
          >
            <div class="option-preview dark-preview">
              <div class="preview-sidebar"></div>
              <div class="preview-content"></div>
            </div>
            <div class="option-label">深色</div>
          </div>
          <div
            class="theme-option"
            :class="{ active: menuTheme === 'light' }"
            @click="changeMenuTheme('light')"
          >
            <div class="option-preview light-preview">
              <div class="preview-sidebar"></div>
              <div class="preview-content"></div>
            </div>
            <div class="option-label">浅色</div>
          </div>
        </div>
      </div>
      
      <el-divider content-position="left">界面设置</el-divider>
      
      <!-- 界面设置选项 -->
      <div class="interface-settings">
        <el-switch
          v-model="fixedHeader"
          active-text="固定头部"
          @change="toggleFixedHeader"
        />
      </div>
      
      <div class="interface-settings">
        <el-switch
          v-model="showBreadcrumb"
          active-text="显示面包屑"
          @change="toggleBreadcrumb"
        />
      </div>
      
      <div class="interface-settings">
        <el-switch
          v-model="compactMenu"
          active-text="紧凑菜单"
          @change="toggleCompactMenu"
        />
      </div>
      
      <!-- 重置按钮 -->
      <div class="reset-section">
        <el-button type="danger" @click="resetSettings">恢复默认设置</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useThemeStore } from '@/store/theme';

// 主题设置抽屉可见性
const drawerVisible = ref(false);
const themeStore = useThemeStore();

// 主题颜色选项
const themeColors = [
  '#1890ff', // 默认蓝色
  '#f5222d', // 红色
  '#fa8c16', // 橙色
  '#faad14', // 黄色
  '#52c41a', // 绿色
  '#13c2c2', // 青色
  '#2f54eb', // 蓝色
  '#722ed1'  // 紫色
];

// 主题设置
const themeColor = ref(themeStore.themeColor);
const menuTheme = ref(themeStore.menuTheme);
const fixedHeader = ref(themeStore.fixedHeader);
const showBreadcrumb = ref(themeStore.showBreadcrumb);
const compactMenu = ref(themeStore.compactMenu);

// 监听主题设置变化
watch(() => themeStore.themeColor, (newVal) => {
  themeColor.value = newVal;
});

watch(() => themeStore.menuTheme, (newVal) => {
  menuTheme.value = newVal;
});

// 更改主题颜色
const changeThemeColor = (color: string) => {
  themeColor.value = color;
  themeStore.setThemeColor(color);
  applyThemeColor(color);
};

// 更改菜单主题
const changeMenuTheme = (theme: 'dark' | 'light') => {
  menuTheme.value = theme;
  themeStore.setMenuTheme(theme);
  
  // 添加一个延迟，确保 DOM 更新后再应用样式
  setTimeout(() => {
    applyMenuTheme(theme);
  }, 0);
};

// 应用菜单主题
const applyMenuTheme = (theme: 'dark' | 'light') => {
  // 这里可以添加额外的菜单主题应用逻辑
  console.log(`应用菜单主题: ${theme}`);
};

// 切换固定头部
const toggleFixedHeader = (value: boolean) => {
  themeStore.setFixedHeader(value);
};

// 切换面包屑显示
const toggleBreadcrumb = (value: boolean) => {
  themeStore.setShowBreadcrumb(value);
};

// 切换紧凑菜单
const toggleCompactMenu = (value: boolean) => {
  themeStore.setCompactMenu(value);
};

// 重置所有设置
const resetSettings = () => {
  themeStore.resetSettings();
  themeColor.value = themeStore.themeColor;
  menuTheme.value = themeStore.menuTheme;
  fixedHeader.value = themeStore.fixedHeader;
  showBreadcrumb.value = themeStore.showBreadcrumb;
  compactMenu.value = themeStore.compactMenu;
  applyThemeColor(themeColor.value);
  applyMenuTheme(menuTheme.value);
};

// 应用主题颜色到CSS变量
const applyThemeColor = (color: string) => {
  const root = document.documentElement;
  
  // 设置主色调
  root.style.setProperty('--el-color-primary', color);
  
  // 生成不同深浅的主题色
  const colorObj = generateThemeColors(color);
  
  // 设置不同深浅的主题色
  for (let i = 1; i <= 9; i++) {
    root.style.setProperty(`--el-color-primary-light-${i}`, colorObj[`light-${i}`]);
  }
  
  root.style.setProperty('--el-color-primary-dark-2', colorObj['dark-2']);
};

// 生成不同深浅的主题色
const generateThemeColors = (primary: string) => {
  const colors: Record<string, string> = {};
  
  // 简单实现，实际项目中可以使用更复杂的颜色计算库
  // 这里只是一个示例，实际效果可能不够精确
  
  // 生成浅色系列
  for (let i = 1; i <= 9; i++) {
    const lightRatio = 1 - (i * 0.1);
    colors[`light-${i}`] = lightenColor(primary, lightRatio);
  }
  
  // 生成深色
  colors['dark-2'] = darkenColor(primary, 0.2);
  
  return colors;
};

// 颜色变浅函数
const lightenColor = (color: string, ratio: number) => {
  // 简单实现，将颜色与白色混合
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  const newR = Math.round(r + (255 - r) * (1 - ratio));
  const newG = Math.round(g + (255 - g) * (1 - ratio));
  const newB = Math.round(b + (255 - b) * (1 - ratio));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// 颜色变深函数
const darkenColor = (color: string, ratio: number) => {
  // 简单实现，将颜色与黑色混合
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  const newR = Math.round(r * (1 - ratio));
  const newG = Math.round(g * (1 - ratio));
  const newB = Math.round(b * (1 - ratio));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// 打开设置抽屉
const openDrawer = () => {
  drawerVisible.value = true;
};

// 关闭设置抽屉
const closeDrawer = () => {
  drawerVisible.value = false;
};

// 组件挂载时应用当前主题
onMounted(() => {
  applyThemeColor(themeColor.value);
  applyMenuTheme(menuTheme.value);
});

// 暴露方法给父组件
defineExpose({
  openDrawer,
  closeDrawer
});
</script>

<style scoped lang="scss">
.theme-settings {
  padding: 0 16px;
  
  .theme-color-section {
    margin-bottom: 20px;
    
    .color-title {
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .color-item {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        
        &:hover {
          transform: scale(1.1);
        }
        
        &.active {
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--el-color-primary);
          
          &::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
          }
        }
      }
    }
  }
  
  .menu-theme-section {
    margin-bottom: 20px;
    
    .section-title {
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .theme-options {
      display: flex;
      gap: 15px;
      
      .theme-option {
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          opacity: 0.8;
        }
        
        &.active {
          .option-preview {
            border: 2px solid var(--el-color-primary);
          }
          
          .option-label {
            color: var(--el-color-primary);
          }
        }
        
        .option-preview {
          width: 80px;
          height: 50px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          border: 2px solid transparent;
          transition: all 0.3s;
          
          &.dark-preview {
            .preview-sidebar {
              background-color: #001529;
            }
            
            .preview-content {
              background-color: #f0f2f5;
            }
          }
          
          &.light-preview {
            .preview-sidebar {
              background-color: #fff;
              border-right: 1px solid #f0f0f0;
            }
            
            .preview-content {
              background-color: #f0f2f5;
            }
          }
          
          .preview-sidebar {
            width: 30%;
            height: 100%;
          }
          
          .preview-content {
            width: 70%;
            height: 100%;
          }
        }
        
        .option-label {
          margin-top: 5px;
          text-align: center;
          font-size: 12px;
        }
      }
    }
  }
  
  .interface-settings {
    margin-bottom: 15px;
  }
  
  .reset-section {
    margin-top: 30px;
    text-align: center;
  }
}
</style> 