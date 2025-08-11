import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
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

// 카드 실적 조회 API
export const getCardPerformance = () =>
  apiClient.get(`/api/members/cardPerformance`);

// 거래 내역 조회 API

export const getCardTransactions = () =>
  apiClient.get(`/api/members/cards/transactions`);

//월간 실적
export const getMonthlySpending = () => apiClient.get(`/api/members/summary`);

//카테고리별 불러오기
export const getCategorySummary = () =>
  apiClient.get(`/api/members/cardCateSummary`);

//카드추천
export const getRecommendations = () =>
  apiClient.get(`/api/recommendations`);

