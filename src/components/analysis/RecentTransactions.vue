<template>
  <div class="recent-transactions">
    <div class="header">
      <span class="title">최근 거래내역</span>
      <button class="more-btn" @click="goToAll">더보기</button>
    </div>
    
    <div
      v-for="tx in recentList"
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
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  transactions:  { type: Array,  required: true },
  cardProductId: { type: Number, required: true },
})

const router = useRouter()

/* 최근 3건 */
const recentList = computed(() =>
  [...props.transactions]
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
    .slice(0, 3)
)
console.log(recentList);
function formatDate(dt) {
  const d = new Date(dt)
  return [
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('.')
}
function formatTime(dt)   { return dt.split(' ')[1].slice(0, 5) }
function formatAmount(v) { return v.toLocaleString() }

function goToAll() {
  router.push({ name: 'AllTransactions', query: { cardId: props.cardProductId } })
}
</script>

<style scoped>
.recent-transactions { margin-top: 1.25rem; }
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.title { font-size: 0.9375rem; font-weight: 700; }
.more-btn {
  background: none;
  border: none;
  font-size: 0.8125rem;
  cursor: pointer;
}
.more-btn:hover { text-decoration: underline; }
.tx-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.tx-info { display: flex; flex-direction: column; }
.datetime {
  font-size: 0.8125rem;
  color: #555;
  margin-bottom: 0.125rem;
}
.store   { font-size: 0.875rem; }
.amount  { font-weight: 600; color: #d9534f; }
</style>
