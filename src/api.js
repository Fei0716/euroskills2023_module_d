import axios from 'axios';
import useTokenStore  from '@/stores/token.js'
import useErrorStore from '@/stores/error.js'


const api = axios.create({
  // baseURL: "http://ws01.worldskills.org/euroskills2023_module_c/public/api/",
     baseURL: "http://192.168.10.2/euroskills2023_module_c/public/api/",
});


//setup the interceptors for requests and response
api.interceptors.request.use( (req) => {
  const tokenStore = useTokenStore();
  //add the api token
  req.headers['X-API-TOKEN'] = tokenStore.token;

  return req;
}, (err) => {
  if(err){
    const errorStore = useErrorStore();
    errorStore.error = err.message;
  }
  return Promise.reject(err);
});

api.interceptors.response.use( (res) => {
  return res;
}, (err) => {
  if(err){
    const errorStore = useErrorStore();
    errorStore.error = err.message;

    setTimeout(()=>{
      errorStore.error = null;
    } , 5000);
  }
  return Promise.reject(err);
});
export default api;