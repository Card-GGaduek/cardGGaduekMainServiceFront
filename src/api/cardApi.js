import api from '@/api';

const BASE_URL = '/api/card';

export default {
  // 1. 카드 정보 가져오기
  async getCardFrontInfo(memberId) {
    const { data } = await api.get(`/api/card/front/${memberId}`);
    return data;
  },

  // 2. 카드 뒷면 정보 조회
  async getCardDetail(cardId) {
    const { data } = await api.get(`/api/card/back/${cardId}`);
    return data;
  },

  // 3. 카드 이미지 변경 API
  async updateCardImage(cardId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const { data } = await api.post(`${BASE_URL}/${cardId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(`UPDATE CARD IMAGE (${cardId}):`, data);
    return data;
  },

  // 4. 카드 삭제 API
  async deleteCard(cardId) {
    const { status } = await api.delete(`${BASE_URL}/${cardId}`);
    console.log(`DELETE CARD (${cardId}) - STATUS:`, status);
    return status === 204;
  },
};
