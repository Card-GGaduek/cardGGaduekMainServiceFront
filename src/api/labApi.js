import api from '@/api';
import { useAuthStore } from '@/stores/auth';
import { setAuthToken } from '@/api';

const BASE_URL = '/api/lab';

export default {
  async getLabOverview() {
    // 요청 전 토큰 재확인
    const authStore = useAuthStore();
    if (authStore.token) {
      setAuthToken(authStore.token);
      console.log('토큰 재설정:', authStore.token);
    } else {
      console.log('토큰이 없습니다!');
    }

    const { data } = await api.get(`${BASE_URL}`);
    return data;
  },

  // 0. 실험실 통합 API
  async getLabOverview() {
    const { data } = await api.get(`${BASE_URL}`);
    return data;
  },

  // 1. 시즌별 미션 목록
  async getMissions() {
    const { data } = await api.get(`${BASE_URL}/missions`);
    console.log('MISSION GET LIST: ', data);
    return data;
  },

  // 2. 오늘의 소비 운세
  async getFortune() {
    const { data } = await api.get(`${BASE_URL}/fortune`);
    console.log('TODAY FORTUNE: ', data);
    return data;
  },

  // 3. 운세 이미지 (이미지 파일명)
  async getFortuneImageUrl(fileName) {
    return `${BASE_URL}/fortune/image/${fileName}`;
  },

  // 4. 소비 성향 분석 데이터
  async getAnalysis() {
    const { data } = await api.get(`${BASE_URL}/analysis`);
    console.log('ANALYSIS RESULT: ', data);
    return data;
  },

  // 5. 소비 성향 분석 이미지 (카테고리별)
  async getAnalysisImageUrl(category) {
    return `${BASE_URL}/analysis/image/${category}`;
  },
};
