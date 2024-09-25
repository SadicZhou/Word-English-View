declare namespace SYSTEM {
    /**
     * @description 分页参数
     * @param {number} current -当前页
     * @param {number} limit -每页多少数据
     */
    interface pageParams {
        current: number
        limit: number
    }

    /**
     * @description 角色列表分页查询
     * @param {number} current -当前页
     * @param {number} limit -每页多少数据
     * @param {string} roleName -角色名
     */
    interface rolePageParams extends pageParams {
        roleName: string
    }
    /**
     * @description 分页查询返回
     * @param {number} total -总数据量
     * @param {Array} list -列表数据
     * @param {number} pageNum -当前页
     */
    interface pageResponse<T> {
        total: number,
        list: T[],
        pageNum: number
    }
    /**
     * @description 角色信息
     * @param {number} id -角色id
     * @param {string} roleName -角色名称
     * @param {number} roleCode -角色编码
     * @param {string} description -角色描述
     * 
     */
    interface role {
        id: number,
        roleName: string,
        roleCode: string,
        description: string
    }
}
