<template>
  <div class="all-transactions">
    <!-- 헤더 -->
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="title">지출 내역</h2>
      <div class="card-select">
        <select v-model.number="selectedCardId" @change="onCardChange">
          <option
            v-for="c in cardList"
            :key="c.cardProductId"
            :value="c.cardProductId"
          >
            {{ c.cardName }}
          </option>
        </select>
      </div>
    </div>

    <!-- 거래 리스트 -->
    <div class="tx-list">
      <div
        v-for="tx in sortedTransactions"
        :key="tx.id"
        class="tx-item"
      >
        <div class="tx-info">
          <span class="datetime">{{ formatDate(tx.transDate) }} {{ formatTime(tx.transDate) }}</span>
          <span class="store">{{ tx.storeName }}</span>
        </div>
        <span class="amount">-{{ formatAmount(tx.amount) }}원</span>
      </div>
    </div>

    <!-- 상태 메시지 -->
    <p v-if="loading" class="status-msg">불러오는 중...</p>
    <p v-else-if="!loading && sortedTransactions.length === 0" class="status-msg">
      거래 내역이 없습니다.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCardTransactions } from '@/api/analysisindex.js'

const router = useRouter()
const route  = useRoute()

const transactions   = ref([])
const cardList       = ref([])
const selectedCardId = ref(Number(route.query.cardId) || null)
const loading        = ref(false)

/* 데이터 로드 */
async function loadAll() {
  loading.value = true
  try {
    const res  = await getCardTransactions()
    const list = res.data.data || []

    transactions.value = list.flatMap(c =>
      c.transactions.map(tx => ({ ...tx, cardProductId: c.cardProductId }))
    )
    cardList.value = list.map(c => ({
      cardProductId: c.cardProductId,
      cardName:      c.cardName
    }))

    if (!selectedCardId.value && cardList.value.length) {
      selectedCardId.value = cardList.value[0].cardProductId
      router.replace({ name: 'AllTransactions', query: { cardId: selectedCardId.value } })
    }
  } finally {
    loading.value = false
  }
}
onMounted(loadAll)

/* 드롭다운 변경 */
function onCardChange() {
  router.replace({ name: 'AllTransactions', query: { cardId: selectedCardId.value } })
}

/* 정렬 & 필터 */
const sortedTransactions = computed(() =>
  transactions.value
    .filter(tx => tx.cardProductId === selectedCardId.value)
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
)

/* 유틸 */
function formatDate(dt) {
  const d = new Date(dt)
  return [d.getMonth()+1, d.getDate()].map(n => String(n).padStart(2,'0')).join('.')
}
function formatTime(dt) { return dt.split(' ')[1].slice(0,5) }
function formatAmount(v) { return v.toLocaleString() }

function goBack() {
  router.push({ name: 'Analysis', query: { cardId: selectedCardId.value } })
}

/* 쿼리 동기화 */
watch(() => route.query.cardId, val => {
  if (val) selectedCardId.value = Number(val)
})
</script>

<style scoped>
.all-transactions {
  padding: 1rem;
  background: #fff;
  min-height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.back-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}
.title {
  flex: 1;
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
}
.card-select select {
  padding: 0.5rem;
  border: 1px solid #ffd54f;
  border-radius: 6px;
  appearance: none;
  background: #fff url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23FFD54F' stroke-width='2' fill='none'/%3E%3C/svg%3E") no-repeat right 0.5rem center;
}
.tx-list { margin-top: 1rem; }
.tx-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f2f2f2;
}
.tx-info { display: flex; flex-direction: column; }
.datetime { font-size: 0.875rem; color: #666; }
.store    { font-size: 1rem; }
.amount   { font-weight: 600; color: #d9534f; }

</style>
