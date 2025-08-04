<template>
  <div class="analysis-page">
    <SubHeader title="지출 내역" :showBack="true" />
    <TabNav :activeTab="activeTab" @change="activeTab = $event" />
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
        <CardSlider :cards="cards" />
      </div>
    </div>
    <!-- 월간 지출 -->
    <div v-if="activeTab === 'MonthlySpending'" class="monthly-section">
      <MonthlySpending />
      <CategorySpending/>
    </div>
 


    <!-- 카드 추천 -->
    <div v-if="activeTab === 'cardRecommend'" class="recommend-section">
      <p>카드 추천 기능은 아직 개발 중입니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SubHeader from '@/layout/SubHeader.vue';
import TabNav from '@/components/analysis/TabNav.vue';
import CardSlider from '@/components/analysis/CardSlider.vue';
import MonthlySpending from '@/components/analysis/MonthlySpending.vue';
import { getCardPerformance, getCardTransactions, getMonthlySpending } from '@/api/analysisindex.js';
import CategorySpending from '@/components/analysis/CategorySpending.vue';

const memberId = 1;  // 로그인한 사용자 ID
const activeTab = ref('cardPerformance'); //현재 선택된 탭
const cards = ref([]); //카드 정보 배열 -> api로 가져온 카드 정보 및 거래 내역 저장됨
const loading = ref(false); //로딩 중 상태
const error = ref(null); //에러 메시지

async function loadAll() {
  loading.value = true;
  error.value = null;

  try {
    // 카드 실적 api 호출
    const perfRes = await getCardPerformance(memberId);
    if (!perfRes.data.success) throw new Error(perfRes.data.message);

    // 거래 내역 api 호출
    const txRes = await getCardTransactions(memberId);
    if (!txRes.data.success) throw new Error(txRes.data.message);

    // 데이터 가공
    const perfData = perfRes.data.data;
    const txData = txRes.data.data;

    cards.value = perfData.map(cd => {
      const card = {
        id: cd.cardId,
        owner: cd.ownerName || '이유진',
        name: cd.cardProductName,
        image: cd.cardImageUrl,
        currentAmount: cd.spentAmount,
        totalAmount: cd.requiredMonthlySpent,
        transactions: []
      };

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
