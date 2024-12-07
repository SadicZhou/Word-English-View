declare namespace RES {

    /**
    * @description SysRoleUser角色和用户id
    * @param {number} roleId -角色id
    * @param {number} userId -用户id
    */
    interface SysRoleUser {
        roleId: number,
        userId: number
    }
    /**
    * @description 查询所有角色接口返回格式findAllRoles
    * @param {Array} roleList -所有角色列表
    * @param {Array} userRoleList -当前用户角色列表
    */
    interface findAllRolesRes {
        roleList: SYSTEM.role[],
        userRoleList: SysRoleUser[]
    }
    /**
     * @description 接口返回格式
     * @param {string} code -状态码
     * @param {object} data -vo
     * 
     */
    interface response<T> {
        code: number,
        data: T,
        message: string
    }

}