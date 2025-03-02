import axios from "axios";
import pinia from "@/store/store";
import { useUserStore } from "@/store/user";
import { tokenWhiteList } from "@/config/whiteList";
import { useRouter } from "vue-router";
const instance = axios.create({
    timeout: 10 * 1000,
})
const rouer = useRouter()
const UserStore = useUserStore(pinia)
/**请求拦截器 */
instance.interceptors.request.use(config => {
    //console.log(config)
    //如果请求的url不在白名单内需要添加token
    if (!tokenWhiteList.includes(config.url as string)) {
        config.headers['token'] = UserStore.token
    }
    return config
}, error => {
    return Promise.reject(error)
})
instance.interceptors.response.use(response => {
    const { data } = response
    console.info('请求成功========>', data, response)
    if (data.data) {
        const { data: { token }, code } = data
        if (code == '208') {
            rouer.push('/login')
            return
        }
        //刷新token
        if (token) {
            UserStore.refeshToken(token)
        }
    }
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

