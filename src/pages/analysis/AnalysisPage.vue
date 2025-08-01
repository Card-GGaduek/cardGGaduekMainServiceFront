<template>
  <div class="analysis-page">
    <SubHeader title="지출 내역" :showBack="true" />

    <TabNav :activeTab="activeTab" @change="activeTab = $event" />

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
        <CardSlider :cards="cards" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SubHeader          from '@/layout/SubHeader.vue';
import TabNav             from '@/components/analysis/TabNav.vue';
import CardSlider         from '@/components/analysis/CardSlider.vue';
import { getCardPerformance, getCardTransactions } from '@/api/analysisindex.js';

const memberId = 1;  // 실제 로그인한 유저 ID로 대체
const activeTab = ref('cardPerformance');
const cards     = ref([]);
const loading   = ref(false);
const error     = ref(null);

// 모든 카드를 일시적으로 동일 이미지로 표시할 기본 URL
const defaultCardImage = 'https://d1c5n4ri2guedi.cloudfront.net/card/13/card_img/28201/13card.png';

async function loadAll() {
  loading.value = true;
  error.value   = null;

  try {
    // 1) 카드 실적
    const perfRes = await getCardPerformance(memberId);
    if (!perfRes.data.success) throw new Error(perfRes.data.message);

    // 2) 거래내역
    const txRes = await getCardTransactions(memberId);
    if (!txRes.data.success)   throw new Error(txRes.data.message);

    const perfData = perfRes.data.data; // [{ cardId, cardProductName, spentAmount, requiredMonthlySpending, … }]
    const txData   = txRes.data.data;   // [{ cardId, transactions: […] }, …]

    // 3) 성능 + 거래내역 병합 → cards 배열 생성
    cards.value = perfData.map(cd => {
      // 카드 객체 기본 정보
      const card = {
        id:            cd.cardId,
        owner:         cd.ownerName    || '이유진',
        name:          cd.cardProductName,
        image:         defaultCardImage,              // ← 여기만 바꿨습니다
        currentAmount: cd.spentAmount,
        totalAmount:   cd.requiredMonthlySpending,
        transactions:  []
      };

      // 해당 카드의 거래내역이 있으면 내림차순 정렬 후 상위 3건 추출
      const found = txData.find(t => t.cardId === cd.cardId);
      if (found) {
        card.transactions = found.transactions
          .sort((a, b) => new Date(b.transDate) - new Date(a.transDate))
          .slice(0, 3);
      }

      return card;
    });

  } catch (e) {
    console.error(e);
    error.value = e.message || '데이터 로드 실패';
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
</script>

<style scoped>
.card-section { margin-top: 24px; }
.loading-container,
.error-container,
.empty-container {
  text-align: center; padding: 40px 0;
}
.loading-spinner {
  width: 40px; height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FFCD39;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-button {
  margin-top: 12px;
  padding: 6px 12px;
  background: #FFCD39;
  border: none; color: white; border-radius: 6px;
  cursor: pointer;
}
</style>
