import { httpRequst } from "./request"
const BASE_URL = `/admin/product/category`
/**
 * 查询分类列表
 */
export const getCategoryList = (id: string = '0') => {
    return httpRequst<PRODUCT.category[]>({ method: 'get', url: `${BASE_URL}/findByParentId/${id}` })
}

