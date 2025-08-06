// src/api/notificationApi.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: '', // vite.config.js가 proxy해줌
    headers: {
        'Content-Type': 'application/json',
    },
});

// JWT 토큰을 요청 헤더에 자동으로 추가하는 인터셉터
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 기존 함수 유지 (하위 호환성)
export const getNotifications = (memberId) => {
    return apiClient.get(`/api/notification/${memberId}`);
};

// 새로운 함수 - 로그인된 사용자의 알림 조회
export const getMyNotifications = () => {
    return apiClient.get('/api/notification/my');
};