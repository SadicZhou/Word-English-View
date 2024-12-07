import { httpRequst } from "@/service/request"
const BASE_URL = `/admin/system/sysMenu`
/**
 * 菜单列表
 */
export const menuList = () => {
    return httpRequst<SYSTEM.menu[]>({ method: 'POST', url: `${BASE_URL}/findNodes` })
}
/**
 * 新增菜单
 */
export const save = (data: SYSTEM.menu) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/save`, data })
}
/**
 * 修改菜单
 */
export const update = (data: SYSTEM.menu) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/update`, data })
}
/**
 * 删除菜单
 */
export const deleteById = (data: SYSTEM.deleteParams) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/deleteById`, data })
}
