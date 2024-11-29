import { httpRequst } from "@/service/request"
/**
 * 登录
 */
export const login = (data: LOGIN.loginParams) => {
    return httpRequst<LOGIN.loginResponse>({ method: 'POST', url: "/admin/system/index/Login", data })

}
/**
 * 验证码
 */
export const valiDateCode = () => {
    return httpRequst<LOGIN.valiDateCodeResponse>({ method: 'POST', url: "/admin/system/index/generateValidateCode" })

}
/**
 * 用户列表
 */
export const userList = (data: SYSTEM.userPageParams) => {
    return httpRequst<SYSTEM.pageResponse<SYSTEM.user>>({ method: 'POST', url: `/admin/system/sysUser/list/${data.current}/${data.limit}`, data: { ...data } })
}
/**
 * 修改用户
 */
export const updateSysUser = (data: SYSTEM.user) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysUser/updateSysUser`, data })
}
/**
 * 新增用户
 */
export const saveSysUser = (data: SYSTEM.user) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysUser/saveSysUser`, data })
}
/**
 * 删除用户
 */
export const deleteUserById = (data: SYSTEM.deleteParams) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysUser/deleteById`, data })
}
/**
 * 分配角色
 */
export const doAssign = (data: SYSTEM.doAssignParams) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `/admin/system/sysUser/doAssign`, data })
}
