import { httpRequst } from "@/service/request"
const BASE_URL = `/admin/system/sysDepart`
/**
 * 新增部门
 */
export const save = (data: SYSTEM.department) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/save`, data })
}
/**
 * 查询部门列表
 */
export const findNodes = (parentId: number | string) => {
    return httpRequst<SYSTEM.department[]>({ method: 'GET', url: `${BASE_URL}/findNodes`, params: { parentId } })
}
/**
 * 修改部门
 */
export const updateById = (data: SYSTEM.department) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/updateById`, data })
}