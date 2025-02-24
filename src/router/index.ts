import { App } from 'vue';
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import pinia from '@/store/store';
import { usePermissonStore } from '@/store/permission'
const PermissonStore = usePermissonStore(pinia)
console.log(PermissonStore, 'PermissonStore')
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import("@/views/Login/Login.vue")
  },
  {
    path: "/layout",
    name: 'layout',
    component: () => import('@/views/Layout/index.vue'),
    children: [
      {
        path: "/system/role",
        component: () => import('@/views/System/sysRole/index.vue'),
        meta: {
          title: '角色管理',
          hidden: false
        },
      }, {
        path: "/system/user",
        component: () => import('@/views/System/sysUser/index.vue'),
        meta: {
          title: "用户管理",
          hidden: false
        }
      }, {
        path: "/system/menu",
        component: () => import('@/views/System/sysMenu/index.vue'),
        meta: {
          title: "菜单管理",
          hidden: false
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
//前置路由导航守卫，用来根据用户刷新路由

export const initRouter = (app: App<Element>) => {
  app.use(router)
}