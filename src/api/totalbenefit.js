import api from './index';

// 총 혜택 조회 (로그인 사용자 기준)
export const getTotalBenefit = async (yearMonth) => {
    try {
        const response = await api.get('/api/main/total-benefit', {
            params: { yearMonth }, // memberId 제거
            timeout: 15000
        });
        return response.data;
    } catch (error) {
        console.error('getTotalBenefit 에러:', error);
        throw error;
    }
};