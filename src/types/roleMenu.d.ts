declare namespace ROLE_MENU {
  /**
* @description 当前用户角色菜单列表
* @param {number} menusIds -当前用户角色菜单列表
* @param { SYSTEM.menu[]} menus -所有菜单
*/
  interface findSysRoleMenuByRoleId {
    menusIds: number[],
    menus: SYSTEM.menu[]
  }
  /**
* @description 分配菜单入参
* @param {number} roleId -角色ID
* @param {{id:string,isHalf:number}[]} menuIdList -菜单
*/
  interface assignMenuReq {
    roleId: number,
    menuIdList: { id: string, isHalf: number }[]

  }

}