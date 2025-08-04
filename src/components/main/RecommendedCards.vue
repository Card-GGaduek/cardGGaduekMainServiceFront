<template>
  <!-- 혜택 좋은 카드 추천 섹션 -->
  <div class="recommended-cards-section">
    <div class="section-header">
      <h2 class="section-title">지금 쓰는 카드 vs 추천 카드</h2>
      <p class="section-subtitle">혜택 비교하고, 더 유리한 카드로 바꿔보세요.</p>
    </div>

    <div class="recommended-cards-list">
      <div
          v-for="(card, index) in displayedCards"
          :key="card.id"
          class="recommended-card-item"
          @click="goToCardDetail(card.id)"
      >
        <div class="rank-number">{{ index + 1 }}</div>
        <div class="card-image-container">
          <img :src="card.cardImageUrl" :alt="card.cardProductName" class="recommended-card-image" />
        </div>
        <div class="card-details">
          <h3 class="card-name">{{ card.cardProductName }}</h3>
          <p class="benefit-count">혜택 {{ card.benefitCount }}개</p>
          <p class="annual-fee" v-if="card.annualFee">
            연회비 {{ formatCurrency(card.annualFee) }}원
          </p>
          <p class="annual-fee" v-else>연회비 무료</p>
        </div>
      </div>
    </div>

    <div class="view-more-container">
      <button
          v-if="!showAll && topBenefitCards.length > 3"
          class="view-more-btn"
          @click="toggleShowAll"
      >
        혜택 카드 더보기 >
      </button>
      <button
          v-if="showAll"
          class="view-more-btn"
          @click="toggleShowAll"
      >
        접기 <
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getTopBenefitCards } from '@/api/cardproduct';
import { useRouter } from 'vue-router';

const topBenefitCards = ref([]);
const showAll = ref(false);
const router = useRouter();

// 표시할 카드들 계산 (최대 10개까지만)
const displayedCards = computed(() => {
  const maxCards = Math.min(topBenefitCards.value.length, 10);
  if (showAll.value) {
    return topBenefitCards.value.slice(0, maxCards);
  }
  return topBenefitCards.value.slice(0, 3);
});

// 더보기/접기 토글
const toggleShowAll = () => {
  showAll.value = !showAll.value;
};

// 혜택 좋은 카드 데이터 로드
const loadTopBenefitCards = async () => {
  try {
    const response = await getTopBenefitCards();
    topBenefitCards.value = response.data || response;
  } catch (err) {
    console.error('혜택 카드 로드 실패:', err);
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

const goToCardDetail = (cardId) => {
  router.push({
    name: 'CardDetail',
    params: { id: cardId }
  });
};

const goToCardRecommendation = () => {
  router.push({ name: 'CardRecommendation' });
};

onMounted(() => {
  loadTopBenefitCards();
});
</script>

<style scoped>
/* 추천 카드 섹션 스타일 */
.recommended-cards-section {
  padding: 20px 20px 20px;
  background-color: #f8f9fa;
  margin-top: 20px;
}

.section-header {
  text-align: left;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.recommended-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: max-height 0.3s ease-out;
}

.recommended-card-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommended-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.rank-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ffd559;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-image-container {
  width: 60px;
  height: 38px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.recommended-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-details {
  flex: 1;
  text-align: left;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.benefit-count {
  font-size: 12px;
  color: #007bff;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.annual-fee {
  font-size: 11px;
  color: #666;
  margin: 0;
}

.view-more-container {
  text-align: center;
  margin-top: 20px;
}

.view-more-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 0px 0px;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}

.view-more-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>