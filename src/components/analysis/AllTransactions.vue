<!-- src/components/analysis/AllTransactions.vue -->
<template>
  <div class="all-transactions">
    <!-- 상단 헤더 -->
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="title">지출 내역</h2>
    </div>

    <div class="card-select">
      <select v-model.number="selectedCardId">
        <option v-for="c in cardList" :key="c.cardId" :value="c.cardId">
          {{ c.cardName }}
        </option>
      </select>
    </div>

    <!-- 거래 내역 그룹별 렌더링 -->
    <div
      v-for="group in groupedTransactions"
      :key="group.date"
      class="date-group"
    >
      <p class="date-label">{{ formatDate(group.date) }}</p>
      <div v-for="tx in group.transactions" :key="tx.id" class="tx-item">
        <div class="store-info">
          <span class="store">{{ tx.storeName }}</span>
          <span class="time">{{ formatTime(tx.transDate) }}</span>
        </div>
        <div class="amount">-{{ formatAmount(tx.amount) }}원</div>
      </div>
    </div>

    <!-- 로딩 / 빈 상태 -->
    <p v-if="loading">불러오는 중...</p>
    <p v-else-if="!loading && groupedTransactions.length === 0">
      거래 내역이 없습니다.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// 1) props 로 router.query.cardId 받기
const props = defineProps({
  cardId: { type: Number, default: null },
});

const route = useRoute();
const router = useRouter();
const transactions = ref([]);
const cardList = ref([]);
const selectedCardId = ref(props.cardId);
const loading = ref(false);

// 2) API 호출: 전체 카드+거래 가져오기
onMounted(async () => {
  loading.value = true;
  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (auth.token) {
      const res = await axios.get(`/api/members/cards/transactions`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
    }

    const list = res.data.data || [];

    // flatMap 으로 모든 거래에 cardId, cardName 붙이기
    transactions.value = list.flatMap((c) =>
      c.transactions.map((tx) => ({
        ...tx,
        cardId: c.cardId,
        cardName: c.cardName,
      }))
    );

    // 드롭다운 옵션용 카드 목록
    cardList.value = list.map((c) => ({
      cardId: c.cardId,
      cardName: c.cardName,
    }));

    // 쿼리가 없으면 첫 번째 카드로 초기화
    if (!selectedCardId.value && cardList.value.length) {
      selectedCardId.value = cardList.value[0].cardId;
    }
  } catch (e) {
    console.error('거래 내역 로드 실패', e);
  } finally {
    loading.value = false;
  }
});

// 3) URL 쿼리가 바뀌면 selectedCardId 도 업데이트
watch(
  () => route.query.cardId,
  (id) => {
    if (id) selectedCardId.value = Number(id);
  }
);

// 4) selectedCardId 가 바뀌면 URL 쿼리도 교체
watch(selectedCardId, (id) => {
  router.replace({ name: 'AllTransactions', query: { cardId: id } });
});

// 5) selectedCardId 로 필터 + 날짜별 그룹화
const groupedTransactions = computed(() => {
  const filtered = transactions.value
    .filter((tx) => tx.cardId === selectedCardId.value)
    .sort((a, b) => new Date(b.transDate) - new Date(a.transDate));

  const map = {};
  filtered.forEach((tx) => {
    const day = tx.transDate.split(' ')[0]; // "YYYY-MM-DD"
    (map[day] ||= []).push(tx);
  });

  return Object.entries(map).map(([date, txs]) => ({
    date,
    transactions: txs,
  }));
});

// 6) 포맷 함수들
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  return `${M}.${D}`;
}
function formatTime(dt) {
  return dt.split(' ')[1].slice(0, 5);
}
function formatAmount(v) {
  return v.toLocaleString();
}
function goBack() {
  router.back();
}
</script>

<style scoped>
.all-transactions {
  padding: 16px;
  background: #f9f9f9;
  min-height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  margin-right: 8px;
  cursor: pointer;
}
.title {
  font-size: 18px;
  font-weight: bold;
}

.card-select {
  margin-bottom: 12px;
}
select {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.date-group {
  margin-bottom: 14px;
}
.date-label {
  font-size: 13px;
  font-weight: bold;
  margin: 12px 0 4px;
}

.tx-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  background: white;
}
.store-info {
  display: flex;
  flex-direction: column;
}
.store {
  font-size: 14px;
}
.time {
  font-size: 12px;
  color: #888;
}
.amount {
  font-size: 14px;
  font-weight: bold;
  color: red;
}
</style>
