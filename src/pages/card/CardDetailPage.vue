<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/index'; // 설정된 Axios 인스턴스

const route = useRoute();
const router = useRouter();

// 라우트의 productId 파라미터를 props로 받습니다. (router/index.js에 props:true 설정 필요)
const props = defineProps({
  productId: {
    type: [String, Number],
    required: true,
  },
});

const cardDetail = ref(null);
const isLoading = ref(true);
const error = ref(null);

// API를 호출하여 카드 상세 정보를 가져오는 함수
async function fetchCardDetail() {
  try {
    isLoading.value = true;
    const response = await api.get(`/api/card-products/${props.id}`);
    cardDetail.value = response.data.data || response.data;
    error.value = null;
  } catch (err) {
    console.error("카드 상세 정보를 불러오는 데 실패했습니다:", err);
    error.value = "카드 정보를 찾을 수 없습니다.";
    // API 실패 시, 디자인 확인을 위한 Mock 데이터 (실제 운영 시에는 제거)
  } finally {
    isLoading.value = false;
  }
}

// 컴포넌트가 마운트될 때 API 호출 함수 실행
onMounted(() => {
  fetchCardDetail();
});

function goBack() {
  router.back();
}

function applyForCard() {
  // 실제 카드 신청 페이지로 이동하는 로직
  alert(`${cardDetail.value.cardName} 신청 페이지로 이동합니다.`);
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
          <h2 class="card-name">{{ cardDetail.cardName }}</h2>
        </div>

        <section class="benefits-section">
          <h3 class="section-title">주요 혜택</h3>
          <div class="benefit-list">
            <div v-for="benefit in cardDetail.benefits" :key="benefit.id" class="benefit-item">
              <div class="benefit-title">
                <span class="benefit-icon">{{ benefit.icon }}</span>
                <span>{{ benefit.title }}</span>
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
/* CSS 변수를 사용해 주요 색상을 관리하면 편리합니다. */
:root {
  --main-yellow: #fdd835;
  --light-yellow: #fffde7;
}

.mobile-screen {
  max-width: 420px;
  min-width: 320px;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

.back-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  color: #333;
}

.content-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
}

.card-image-wrapper, .card-name-wrapper, .benefit-item {
  border: 2px solid var(--main-yellow);
}

.card-image-wrapper {
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  display: inline-block; /* 내용물 크기에 맞게 조정 */
  margin: 0 auto; /* 가운데 정렬 */
}

.card-image {
  display: block;
  width: 240px;
  height: 150px;
  object-fit: contain;
  border-radius: 4px;
}

.card-name-wrapper {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #fff;
  border-radius: 4px;
  text-align: center;
}

.card-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.benefits-section {
  margin-top: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 아이템 사이의 간격 */
}

.benefit-item {
  background-color: var(--light-yellow);
  padding: 16px;
  border-radius: 8px;
}

.benefit-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.benefit-icon {
  font-size: 20px;
  margin-right: 10px;
}

.benefit-description {
  font-size: 14px;
  color: #555;
  margin: 8px 0 0 0;
  line-height: 1.5;
}

.page-footer {
  padding: 16px;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

.apply-button {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #423100;
  background-color: var(--main-yellow);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-button:hover {
  background-color: #fbc02d; /* 조금 더 진한 노란색 */
}

.status-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.status-message.error {
  color: #dc3545;
}
</style>