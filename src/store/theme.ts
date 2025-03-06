import { defineStore } from 'pinia';

interface ThemeState {
    themeColor: string;
    menuTheme: 'dark' | 'light';
    fixedHeader: boolean;
    showBreadcrumb: boolean;
    showTags: boolean;
    compactMenu: boolean;
    contentWidth: number;
    animationEffect: string;
}

export const useThemeStore = defineStore('theme', {
    state: (): ThemeState => {
        // 从本地存储中获取主题设置，如果没有则使用默认值
        const savedTheme = localStorage.getItem('themeSettings');
        const defaultTheme: ThemeState = {
            themeColor: '#1890ff',
            menuTheme: 'dark',
            fixedHeader: true,
            showBreadcrumb: true,
            showTags: true,
            compactMenu: false,
            contentWidth: 1200,
            animationEffect: 'fade'
        };

        return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
    },

    actions: {
        // 设置主题颜色
        setThemeColor(color: string) {
            this.themeColor = color;
            this.saveSettings();
        },

        // 设置菜单主题
        setMenuTheme(theme: 'dark' | 'light') {
            this.menuTheme = theme;
            this.saveSettings();
        },

        // 设置固定头部
        setFixedHeader(value: boolean) {
            this.fixedHeader = value;
            this.saveSettings();
        },

        // 设置显示面包屑
        setShowBreadcrumb(value: boolean) {
            this.showBreadcrumb = value;
            this.saveSettings();
        },

        // 设置显示标签栏
        setShowTags(value: boolean) {
            this.showTags = value;
            this.saveSettings();
        },

        // 设置紧凑菜单
        setCompactMenu(value: boolean) {
            this.compactMenu = value;
            this.saveSettings();
        },

        // 设置内容区域宽度
        setContentWidth(value: number) {
            this.contentWidth = value;
            this.saveSettings();
        },

        // 设置动画效果
        setAnimationEffect(value: string) {
            this.animationEffect = value;
            this.saveSettings();
        },

        // 重置所有设置
        resetSettings() {
            this.themeColor = '#1890ff';
            this.menuTheme = 'dark';
            this.fixedHeader = true;
            this.showBreadcrumb = true;
            this.showTags = true;
            this.compactMenu = false;
            this.contentWidth = 1200;
            this.animationEffect = 'fade';
            this.saveSettings();
        },

        // 保存设置到本地存储
        saveSettings() {
            localStorage.setItem('themeSettings', JSON.stringify({
                themeColor: this.themeColor,
                menuTheme: this.menuTheme,
                fixedHeader: this.fixedHeader,
                showBreadcrumb: this.showBreadcrumb,
                showTags: this.showTags,
                compactMenu: this.compactMenu,
                contentWidth: this.contentWidth,
                animationEffect: this.animationEffect
            }));
        }
    }
}); 