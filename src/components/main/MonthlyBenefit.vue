<template>
  <!-- 혜택 확인 섹션 -->
  <div class="total-benefit-section">
    <div class="section-header">
      <h2 class="section-title">혜택 꽉 채운 한 달!</h2>
      <p class="section-subtitle">내 소비로 얼마나 아꼈는지 확인해보세요.</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="benefit-summary-card loading-state">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">혜택 정보를 불러오는 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="benefit-summary-card error-state">
      <div class="error-container">
        <p class="error-text">{{ errorMessage }}</p>
        <div class="error-actions">
          <button class="retry-btn" @click="retryLoad">다시 시도</button>
          <button class="demo-btn" @click="showDemoData">샘플 데이터 보기</button>
        </div>
      </div>
    </div>

    <!-- 정상 데이터 표시 -->
    <div v-else class="benefit-summary-card">
      <div class="summary-header">
        <h3 class="month-title">{{ currentMonth }} 혜택으로 받은 총 혜택</h3>
        <div class="total-amount">{{ formatCurrency(totalBenefitAmount) }}원</div>
      </div>

      <div class="category-benefits-list" v-if="categoryBenefits.length > 0">
        <div
            v-for="(benefit, index) in categoryBenefits"
            :key="index"
            class="category-benefit-item"
        >
          <div class="category-info">
            <span class="category-icon">{{ getCategoryIcon(benefit.category) }}</span>
            <span class="category-name">{{ getCategoryName(benefit.category) }}</span>
          </div>
          <div class="benefit-amount">{{ formatCurrency(benefit.amount) }}원</div>
        </div>
      </div>

      <div v-else class="no-benefits">
        <p>이번 달 혜택 내역이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTotalBenefit } from '@/api/totalbenefit';

const categoryBenefits = ref([]); // 카테고리별 혜택 데이터
const totalBenefitAmount = ref(0); // 총 혜택 금액
const loading = ref(false);
const error = ref(false);
const errorMessage = ref('');
const retryCount = ref(0);
const maxRetries = 2;

// ✅ 현재 월 텍스트 ("8월" 같은 형식)
const currentDate = new Date();
const currentMonth = ref(`${currentDate.getMonth() + 1}월`);

// 총 혜택 데이터 로드 (에러 처리 개선)
const loadTotalBenefit = async (isRetry = false) => {
  if (!isRetry) {
    loading.value = true;
    error.value = false;
    errorMessage.value = '';
    retryCount.value = 0;
  }

  try {
    // memberId 제거 - 백엔드에서 로그인 사용자 정보로 처리
    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    console.log(`혜택 데이터 로드 시도 ${retryCount.value + 1}/${maxRetries + 1}`);

    const response = await getTotalBenefit(yearMonth); // memberId 파라미터 제거
    const data = response.data?.data || response.data || response;

    categoryBenefits.value = data.categoryBenefits || [];
    totalBenefitAmount.value = data.totalBenefitAmount || 0;

    // 성공 시 상태 초기화
    error.value = false;
    retryCount.value = 0;

  } catch (err) {
    console.error('총 혜택 데이터 로드 실패:', err);

    // 자동 재시도 로직 (500 에러의 경우)
    if (err.response?.status >= 500 && retryCount.value < maxRetries) {
      retryCount.value++;
      console.log(`서버 에러로 인한 자동 재시도 ${retryCount.value}/${maxRetries}...`);

      // 3초 후 자동 재시도
      setTimeout(() => {
        loadTotalBenefit(true);
      }, 3000);

      return; // 에러 상태로 변경하지 않고 재시도
    }

    // 최대 재시도 횟수 초과 또는 다른 에러
    error.value = true;
    categoryBenefits.value = [];
    totalBenefitAmount.value = 0;

    // 에러 메시지 설정
    if (err.response?.status === 500) {
      errorMessage.value = `서버에 문제가 발생했습니다. (${maxRetries}회 재시도 실패)`;
    } else if (err.response?.status === 404) {
      errorMessage.value = '혜택 정보를 찾을 수 없습니다.';
    } else if (err.response?.status === 401) {
      errorMessage.value = '로그인이 필요합니다.';
    } else if (err.code === 'ECONNABORTED') {
      errorMessage.value = '서버 응답이 지연되고 있습니다.';
    } else {
      errorMessage.value = '혜택 정보를 불러오는데 실패했습니다.';
    }
  } finally {
    loading.value = false;
  }
};

// 수동 재시도 함수
const retryLoad = () => {
  retryCount.value = 0;
  loadTotalBenefit();
};

// 샘플 데이터 표시 (개발/테스트용)
const showDemoData = () => {
  categoryBenefits.value = [
    {
      category: 'COFFEE_SHOP',
      amount: 15000
    },
    {
      category: 'CONVENIENCE_STORE',
      amount: 8500
    },
    {
      category: 'GAS_STATION',
      amount: 25000
    },
    {
      category: 'RESTAURANT',
      amount: 32000
    }
  ];
  totalBenefitAmount.value = 80500;
  error.value = false;
  loading.value = false;
};

// 카테고리별 아이콘 반환
const getCategoryIcon = (category) => {
  const iconMap = {
    'CONVENIENCE_STORE': '🏪',
    'COFFEE_SHOP': '☕',
    'MOVIE_THEATER': '🎬',
    'GAS_STATION': '⛽',
    'RESTAURANT': '🍽️',
    'HOTEL': '🏨',
    'THEME_PARK': '🎡',
    'SHOPPING': '🛍️',
    'HOSPITAL': '🏥',
    'EDUCATION': '📚',
    'TRANSPORT': '🚌'
  };
  return iconMap[category] || '💳';
};

// 카테고리별 한글명 반환
const getCategoryName = (category) => {
  const nameMap = {
    'CONVENIENCE_STORE': '편의점',
    'COFFEE_SHOP': '카페',
    'MOVIE_THEATER': '문화생활',
    'GAS_STATION': '주유소',
    'RESTAURANT': '음식점',
    'HOTEL': '숙박',
    'THEME_PARK': '테마파크',
    'SHOPPING': '쇼핑',
    'HOSPITAL': '병원',
    'EDUCATION': '교육',
    'TRANSPORT': '교통'
  };
  return nameMap[category] || category;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

onMounted(() => {
  loadTotalBenefit();
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.total-benefit-section {
  padding: 10px 20px 20px;
  background-color: #fff;
  margin-top: 0;
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

.benefit-summary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  color: black;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

/* 로딩 상태 스타일 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffd559;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 에러 상태 스타일 */
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.error-text {
  color: #dc3545;
  font-size: 14px;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 10px;
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

.demo-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.demo-btn:hover {
  background-color: #5a6268;
}

/* 기존 데이터 표시 스타일 */
.summary-header {
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.month-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px 0;
  color: #333;
}

.total-amount {
  font-size: 30px;
  font-weight: bold;
  color: #ffd559;
}

.category-benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-benefit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.benefit-amount {
  font-size: 16px;
  font-weight: bold;
  color: #ffd559;
}

.no-benefits {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-benefits p {
  margin: 0;
  font-size: 16px;
}
</style>