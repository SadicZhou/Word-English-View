import { httpRequst } from "@/service/request"
const BASE_URL_INDEX = `/admin/system/index`
const BASE_URL_USER = `/admin/system/sysUser`


/**
 * 登录
 */
export const login = (data: LOGIN.loginParams) => {
    return httpRequst<LOGIN.loginResponse>({ method: 'POST', url: `${BASE_URL_INDEX}/Login`, data })

}
/**
 * 验证码
 */
export const valiDateCode = () => {
    return httpRequst<LOGIN.valiDateCodeResponse>({ method: 'POST', url: `${BASE_URL_INDEX}/generateValidateCode` })

}
/**
 * 用户列表
 */
export const userList = (data: SYSTEM.userPageParams) => {
    return httpRequst<SYSTEM.pageResponse<SYSTEM.user>>({ method: 'POST', url: `${BASE_URL_USER}/list/${data.current}/${data.limit}`, data: { ...data } })
}
/**
 * 用户信息
 */
export const userInfo = () => {
    return httpRequst<SYSTEM.user>({ method: 'GET', url: `${BASE_URL_INDEX}/getUserInfo` })
}
/**
 * 修改用户
 */
export const updateSysUser = (data: SYSTEM.user) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `${BASE_URL_USER}/updateSysUser`, data })
}
/**
 * 新增用户
 */
export const saveSysUser = (data: SYSTEM.user) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `${BASE_URL_USER}/saveSysUser`, data })
}
/**
 * 删除用户
 */
export const deleteUserById = (data: SYSTEM.deleteParams) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `${BASE_URL_USER}/deleteById`, data })
}
/**
 * 分配角色
 */
export const doAssign = (data: SYSTEM.doAssignParams) => {
    return httpRequst<RES.response<string>>({ method: 'POST', url: `${BASE_URL_USER}/doAssign`, data })
}
/**
 * 获取动态路由
 */
export const dynamicRoue = () => {
    return httpRequst<SYSTEM.menu[]>({ method: 'GET', url: `/admin/system/index/menus` })
}
