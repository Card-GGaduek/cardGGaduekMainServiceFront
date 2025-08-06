<template>
  <div class="all-transactions">
    <!-- 상단 헤더 -->
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="title">지출 내역</h2>
      <!-- 카드 선택 드롭다운 -->
      <div class="card-select">
        <select v-model.number="selectedCardId" @change="fetchTransactions">
          <option
            v-for="c in cardList"
            :key="c.cardId"
            :value="c.cardId"
          >
            {{ c.cardName }}
          </option>
        </select>
      </div>
    </div>

    <!-- 거래 내역 리스트 (날짜 헤더 없이) -->
    <div class="tx-list">
      <div
        v-for="tx in sortedTransactions"
        :key="tx.id"
        class="tx-item"
        @click="goToSlider(tx.cardId)"
      >
        <div class="tx-info">
          <span class="datetime">{{ formatDate(tx.transDate) }} {{ formatTime(tx.transDate) }}</span>
          <span class="store">{{ tx.storeName }}</span>
        </div>
        <span class="amount">-{{ formatAmount(tx.amount) }}원</span>
      </div>
    </div>

    <!-- 로딩 / 빈 상태 -->
    <p v-if="loading">불러오는 중...</p>
    <p v-else-if="!loading && sortedTransactions.length === 0">
      거래 내역이 없습니다.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardTransactions } from '@/api/analysisindex.js'

const route = useRoute()
const router = useRouter()

const transactions    = ref([])
const cardList        = ref([])
const selectedCardId  = ref(Number(route.query.cardId) || null)
const loading         = ref(false)

async function loadAll() {
  loading.value = true
  try {
    const res = await getCardTransactions()
    const list = res.data.data || []
    transactions.value = list.flatMap(c =>
      c.transactions.map(tx => ({ ...tx, cardId: c.cardId }))
    )
    cardList.value = list.map(c => ({ cardId: c.cardId, cardName: c.cardName }))
    if (!selectedCardId.value && cardList.value.length) {
      selectedCardId.value = cardList.value[0].cardId
      router.replace({ name: 'AllTransactions', query: { cardId: selectedCardId.value } })
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
onMounted(loadAll)

watch(selectedCardId, id => {
  router.replace({ name: 'AllTransactions', query: { cardId: id } })
})

const sortedTransactions = computed(() =>
  transactions.value
    .filter(tx => tx.cardId === selectedCardId.value)
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
)

function formatDate(dt) {
  const d = new Date(dt)
  return [d.getMonth()+1, d.getDate()]
    .map(n => String(n).padStart(2,'0'))
    .join('.')
}
function formatTime(dt) {
  return dt.split(' ')[1].slice(0,5)
}
function formatAmount(v) {
  return v.toLocaleString()
}

function goBack() {
  router.push({ name: 'Analysis', query: { cardId: selectedCardId.value } })
}
function goToSlider(cardId) {
  router.push({ name: 'Analysis', query: { cardId } })
}

// (필요 시) 개별 재로딩 로직 추가
async function fetchTransactions() {}
</script>

<style scoped>
.all-transactions {
  padding: 1rem;              /* 16px */
  background: #f9f9f9;
  min-height: 100vh;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;     /* 12px */
}
.back-btn {
  background: none;
  border: none;
  font-size: 1.125rem;        /* 18px */
  margin-right: 0.5rem;       /* 8px */
  cursor: pointer;
}
.title {
  font-size: 1.125rem;        /* 18px */
  font-weight: bold;
  flex: 1;
}

/* 드롭다운 (노란 테두리 + 화살표) */
.card-select {
  position: relative;
}
.card-select select {
  padding: 0.375rem 2rem 0.375rem 0.75rem; /* 6px 32px 6px 12px */
  font-size: 0.875rem;       /* 14px */
  border: 1px solid #FFD54F;
  border-radius: 0.375rem;   /* 6px */
  background: white;
  appearance: none;
  background-image:
    url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23FFD54F' stroke-width='2' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center; /* 8px */
}
.card-select select:focus {
  outline: none;
  box-shadow: 0 0 0 0.125rem rgba(255,213,79,0.3); /* 2px */
}

/* 거래 리스트 */
.tx-list {
  margin-top: 0.5rem;        /* 8px */
}
.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;         /* 8px 0 */
  border-bottom: 0.0625rem solid #f2f2f2; /* 1px */
  cursor: pointer;
}
.tx-info {
  display: flex;
  flex-direction: column;
}
.datetime {
  font-size: 0.8125rem;      /* 13px */
  color: #555;
  margin-bottom: 0.125rem;   /* 2px */
}
.store {
  font-size: 0.875rem;       /* 14px */
  color: #000;
}
.amount {
  font-size: 0.875rem;       /* 14px */
  font-weight: 600;
  color: #d9534f;
  flex-shrink: 0;
}
</style>
