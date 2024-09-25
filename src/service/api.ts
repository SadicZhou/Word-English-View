import { httpRequst } from "@/service/request"
export const login = (data: LOGIN.loginParams) => {
    //return httpRequst<LOGIN.loginResponse>({ method: 'POST', url: "/user/login", data })
    return httpRequst<LOGIN.loginResponse>({ method: 'POST', url: "/admin/system/index/Login", data })

}
export const valiDateCode = () => {
    return httpRequst<LOGIN.valiDateCodeResponse>({ method: 'POST', url: "/admin/system/index/generateValidateCode" })

}
export const roleList = (data: SYSTEM.rolePageParams) => {
    return httpRequst<SYSTEM.pageResponse<SYSTEM.role>>({ method: 'POST', url: `/admin/system/sysRole/findByPage/${data.current}/${data.limit}`, data: { roleName: data.roleName } })
}
