import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
});

// 카드 실적 조회 API
export const getCardPerformance = (memberId) =>
    apiClient.get(`/api/members/${memberId}/cardPerformance`);

// 거래 내역 조회 API

export const getCardTransactions = (memberId) =>
    apiClient.get(`/api/${memberId}/card/trans`);

//월간 실적
export const getMonthlySummary = (memberId) =>
    apiClient.get(`/api/members/${memberId}/summary`);
