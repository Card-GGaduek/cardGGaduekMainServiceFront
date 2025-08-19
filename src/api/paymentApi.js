// src/api/paymentApi.js
import api from './index';

const paymentApi = {
    // QR 코드 생성 API
    generateQRCode: async (memberId, cardId) => {
        try {
            const requestData = {
                memberId,
                cardId
            };

            console.log('QR 코드 생성 요청:', requestData);

            const response = await api.post('/api/payment/qr', requestData);

            console.log('QR 코드 생성 응답:', response.data);

            return response.data;
        } catch (error) {
            console.error('QR 코드 생성 API 오류:', error);
            throw error;
        }
    },

    // 결제 상태 확인 API (필요시 사용)
    checkPaymentStatus: async (transactionId) => {
        try {
            const response = await api.get(`/api/payment/status/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('결제 상태 확인 API 오류:', error);
            throw error;
        }
    },

    // 결제 취소 API (필요시 사용)
    cancelPayment: async (transactionId) => {
        try {
            const response = await api.post(`/api/payment/cancel`, { transactionId });
            return response.data;
        } catch (error) {
            console.error('결제 취소 API 오류:', error);
            throw error;
        }
    }
};

export default paymentApi;