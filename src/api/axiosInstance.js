import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.success) {
      if (res.data == null) return res.message;
      else return res.data;
    } else {
      return Promise.reject(res); // 실패는 catch로 넘어감
    }
  },
  (error) => {
    const res = error.response?.data;

    // 서버가 우리가 정의한 에러 응답 형식인 경우 (success, code, message 포함)
    if (
      res &&
      typeof res === 'object' &&
      'success' in res &&
      'code' in res &&
      'message' in res
    ) {
      return Promise.reject(res);
    }

    // 그 외 axios 기본 에러 응답
    return Promise.reject(error);
  }
);

export default axiosInstance;
