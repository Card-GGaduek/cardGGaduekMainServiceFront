<template>
  <div class="p-4">
    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else class="content p-6">
      <!-- 절약 금액 -->
      <div class="saving mb-6 text-center">
        <p class="text-lg">
          총 <span class="amount">{{ formatCurrency(data.additionalSaving) }}원</span>을 절약할 수 있어요!
        </p>
      </div>

      <!-- 추천 조합 카드 -->
      <div class="combo-box mb-8">
        <h2 class="combo-title mb-4">추천 조합 카드</h2>
        <div class="cards-row">
          <div
            v-for="card in recommendedCards"
            :key="card.cardProductId"
            class="card-item"
          >
            <img :src="card.cardProductImageUrl" alt="추천 카드" />
            <span class="card-name">{{ card.cardProductName }}</span>
            <button class="btn" @click="viewDetail(card)">할인보기</button>
          </div>
        </div>
      </div>
      <p>추천 조합 혜택 합계: {{ formatCurrency(data.recommendation?.aggregateBenefit || 0) }}원</p>


      <p>현재 조합 혜택 합계: {{ formatCurrency(data.current?.aggregateBenefit || 0) }}원</p>

      <!-- VS -->
      <div class="vs-wrap mb-8">
        <span class="vs-text">VS</span>
      </div>

      <!-- 현재 카드 -->
      <div class="combo-box">
        <h2 class="combo-title mb-4">현재 {{ userName }}님의 카드</h2>
        <div class="cards-row">
          <div
            v-for="card in currentCards"
            :key="card.cardProductId"
            class="card-item"
          >
            <img :src="card.cardProductImageUrl" alt="현재 보유 카드" />
            <span class="card-name">{{ card.cardProductName }}</span>
            <button class="btn" @click="viewDetail(card)">할인보기</button>
          </div>
        </div>
      </div>
    </div>

    

    <!-- 할인 상세 모달 -->
    <div v-if="showDetail" class="detail-modal" @click.self="showDetail = false">
      <div class="detail-content">
        <h3>할인 상세</h3>
        <ul>
          <li v-for="item in detailItems" :key="item.store">
            {{ item.store }}: {{ formatCurrency(item.amt) }}원
          </li>
        </ul>
        <button class="close-btn" @click="showDetail = false">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRecommendations } from '@/api/analysisindex.js'

const userName = ref('')
const data = ref({
  current: { cards: [] },
  recommendation: { cards: [] },
  additionalSaving: 0
})
const loading = ref(true)

// 할인 상세 모달 state
const showDetail = ref(false)
const detailItems = ref([])

function viewDetail(card) {
  const m = card.benefitByStore.map
  detailItems.value = Object.entries(m)
    .filter(([_, amt]) => amt > 0)
    .map(([store, amt]) => ({ store, amt }))
  showDetail.value = true
}

onMounted(async () => {
  // 유저명 로컬스토리지에서
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    userName.value = auth.user?.username || ''
  } catch {}

  // 추천 API 호출
  try {
    const res = await getRecommendations()
    if (res.data.success) {
      data.value = res.data.data
    }
  } catch (e) {
    console.error('추천 조회 실패', e)
  } finally {
    loading.value = false
  }
})

const recommendedCards = computed(() =>
  data.value.recommendation.cards.slice(0, 3)
)
const currentCards = computed(() =>
  data.value.current.cards.slice(0, 3)
)

function formatCurrency(val) {
  return val ? val.toLocaleString() : '0'
}
</script>

<style scoped>
/* 레이아웃 */
.p-4 { padding: 1rem; }
.loading { text-align: center; padding: 2rem 0; color: #666; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

/* 절약 금액 */
.saving .amount {
  color: #d9534f;
  font-size: 1.5rem;
  font-weight: 500;
}
.text-lg { font-size: 1.25rem; }

/* 콤보 박스 */
.combo-box {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 1rem;
}
.combo-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

/* VS 텍스트 */
.vs-wrap { text-align: center; }
.vs-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d9534f;
}

/* 카드 한 줄 정렬 */
.cards-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

/* 카드 아이템 */
.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}
.card-item img {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.375rem;
}
.card-name {
  margin-top: 0.5rem;
  font-size: 0.65rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  background: #fbbf24;
  color: #fff;
  border: none;
  cursor: pointer;
}

/* 할인 상세 모달 */
.detail-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.detail-content {
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 80%;
  max-width: 320px;
}
.detail-content h3 {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  text-align: center;
}
.detail-content ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}
.detail-content li {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}
.close-btn {
  display: block;
  margin: 0 auto;
  padding: 0.25rem 0.75rem;
  background: #fbbf24;
  color: #fff;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
}
</style>
