declare namespace RES {
    /**
     * @description 接口返回格式
     * @param {string} code -状态码
     * @param {object} data -vo
     */
    interface response<T> {
        code: number,
        data: T,
        message: string
    }
}