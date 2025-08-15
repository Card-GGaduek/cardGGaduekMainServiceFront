<template>
  <!-- 혜택 좋은 카드 추천 섹션 -->
  <div class="recommended-cards-section">
    <div class="section-header">
      <h2 class="section-title">지금 쓰는 카드 vs 추천 카드</h2>
      <p class="section-subtitle">
        혜택 비교하고, 더 유리한 카드로 바꿔보세요.
      </p>
    </div>
  </div>
  <div class="recommended-cards-list">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">
        카드 정보를 불러오는 중...
        <span v-if="retryCount > 0"
        >(재시도 {{ retryCount }}/{{ maxRetries }})</span
        >
      </p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ errorMessage }}</p>
      <button class="retry-btn" @click="retryLoad">다시 시도</button>
    </div>

    <!-- 카드 목록 (최대 3개만 표시) -->
    <div v-else-if="topBenefitCards.length > 0" class="recommended-cards-list">
      <div
          v-for="(card, index) in displayedCards"
          :key="card.id"
          class="recommended-card-item"
          @click="goToCardDetail(card.id)"
      >
        <div class="rank-number">{{ index + 1 }}</div>
        <div class="card-image-container">
          <img
              :src="card.cardImageUrl"
              :alt="card.cardProductName"
              class="recommended-card-image"
          />
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

      <!-- 전체 보기 버튼 -->
      <div class="view-more-container">
        <router-link to="/AllCardProduct" class="view-all-btn">
          전체 보기 &gt;
        </router-link>
      </div>
    </div>

    <!-- 데이터가 없는 경우 -->
    <div v-else class="no-data-container">
      <p class="no-data-text">추천할 카드가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getTopBenefitCards } from '@/api/cardproduct';
import { useRouter } from 'vue-router';

const topBenefitCards = ref([]);
const loading = ref(false);
const error = ref(false);
const errorMessage = ref('');
const retryCount = ref(0);
const maxRetries = 3;
const router = useRouter();

// 항상 최대 3개만 표시
const displayedCards = computed(() => {
  return topBenefitCards.value.slice(0, 3);
});

// 혜택 좋은 카드 데이터 로드 (재시도 로직 포함)
const loadTopBenefitCards = async (isRetry = false) => {
  // 재시도가 아닌 경우에만 초기화
  if (!isRetry) {
    loading.value = true;
    error.value = false;
    errorMessage.value = '';
    retryCount.value = 0;
  }

  try {
    // 타임아웃을 점진적으로 증가
    const timeoutMs = Math.min(15000 + retryCount.value * 10000, 60000); // 15초 ~ 60초
    console.log(
        `API 호출 시도 ${retryCount.value + 1}/${
            maxRetries + 1
        }, 타임아웃: ${timeoutMs}ms`
    );

    const response = await getTopBenefitCards();
    topBenefitCards.value = response.data || response;

    // 성공 시 상태 초기화
    error.value = false;
    retryCount.value = 0;
  } catch (err) {
    console.error('혜택 카드 로드 실패:', err);

    // 자동 재시도 로직
    if (err.code === 'ECONNABORTED' && retryCount.value < maxRetries) {
      retryCount.value++;
      console.log(`자동 재시도 ${retryCount.value}/${maxRetries}...`);

      // 2초 후 자동 재시도
      setTimeout(() => {
        loadTopBenefitCards(true);
      }, 2000);

      return; // 에러 상태로 변경하지 않고 재시도
    }

    // 최대 재시도 횟수 초과 또는 다른 에러
    error.value = true;

    if (err.code === 'ECONNABORTED') {
      errorMessage.value = `서버 응답이 너무 느립니다. (${maxRetries}회 재시도 실패)`;
    } else if (err.response?.status === 404) {
      errorMessage.value = '요청한 정보를 찾을 수 없습니다.';
    } else if (err.response?.status >= 500) {
      errorMessage.value = '서버에 문제가 발생했습니다.';
    } else {
      errorMessage.value = '네트워크 오류가 발생했습니다.';
    }
  } finally {
    loading.value = false;
  }
};

// 수동 재시도 함수
const retryLoad = () => {
  retryCount.value = 0; // 수동 재시도 시 카운트 초기화
  loadTopBenefitCards();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

const goToCardDetail = (cardId) => {
  router.push({
    name: 'CardDetail',
    params: { id: cardId },
  });
};

onMounted(() => {
  loadTopBenefitCards();
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.recommended-cards-section {
  padding: 20px 20px 20px;
  background-color: #f8f9fa;
  margin-top: 20px;
}

.section-header {
  text-align: left;
}

.section-title {
  display: flex;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 로딩 상태 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffd559;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 에러 상태 스타일 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.error-text {
  color: #dc3545;
  font-size: 14px;
  margin: 0 0 16px 0;
  text-align: center;
}

.retry-btn {
  background-color: #ffd559;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #f4c025;
}

/* 데이터 없음 상태 스타일 */
.no-data-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.no-data-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 기존 카드 리스트 스타일들 */
.recommended-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;   /* 원하는 폭으로 조절: 320~420px 추천 */
  margin: 0 auto;     /* 중앙 정렬 */
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

.view-all-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.view-all-link:hover {
  color: #0056b3;
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
  margin-bottom: 30px;
}

.view-all-btn {
  display: inline-block;
  color: #787878;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background-color: rgba(0, 123, 255, 0.1);
  color: #0056b3;
}
</style>