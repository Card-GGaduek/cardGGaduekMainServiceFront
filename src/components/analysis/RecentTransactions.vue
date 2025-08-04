<!-- src/components/analysis/RecentTransactions.vue -->
<template>
  <div class="recent-transactions">
    <div class="header">
      <span class="title">최근 거래내역</span>
      <button class="more-btn" @click="goToAll">더보기</button>
    </div>

    <div
      v-for="group in groupedRecent"
      :key="group.date"
      class="date-group"
    >
      <p class="date-label">{{ formatDate(group.date) }}</p>
      <div
        v-for="tx in group.transactions"
        :key="tx.id"
        class="tx-item"
      >
        <span class="store">{{ tx.storeName }}</span>
        <span class="amount">-{{ formatAmount(tx.amount) }}원</span>
        <span class="time">{{ formatTime(tx.transDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  transactions: { type: Array, required: true },
  cardId:       { type: Number, required: true },   // 추가
  cardName:     { type: String, required: true }
})

const router = useRouter()

// 최근 3건만
const recentThree = computed(() =>
  [...props.transactions]
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
    .slice(0, 3)
)

// 날짜별 그룹화
const groupedRecent = computed(() => {
  const map = {}
  recentThree.value.forEach(tx => {
    const day = tx.transDate.split(' ')[0]
    ;(map[day] ||= []).push(tx)
  })
  return Object.entries(map)
    .map(([date, txs]) => ({ date, transactions: txs }))
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${M}.${D}`
}
function formatTime(dt)  { return dt.split(' ')[1].slice(0, 5) }
function formatAmount(v){ return v.toLocaleString() }

// “더보기” 클릭 시 AllTransactions 로 이동
function goToAll() {
  router.push({
    name: 'AllTransactions',
    query: { cardId: props.cardId }    // cardId 쿼리로 넘김
  })
}
</script>

<style scoped>
.recent-transactions { margin-top:20px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.title { font-size:15px; font-weight:700; }
.more-btn { background:none; border:none; font-size:13px; cursor:pointer; }
.more-btn:hover { text-decoration:underline; }

.date-group { margin-bottom:14px; }
.date-label { font-size:13px; font-weight:600; color:#555; margin-bottom:4px; }

.tx-item { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f2f2f2; }
.store  { flex:1; font-size:14px; }
.amount { width:90px; text-align:right; font-weight:600; color:#d9534f; }
.time   { width:55px; text-align:right; font-size:12px; color:#888; }
</style>
