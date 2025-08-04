// 기존 API 파일과 동일한 import 방식 사용
import api from './index'; // 또는 기존 파일에서 사용하는 방식

// 총 혜택 조회 API  
export const getTotalBenefit = (memberId, yearMonth) => {
    return api.get('/api/main/total-benefit', {
        params: {
            memberId,
            yearMonth
        }
    });
};