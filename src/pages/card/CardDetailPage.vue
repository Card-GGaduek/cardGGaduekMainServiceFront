<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/index.js';

const route = useRoute();
const router = useRouter();
const cardDetail = ref(null);
const isLoading = ref(true);

async function fetchCardDetail() {
  try {
    isLoading.value = true;
    // 💡 라우트 파라미터에서 id를 가져옵니다.
    const productId = route.params.id; 
    const response = await api.get(`api/card-products/${productId}`);
    cardDetail.value = response.data.data || response.data;
  } catch (err) {
    console.error("카드 상세 정보 실패:", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchCardDetail);

function goBack() { router.back(); }
function applyForCard() {
  // 1. cardDetail 객체와 cardApplyUrl이 있는지 확인
  if (cardDetail.value && cardDetail.value.cardApplyUrl) {
    alert(`${cardDetail.value.cardProductName} 신청 페이지로 이동합니다.`);
    // 2. 새 탭에서 카드 신청 URL 열기
    window.open(cardDetail.value.cardApplyUrl, '_blank');
  } else {
    // 3. URL이 없는 경우 사용자에게 알림
    alert('카드 신청 링크가 준비되지 않았습니다.');
  }
}
</script>

<template>
  <div class="mobile-screen">
    <header class="page-header">
      <button class="back-button" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </button>
    </header>

    <main class="content-area">
      <div v-if="isLoading" class="status-message">로딩 중...</div>
      <div v-else-if="error" class="status-message error">{{ error }}</div>
      
      <div v-else-if="cardDetail" class="card-detail-container">
        <div class="card-image-wrapper">
          <img :src="cardDetail.cardImageUrl" :alt="cardDetail.cardProductName" class="card-image" />
        </div>

        <div class="card-name-wrapper">
          <h2 class="card-name">{{ cardDetail.cardProductName }}</h2>
        </div>

        <section class="info-summary-section">
          <div class="info-item">
            <div class="info-label">연회비</div>
            <div class="info-value">{{ cardDetail.annualFee}}원</div>
          </div>
          <div class="info-item">
            <div class="info-label">전월실적</div>
            <div class="info-value">{{ cardDetail.requiredMonthlySpent}}원 이상</div>
          </div>
        </section>
        
        <section class="benefits-section">
          <h3 class="section-title">주요 혜택</h3>
          <div class="benefit-list">
            <div v-for="(benefit, index) in cardDetail.benefits" :key="index" class="benefit-item">
              <div class="benefit-title">
                <span class="benefit-icon">💳</span>
                <span>{{ benefit.storeName }} ({{ benefit.storeCategory }})</span>
              </div>
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer v-if="cardDetail" class="page-footer">
      <button class="apply-button" @click="applyForCard">
        카드 신청하기
      </button>
    </footer>
  </div>
</template>

<style scoped>
/* 이전과 동일한 CSS를 사용합니다. */
:root { --main-yellow: #fdd835; --light-yellow: #fffde7; }
.mobile-screen { max-width: 420px; min-width: 320px; height: 100vh; margin: 0 auto; display: flex; flex-direction: column; background-color: #f8f9fa; border: 1px solid #e0e0e0; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.page-header { display: flex; align-items: center; padding: 12px 16px; background-color: #f8f9fa; flex-shrink: 0; }
.back-button { background: none; border: none; font-size: 28px; cursor: pointer; padding: 0; color: #333; }
.content-area { flex-grow: 1; overflow-y: auto; padding: 16px; }
.card-image-wrapper, .card-name-wrapper, .benefit-item { border: 2px solid var(--main-yellow); }
.card-image-wrapper { padding: 12px; background-color: #fff; border-radius: 8px; display: inline-block; margin: 0 auto; }
.card-image { display: block; width: 240px; height: 150px; object-fit: contain; border-radius: 4px; }
.card-name-wrapper { margin-top: 20px; padding: 8px 16px; background-color: #fff; border-radius: 4px; text-align: center; }
.card-name { font-size: 18px; font-weight: bold; margin: 0; }
.benefits-section { margin-top: 32px; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #333; }
.benefit-list { display: flex; flex-direction: column; gap: 12px; }
.benefit-item { background-color: var(--light-yellow); padding: 16px; border-radius: 8px; }
.benefit-title { display: flex; align-items: center; font-size: 16px; font-weight: 600; color: #333; }
.benefit-icon { font-size: 20px; margin-right: 10px; }
.benefit-description { font-size: 14px; color: #555; margin: 8px 0 0 0; line-height: 1.5; }
.page-footer { padding: 16px; background-color: #f8f9fa; flex-shrink: 0; }
.apply-button { width: 100%; padding: 16px; font-size: 18px; font-weight: bold; color: #423100; background-color: #fbc02d; border: none; border-radius: 8px; cursor: pointer; }
.status-message { text-align: center; padding: 40px; color: #6c757d; }
.status-message.error { color: #dc3545; }
.info-summary-section {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin-top: 24px;
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid var(--light-yellow);
}
.info-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}
.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>