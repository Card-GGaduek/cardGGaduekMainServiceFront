<template>
  <div class="category-analysis-container">
    <!-- 헤더 텍스트 -->
    <div class="header-text">
      이번 달에 <span class="highlight">{{ topCategoryInfo?.categoryName || '' }}</span>에서<br>
      가장 많이 썼어요!
    </div>

    <!-- 카테고리별 지출 리스트 -->
    <div class="category-list">
      <div 
        v-for="category in sortedCategories" 
        :key="category.categoryCode"
        class="category-item"
      >
        <div class="category-info">
          <div class="category-icon">{{ getCategoryIcon(category.categoryCode) }}</div>
          <div class="category-details">
            <span class="category-name">{{ category.categoryName }}</span>
            <span class="category-percentage">{{ category.catePercentage.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="amount">{{ formatAmount(category.cateTotalSpent) }}원</div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>카테고리별 지출 내역을 불러오는 중...</p>
    </div>

    <!-- 데이터가 없을 때 -->
    <div v-if="!loading && categories.length === 0" class="empty-state">
      <p>아직 지출 내역이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCategorySummary } from '@/api/analysisindex.js';

const memberId = 1;
const categories = ref([]);
const loading = ref(false);

// 전체 카테고리 정의 (아이콘과 함께)
const availableCategories = [
  { code: 'FOOD', name: '식비', icon: '🍽️' },
  { code: 'TRANSPORT', name: '교통비', icon: '🚗' },
  { code: 'SHOPPING', name: '쇼핑', icon: '🛍️' },
  { code: 'COMMUNICATION', name: '통신비', icon: '📱' },
  { code: 'MEDICAL', name: '의료비', icon: '🏥' },
  { code: 'CULTURE', name: '문화생활', icon: '🎬' }
];

// 가장 많이 지출한 카테고리
const topCategory = computed(() => {
  if (categories.value.length === 0) return '';
  return categories.value.reduce((max, current) => 
    current.cateTotalSpent > max.cateTotalSpent ? current : max
  ).categoryCode;
});

// 가장 많이 지출한 카테고리 정보
const topCategoryInfo = computed(() => {
  if (categories.value.length === 0) return null;
  return categories.value.reduce((max, current) => 
    current.cateTotalSpent > max.cateTotalSpent ? current : max
  );
});

// 지출액 기준 내림차순 정렬
const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => b.cateTotalSpent - a.cateTotalSpent);
});

// 카테고리별 아이콘 매핑
function getCategoryIcon(categoryCode) {
  const category = availableCategories.find(cat => cat.code === categoryCode);
  return category ? category.icon : '💰';
}

// 금액 포맷팅
function formatAmount(amount) {
  return amount.toLocaleString();
}

// API 호출
async function loadCategorySummary() {
  try {
    loading.value = true;
    const response = await getCategorySummary(memberId);
    
    if (response.data.success) {
      categories.value = response.data.data;
      console.log('카테고리 데이터 로드 성공:', categories.value);
    } else {
      console.error('카테고리 데이터 로드 실패:', response.data.message);
    }
  } catch (error) {
    console.error('카테고리 API 호출 오류:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadCategorySummary);
</script>

<style scoped>
.category-analysis-container {
  background: transparent;
  padding: 1.25rem 1rem;
  max-width: 22.5rem;
  margin: 1rem auto;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.header-text {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.highlight {
  color: #FFCD39;
  font-weight: 700;
}

.category-list {
  background: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 0.0625rem solid #F0F0F0;
}

.category-item:last-child {
  border-bottom: none;
}

.category-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.category-icon {
  font-size: 1.125rem;
  margin-right: 0.75rem;
  width: 1.5rem;
  text-align: center;
  flex-shrink: 0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.category-percentage {
  font-size: 0.75rem;
  color: #FFCD39;
  font-weight: 600;
}

.amount {
  font-size: 0.875rem;
  font-weight: 700;
  color: #333;
  text-align: right;
  flex-shrink: 0;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #666;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 0.1875rem solid #f3f3f3;
  border-top: 0.1875rem solid #FFCD39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 디자인 */
@media (max-width: 23.4375rem) {
  .category-analysis-container {
    margin: 1rem;
    padding: 1.125rem 0.875rem;
  }
  
  .header-text {
    font-size: 1rem;
  }
  
  .category-item {
    padding: 0.625rem 0;
  }
  
  .category-icon {
    font-size: 1rem;
    margin-right: 0.625rem;
    width: 1.25rem;
  }
  
  .category-name {
    font-size: 0.8125rem;
  }
  
  .amount {
    font-size: 0.8125rem;
  }
}
</style>