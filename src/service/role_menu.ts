import { httpRequst } from "./request"
const BASE_URL = `/admin/system/sysRoleMenu`
/**
 * 查询当前角色菜单
 */
export const findSysRoleMenuByRoleId = (data: SYSTEM.selectParams) => {
    return httpRequst<ROLE_MENU.findSysRoleMenuByRoleId>({ method: 'POST', url: `${BASE_URL}/findSysRoleMenuByRoleId`, data })
}
/**
 * 分配菜单
 */
export const doAssignMenu = (data: ROLE_MENU.assignMenuReq) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/assignMenu`, data })
}
