<template>
  <div class="analysis-page">
    <SubHeader title="지출 내역" :showBack="true" />
    <TabNav :activeTab="activeTab" @change="onTabChange" />

    <!-- 카드 실적 -->
    <div v-if="activeTab === 'cardPerformance'" class="card-section">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>카드 정보를 불러오는 중...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadAll" class="retry-button">다시 시도</button>
      </div>
      <div v-else-if="cards.length === 0" class="empty-container">
        <p>등록된 카드가 없습니다.</p>
      </div>
      <div v-else>
        <CardSlider :cards="cards" :initialProductId="initialProductId" />
      </div>
    </div>

    <!-- 월간 지출 -->
    <div v-if="activeTab === 'MonthlySpending'" class="monthly-section">
      <MonthlySpending />
      <CategorySpending />
    </div>

    <!-- 카드 추천 -->
    <div v-if="activeTab === 'cardRecommend'" class="recommend-section">
      <CardRecommend />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'   // ✅ useRoute 추가
import SubHeader from '@/layout/SubHeader.vue'
import TabNav from '@/components/analysis/TabNav.vue'
import CardSlider from '@/components/analysis/CardSlider.vue'
import MonthlySpending from '@/components/analysis/MonthlySpending.vue'
import CategorySpending from '@/components/analysis/CategorySpending.vue'
import CardRecommend from '@/components/analysis/CardRecommend.vue'
import { getCardPerformance, getCardTransactions } from '@/api/analysisindex.js'

const router = useRouter()
const route = useRoute()                           // ✅ route 선언
const activeTab = ref('cardPerformance')
const cards     = ref([])
const loading   = ref(false)
const error     = ref(null)
const initialProductId = ref(null)   // ⭐ 추가

/* 탭 변경 */
function onTabChange(tabKey) {
  activeTab.value = tabKey
  if (tabKey !== 'cardPerformance') {
    router.replace({ name: 'Analysis', query: {} })
  }
}

/* 데이터 로드 */
async function loadAll() {
  loading.value = true
  error.value   = null
  try {
    const perfRes = await getCardPerformance()
    if (!perfRes.data.success) throw new Error(perfRes.data.message)

    const txRes = await getCardTransactions()
    if (!txRes.data.success) throw new Error(txRes.data.message)

    const perfData = perfRes.data.data
    const txData   = txRes.data.data

    let allCards = perfData.map(cd => {            // ✅ let allCards 로 변경
      const card = {
        cardProductId: cd.cardProductId,
        owner:         cd.ownerName,
        name:          cd.cardProductName,
        image:         cd.cardImageUrl,
        currentAmount: cd.spentAmount,
        totalAmount:   cd.requiredMonthlySpent,
        transactions:  []
      }
      const found = txData.find(t => t.cardProductId === cd.cardProductId)
      if (found) {
        card.transactions = found.transactions
            .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
            .slice(0, 3)
      }
      return card
    })

    // 🔹 쿼리 파라미터로 필터 (cardProductId만 사용)
    if (route.query.cardProductId) {
      allCards = allCards.filter(
          c => String(c.cardProductId) === String(route.query.cardProductId)
      )
    }

    cards.value = allCards
  } catch (e) {
    console.error(e)
    error.value = e.message || '데이터 로드 실패'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initialProductId.value = route.query.cardProductId
      ? Number(route.query.cardProductId)
      : null
  loadAll()
})
</script>

<style scoped>
.card-section { margin-top: 24px; }
.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 40px 0;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffcd39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-button {
  margin-top: 12px;
  padding: 6px 12px;
  background: #ffcd39;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
</style>
