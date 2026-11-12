import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

export default request;