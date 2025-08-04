<template>
  <!-- 혜택 확인 섹션 -->
  <div class="total-benefit-section">
    <div class="section-header">
      <h2 class="section-title">혜택 꽉 채운 한 달!</h2>
      <p class="section-subtitle">내 소비로 얼마나 아꼈는지 확인해보세요.</p>
    </div>

    <div class="benefit-summary-card">
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

// ✅ 현재 월 텍스트 ("8월" 같은 형식)
const currentDate = new Date();
const currentMonth = ref(`${currentDate.getMonth() + 1}월`);

// 총 혜택 데이터 로드
const loadTotalBenefit = async () => {
  try {
    const memberId = 1;
    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const response = await getTotalBenefit(memberId, yearMonth);
    const data = response.data?.data || response.data || response;

    categoryBenefits.value = data.categoryBenefits || [];
    totalBenefitAmount.value = data.totalBenefitAmount || 0;
  } catch (err) {
    console.error('총 혜택 데이터 로드 실패:', err);
    categoryBenefits.value = [];
    totalBenefitAmount.value = 0;
  }
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
/* 총 혜택 섹션 스타일 */
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
}

.summary-header {
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
}

.month-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px 0;
  opacity: 0.9;
}

.total-amount {
  font-size: 30px;
  font-weight: bold;
  color: #ffd559;
}

.category-benefits-list {
  display: flex;
  flex-direction: column;
}

.category-benefit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.category-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
}

.benefit-amount {
  font-size: 16px;
  font-weight: bold;
  color: #ffd559;
}

.no-benefits {
  text-align: center;
  opacity: 0.7;
}

.no-benefits p {
  margin: 0;
  font-size: 16px;
}
</style>