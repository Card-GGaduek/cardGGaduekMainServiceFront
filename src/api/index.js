// src/api/index.js
import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: '/', // API 기본 경로, 필요시 수정
  timeout: 5000, // 타임아웃 설정
});

// 요청 인터셉터 (없음) — 토큰 삽입 안 함

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