declare namespace PRODUCT {
    interface category {
        id: number
        createTime: string
        updateTime: string
        isDeleted: number
        name: string
        imgUrl: string
        parentId: number
        status: number
        orderNum: number
        children: category[]
    }
}
