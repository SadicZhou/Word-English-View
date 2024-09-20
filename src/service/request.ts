import axios from "axios";
const instance = axios.create({
    timeout: 10 * 1000,
})
/**请求拦截器 */
instance.interceptors.request.use(config => {
    // console.log(config)
    return config
}, error => {
    return Promise.reject(error)
})
instance.interceptors.response.use(response => {
    const { data } = response
    console.info('请求成功========>', data, response)
    return data
}, error => {
    console.error('响应错误:', error);
    if (error.response) {
        // 请求已发出，服务器响应了状态码 2xx 之外的其他状态
        return Promise.reject(error.response.data);
    } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('请求发出但没有收到响应:', error.request);
    } else {
        // 发生了触发请求错误的问题
        console.error('触发请求错误:', error.message);
    }
    return Promise.reject(error);
}
)
export function httpRequst<T>(Config: REQ.httpRequstConfig) {
    return instance.request<any, RES.response<T>, any>(Config)
}

