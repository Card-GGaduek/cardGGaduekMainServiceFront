<!-- src/components/analysis/CategorySpending.vue -->
<template>
  <div class="category-analysis-container">
    <div class="header-text">
      이번 달에 <span class="highlight">{{ topCategory?.categoryName }}</span>에서<br>
      가장 많이 썼어요!
    </div>

    <div class="category-list">
      <div
        v-for="category in sortedCategories"
        :key="category.categoryCode"
        class="category-item"
      >
        <div class="category-info">
          <div class="category-icon">{{ getIcon(category.categoryCode) }}</div>
          <div class="category-details">
            <span class="category-name">{{ category.categoryName }}</span>
            <span class="category-percentage">{{ category.catePercentage.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="amount">{{ formatAmount(category.cateTotalSpent) }}원</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>카테고리별 지출을 불러오는 중...</p>
    </div>
    <div v-else-if="!loading && !categories.length" class="empty-state">
      <p>아직 지출 내역이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategorySummary } from '@/api/analysisindex.js'

const categories = ref([])
const loading    = ref(false)

const ICONS = {
  FOOD: '🍽️', TRANSPORT: '🚗',
  SHOPPING: '🛍️', COMMUNICATION: '📱',
  MEDICAL: '🏥', CULTURE: '🎬'
}

const sortedCategories = computed(() =>
  [...categories.value].sort((a, b) => b.cateTotalSpent - a.cateTotalSpent)
)
const topCategory = computed(() => sortedCategories.value[0] || {})

function getIcon(code) {
  return ICONS[code] || '💰'
}
function formatAmount(v) {
  return v.toLocaleString()
}

async function loadCategories() {
  loading.value = true
  try {
    const res = await getCategorySummary()
    categories.value = res.data.data || []
  } catch (e) {
    console.error('카테고리 요약 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.category-analysis-container {
  max-width: 24rem;          /* 384px */
  margin: 0 auto;
  padding: 0.5rem 0 1.5rem;   /* 8px 0 24px */
}

.header-text {
  font-size: 1.25rem;
  margin-left:1rem;
  line-height: 1.4;
  margin-bottom: 1rem;       /* 2rem → 1rem */
  color: #333;
}

.highlight {
  color: #FFCD39;
  font-weight: 700;
}

.category-list {
  margin: 0 1rem;
  background: #fff;
  border-radius: 1rem;
  padding: 1rem;             /* 1.5rem → 1rem */
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;        /* 1rem → 0.75rem */
  border-bottom: 1px solid #F0F0F0;
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
  font-size: 1.8rem;
  margin-right: 0.75rem;     /* 1rem → 0.75rem */
  width: 2rem;
  text-align: center;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;             /* 0.25rem → 0.125rem */
}

.category-name {
  font-size: 1rem;           /* 1.25rem → 1rem */
  color: #333;
}

.category-percentage {
  font-size: 0.875rem;      /* 1.25rem → 0.875rem */
  color: #818690;
  font-weight:500;
}

.amount {
  font-size: 1rem;           /* 1.25rem → 1rem */
  color: #333;
  text-align: right;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 1.5rem 0;         /* 3rem → 1.5rem */
  color: #666;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.3125rem solid #f3f3f3;
  border-top: 0.3125rem solid #FFCD39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 26rem) {
  .header-text {
    font-size: 1.125rem;
    margin-bottom: 0.75rem;
  }
  .category-item {
    padding: 0.5rem 0;
  }
  .category-icon {
    margin-right: 0.5rem;
  }
  .category-name {
    font-size: 0.9375rem;
  }
  .category-percentage {
    font-size: 0.8125rem;
  }
  .amount {
    font-size: 0.9375rem;
  }
  .loading-state,
  .empty-state {
    padding: 1rem 0;
  }
}
</style>
