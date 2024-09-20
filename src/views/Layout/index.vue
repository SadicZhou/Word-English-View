<template>
  <div class="layout">
    <div>
      <div class="menus">
      <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        text-color="#fff"
        default-active="2"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="1-1">
            
            <template #title>
            <el-icon>
              <svg t="1726842881263" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5059" width="200" height="200"><path d="M1022.244739 804.543567h-43.881535a300.100943 300.100943 0 0 0-297.906867-255.975621c-3.413008 0-6.826017 0.828873-10.726597 0.975145a442.082087 442.082087 0 0 0 6.826017-43.881535c1.462718 0 2.437863 0.390058 3.90058 0.390058a170.650414 170.650414 0 1 0 0-341.300828 174.063423 174.063423 0 0 0-60.459003 11.311684c-5.850871-13.066946-12.676888-25.890106-19.502905-38.420722a217.213599 217.213599 0 0 1 79.961908-15.699838 214.87325 214.87325 0 0 1 215.994668 213.313018 212.094086 212.094086 0 0 1-112.629274 186.203981 342.471003 342.471003 0 0 1 238.423008 283.084658zM504.442625 578.553662a390.545662 390.545662 0 0 1 269.627654 323.504428h-49.732406a339.691839 339.691839 0 0 0-672.850205 0H1.755261a390.545662 390.545662 0 0 1 269.627655-323.504428 243.786306 243.786306 0 1 1 233.059709 0zM387.91277 170.699172a195.029045 195.029045 0 1 0 195.029045 195.029044 195.029045 195.029045 0 0 0-195.029045-195.029044z" fill="#ffffff" p-id="5060"></path></svg>
            </el-icon>
            <span>用户管理</span>
          </template>
            </el-menu-item>
        </el-sub-menu>
      </el-menu>
      <img @click="isCollapse=!isCollapse"  class="control" :src="isCollapse?open:close" alt="">
    </div>
    </div>
    <div class="content">
    <div class="content_top"></div>
    <router-view></router-view>
  </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  Setting,
  Menu as IconMenu,
  Location,
} from "@element-plus/icons-vue";
const open = require('@/assets/open_menu.png')
const close = require('@/assets/close_menu.png')
const isCollapse = ref(true);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>

<style scoped lang="scss">
$mw: 200px;
.el-menu-vertical-demo {
  height: 100% !important;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: $mw;
}
.el-menu{
  border-right: 0px !important
}
.layout{
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .content {
  flex: 1;
  // background-color: rebeccapurple;
}
.menus{
  height: 100%;
  position: relative;
  .control {
      width:20px;
      height:20px;
      position: absolute;
      right: -20px;
      top:0px;
      cursor: pointer;
      
  }
}
}

</style>
