import api from '@/api';

const BASE_URL = '/api/main/card';

export default {
    // 혜택 좋은 카드 상위 5개 조회
    async getTopBenefitCards() {
        const { data } = await api.get(`${BASE_URL}/topbenefit`);
        return data;
    },

    // 카드 상품 상세 조회
    async getCardProductDetail(productId) {
        const { data } = await api.get(`${BASE_URL}/detail/${productId}`);
        return data;
    },

    // 모든 카드 상품 조회
    async getAllCardProducts() {
        const { data } = await api.get(`${BASE_URL}/all`);
        return data;
    },
};

// Named exports (기존 코드와 호환성을 위해)
export const getTopBenefitCards = async () => {
    const { data } = await api.get(`${BASE_URL}/topbenefit`);
    return data;
};

export const getCardProductDetail = async (productId) => {
    const { data } = await api.get(`${BASE_URL}/detail/${productId}`);
    return data;
};

export const getAllCardProducts = async () => {
    const { data } = await api.get(`${BASE_URL}/all`);
    return data;
};