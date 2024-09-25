import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
