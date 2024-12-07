import { httpRequst } from "@/service/request"
const BASE_URL = `/admin/system/sysRole`
/**
 * 角色列表
 */
export const roleList = (data: SYSTEM.rolePageParams) => {
    return httpRequst<SYSTEM.pageResponse<SYSTEM.role>>({ method: 'POST', url: `${BASE_URL}/findByPage/${data.current}/${data.limit}`, data: { roleName: data.roleName } })
}
/**
 * 新增角色
 */
export const saveSysRole = (data: SYSTEM.role) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/saveSysRole`, data })
}
/**
 * 修改角色
 */
export const updateSysRole = (data: SYSTEM.role) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/updateSysRole`, data })
}
/**
 * 删除角色
 */

export const deleteRoleById = (data: SYSTEM.deleteParams) => {
    return httpRequst<string>({ method: 'POST', url: `${BASE_URL}/deleteById`, data })
}
/**
 * 查询所有角色
 */
export const findAllRoles = (data: SYSTEM.selectParams) => {
    return httpRequst<RES.findAllRolesRes>({ method: 'POST', url: `${BASE_URL}/findAllRoles`, data })
}
