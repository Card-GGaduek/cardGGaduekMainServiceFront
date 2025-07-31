import api from '@/api';

const BASE_URL = '/api/lab';

export default {
  // 0. 실험실 통합 API
  async getLabOverview(memberId) {
    const { data } = await api.get(`${BASE_URL}`, {
      params: { memberId },
    });
    return data;
  },

  // 1. 시즌별 미션 목록
  async getMissions(memberId) {
    const { data } = await api.get(`${BASE_URL}/missions`, {
      params: { memberId },
    });
    console.log('MISSION GET LIST: ', data);
    return data;
  },

  // 2. 오늘의 소비 운세
  async getFortune(memberId) {
    const { data } = await api.get(`${BASE_URL}/fortune`, {
      params: { memberId },
    });
    console.log('TODAY FORTUNE: ', data);
    return data;
  },

  // 3. 운세 이미지 (이미지 파일명)
  async getFortuneImageUrl(fileName) {
    return `${BASE_URL}/fortune/image/${fileName}`;
  },

  // 4. 소비 성향 분석 데이터
  async getAnalysis(memberId) {
    const { data } = await api.get(`${BASE_URL}/analysis`, {
      params: { memberId },
    });
    console.log('ANALYSIS RESULT: ', data);
    return data;
  },

  // 5. 소비 성향 분석 이미지 (카테고리별)
  async getAnalysisImageUrl(category) {
    return `${BASE_URL}/analysis/image/${category}`;
  },
};
