import axios from 'axios' 
import { Message } from 'element-ui'

/* import router from '@/router/index' */
//定义插件
const httpHelper = {} 
// 配置Vue插件 
httpHelper.install = function (Vue, options) { 
    axios.defaults.baseURL = 'http://localhost:8888/api/private/v1'
    //axios 初始化加载一次
    
     

     axios.interceptors.request.use(function(config){
         if(config.url !== `login`){
            let AUTH_TOKEN = localStorage.getItem('token')
            //在当前请求下加入Authorization
            config.headers['Authorization']=AUTH_TOKEN
           // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
         }
         return config;
     },function(error){
         return Promise.reject(error);
     })


//需求:对所有网络失败的请求（不是200或201）
axios.interceptors.response.use(function(response){
    //对响应数据做点什么
    let {meta:{status,msg}} = response.data
    if(status !== 200 && status !== 201){
        Message.error(msg)
    }
    return response;
},function(error){
    //对响应数据做点什么
    Message.error('服务器正在维护中...')
/*     router.push({
        name:'login'
    }) */
    return Promise.reject(error)
});

    Vue.prototype.$http = axios 
}
 
 export default httpHelper