<template>
  <div>
    <MainHeader />
    <TabNav :activeTab="activeTab" @change="handleTabChange" />

    <!-- 카드 실적 탭 -->
    <div v-if="activeTab === 'cardPerformance'">
      <!-- 로딩 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>카드 정보를 불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadCards" class="retry-button">다시 시도</button>
      </div>

      <!-- 데이터 없음 -->
      <div v-else-if="cards.length === 0" class="empty-container">
        <p>등록된 카드가 없습니다.</p>
      </div>

      <!-- 정상 데이터 -->
      <CardSlider 
        v-else
        :cards="cards"
        @card-changed="handleCardChanged"
      />
    </div>

    <!-- 일별 실적 -->
    <div v-else-if="activeTab === 'MonthlySpending'" class="tab-content">
      <p>일별 실적 내용이 여기에 표시됩니다.</p>
    </div>

    <!-- 카드 추천 -->
    <div v-else-if="activeTab === 'cardRecommend'" class="tab-content">
      <p>카드 추천 내용이 여기에 표시됩니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainHeader from '@/layout/MainHeader.vue';
import TabNav from '@/components/analysis/TabNav.vue';
import CardSlider from '@/components/analysis/CardSlider.vue';
import { getCardPerformance } from '@/api/index.js';
import SubHeader from '@/layout/SubHeader.vue';

const activeTab = ref('cardPerformance');
const cards = ref([]);
const currentCard = ref(null);
const loading = ref(false);
const error = ref(null);

// 임시 기본 카드 이미지 (백엔드 연동 전)
const defaultCardImage = 'https://d1c5n4ri2guedi.cloudfront.net/card/13/card_img/28201/13card.png';

const loadCards = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data } = await getCardPerformance(1);

    if (data.success && data.data) {
      cards.value = data.data.map(cardData => ({
        id: cardData.cardId,
        name: cardData.cardProductName,
        bank: cardData.bankName || '신한은행',
        owner: cardData.ownerName || '이유진',
        currentAmount: cardData.spentAmount,
        totalAmount: cardData.requiredMonthlySpending,
        yearMonth: cardData.yearMonth,
        logo: cardData.cardImageUrl || defaultCardImage, // 백엔드 연동 시 교체
        character: cardData.cardImageUrl || defaultCardImage // 캐릭터 이미지 없으면 동일
      }));

      if (cards.value.length > 0) currentCard.value = cards.value[0];
    } else {
      throw new Error(data.message || '카드 정보를 불러오는데 실패했습니다');
    }
  } catch (err) {
    console.error(err);
    error.value = err.message || '카드 정보를 불러오는데 실패했습니다';
    cards.value = [];
    currentCard.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(loadCards);

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const handleCardChanged = (card) => {
  currentCard.value = card;
};
</script>

<style scoped>
.tab-content {
  padding: 20px;
  text-align: center;
  color: #666;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.main-text{
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FFCD39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background: #FFCD39;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.error-container p {
  color: #e74c3c;
}
</style>
