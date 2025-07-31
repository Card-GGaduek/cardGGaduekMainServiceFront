<template>
  <div class="recent-transactions">
    <div class="header">
      <span>최근 거래내역</span>
    </div>

    <div
      v-for="group in groupedRecent"
      :key="group.date"
      class="date-group"
    >
      <p class="date-label">
        {{ group.date }} {{ group.weekday }}
      </p>
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
import { computed } from 'vue';

const props = defineProps({
  transactions: { type: Array, required: true }
});

// 1) 날짜 내림차순 정렬 → 상위 3건 추출
const recentThree = computed(() =>
  [...props.transactions]
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
    .slice(0, 3)
);

// 2) 날짜별 그룹화
const groupedRecent = computed(() => {
  const map = {};
  recentThree.value.forEach(tx => {
    const date = tx.transDate.split(' ')[0];
    if (!map[date]) map[date] = [];
    map[date].push(tx);
  });
  return Object.entries(map).map(([date, txs]) => ({
    date,
    weekday: getWeekday(date),
    transactions: txs
  }));
});

function formatTime(dt) {
  return dt.split(' ')[1].slice(0,5);
}
function formatAmount(amount) {
  return amount.toLocaleString();
}
function getWeekday(dateStr) {
  const d = new Date(dateStr);
  const w = ['일','월','화','수','목','금','토'];
  return w[d.getDay()] + '요일';
}
</script>

<style scoped>
.recent-transactions { margin-top:16px; }
.header {
  font-weight:600; margin-bottom:8px;
}
.date-group { margin-bottom:12px; }
.date-label {
  font-weight:bold; margin-bottom:4px;
}
.tx-item {
  display:flex; justify-content:space-between; padding:4px 0;
}
.store { flex:1 }
.amount { width:80px; text-align:right }
.time   { width:50px; text-align:right; color:#666 }
</style>
