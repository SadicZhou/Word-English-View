declare namespace REQ {
    /**
     * @description http 请求配置参数
     * @param {string} url -api地址
     * @param {string} [method] -请求方法-可选
     * @param {object} [header] -请求头配置-可选
     * @param {object} [data] -data传参-可选
     * @param {object} [params] -params传参-可选
     * 
     */
    interface httpRequstConfig {
        url: string,
        method?: string,
        header?: object,
        data?: object,
        params?: object
    }
}

