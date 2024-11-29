import { httpRequst } from "@/service/request"
/**
 * 角色列表
 */
export const roleList = (data: SYSTEM.rolePageParams) => {
    return httpRequst<SYSTEM.pageResponse<SYSTEM.role>>({ method: 'POST', url: `/admin/system/sysRole/findByPage/${data.current}/${data.limit}`, data: { roleName: data.roleName } })
}
/**
 * 新增角色
 */
export const saveSysRole = (data: SYSTEM.role) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysRole/saveSysRole`, data })
}
/**
 * 修改角色
 */
export const updateSysRole = (data: SYSTEM.role) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysRole/updateSysRole`, data })
}
/**
 * 删除角色
 */

export const deleteRoleById = (data: SYSTEM.deleteParams) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysRole/deleteById`, data })
}
/**
 * 查询所有角色
 */
export const findAllRoles = (data: SYSTEM.selectParams) => {
    return httpRequst<RES.findAllRolesRes>({ method: 'POST', url: `/admin/system/sysRole/findAllRoles`, data })
}
