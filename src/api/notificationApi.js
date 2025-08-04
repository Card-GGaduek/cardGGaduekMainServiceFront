import axios from 'axios';

const apiClient = axios.create({
    baseURL: '', // ← 중요! vite.config.js가 proxy해줌
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getNotifications = (memberId) => {
    return apiClient.get(`/api/notification/${memberId}`);
};
