declare namespace SYSTEM {
    /**
    * @description 公共查询参数
    * @param {string} id -数据id
    */
    interface selectParams {
        id: string
    }
    /**
     * @description 公共删除参数
     * @param {string} id -数据id
     */
    interface deleteParams {
        id: string
    }
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
        id?: number | string,
        roleName: string,
        roleCode: string,
        description: string
    }
    /**
     * @description 用户列表分页查询
     * @param {number} current -当前页
     * @param {number} limit -每页多少数据
     * @param {string} keyword -关键词(姓名、手机号、用户名)
     * @param {string} createTimeBegin -开始日期
     * @param {string} createTimeEnd -结束日期
     */
    interface userPageParams extends pageParams {
        keyword: string
        createTimeBegin: string
        createTimeEnd: string
    }
    /**
   * @description 用户信息
   * @param {number} id -用户id
   * @param {string} userName -用户名
   * @param {string} name -昵称
   * @param {string} password -密码
   * @param {string} phone -手机号码
   * @param {string} avatar -头像
   * @param {string} description -描述
   * @param {number} status -状态（1：正常 0：停用）
   */
    interface user {
        id?: number | string,
        userName: string,
        name: string,
        password?: string,
        phone: string,
        avatar: string,
        description: string,
        status: number
    }
    /**
     * @description 分配角色入参
     * @param {number} userId -用户id
     * @param {string} roleIdList -角色列表
     * 
     */
    interface doAssignParams {
        userId: number,
        roleIdList: number[]
    }
    /**
     * @description 菜单
     * @param {string} path -菜单地址
     * @param {number | string} id -菜单ID
     * @param {number} parentId -父节点ID
     * @param {string} title -菜单标题
     * @param {string} component -组件名
     * @param {number} sortValue -排序
     * @param {number} status -状态(0:禁止,1:正常)
     * @param {string} type -菜单类型(1:菜单,0:目录)
     * @param {Array}  children -子节点
     */
    interface menu {
        path: string
        id?: number | string,
        parentId?: number,
        title: string,
        component: string,
        name?: string,
        sortValue?: number,
        status?: number,
        icon?: string,
        type?: string,
        children?: menu[]
    }

    /**
     * @description 部门信息
     * @param {number | string} id -部门ID
     * @param {string} name -部门名称
     * @param {number} parentId -上级部门id
     * @param {number} sortValue -排序
     * @param {number} status -状态(0:正常,1:停用)
     * @param {string} remark -描述
     * @param {string} createTime -创建时间
     * @param {Array} children -子部门
     */
    interface department {
        id?: number | string,
        name: string,
        parentId?: number,
        sortValue?: number,
        status?: number,
        remark?: string,
        createTime?: string,
        children?: department[]
    }
}
