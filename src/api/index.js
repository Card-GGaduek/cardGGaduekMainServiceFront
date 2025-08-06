// src/api/index.js
import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: '/', // API 기본 경로, 필요시 수정
  timeout: 10000, // 타임아웃 설정
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

// 요청 인터셉터 (없음) — 토큰 삽입 안 함
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (선택적 에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 예: 서버 오류 메시지 확인
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
