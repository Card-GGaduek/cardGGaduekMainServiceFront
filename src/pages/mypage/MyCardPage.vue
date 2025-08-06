<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import memberApi from '@/api/memberApi'; // 실제 API 경로에 맞게 수정해주세요.

const router = useRouter();

// 카드 목록을 저장할 반응형 변수
const myCards = ref([]);
// 데이터 로딩 상태를 관리할 변수
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. API를 호출하여 내 카드 목록을 가져옵니다.
    const response = await memberApi.getMyCard();
    console.log(response);
    // 2. 받아온 결과를 myCards 변수에 할당합니다.
    // API 응답 구조에 따라 response.data.data 또는 response.data 등으로 조정이 필요할 수 있습니다.
    myCards.value = response;
    console.log(myCards.value);
  } catch (e) {
    alert(e.message);
    // --- 에러 발생 시, 테스트를 위한 목업(Mockup) 데이터 ---
    // 실제 환경에서는 이 부분을 삭제하거나 주석 처리하세요.
    // --- 목업 데이터 끝 ---
  } finally {
    isLoading.value = false; // 로딩 상태 종료
  }
});
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <button @click="router.back()" class="back-button">&larr;</button>
      <h1 class="page-title">내 카드 목록</h1>
      <div class="placeholder"></div>
    </header>

    <main class="content-area">
      <div v-if="isLoading" class="feedback-view">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">카드를 불러오는 중입니다...</p>
      </div>
      
      <div v-else-if="myCards.length === 0" class="feedback-view">
        <p>등록된 카드가 없습니다.</p>
        <button class="btn btn-primary mt-2">새 카드 등록하기</button>
      </div>

      <div v-else class="card-list">
        <div 
          v-for="card in myCards" 
          :key="card.cardId" 
          class="credit-card"
          :style="{ background: card.design.background, color: card.design.color }"
        >
          <div class="card-top">
            <span class="card-name">{{ card.cardName }}</span>
            <div class="card-chip"></div>
          </div>
          <div class="card-bottom">
            <p class="card-number">{{ card.cardNumber }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
}
.back-button { font-size: 24px; background: none; border: none; cursor: pointer; }
.page-title { font-size: 18px; font-weight: bold; margin: 0; }
.placeholder { width: 24px; }

.content-area {
  padding: 20px 15px;
}

.feedback-view {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: #6c757d;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.credit-card {
  width: 100%;
  aspect-ratio: 1.586 / 1; /* 신용카드 국제 표준 비율 */
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.credit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  max-width: 70%;
}

.card-chip {
  width: 40px;
  height: 32px;
  background-color: #d4af37;
  border-radius: 4px;
  opacity: 0.8;
}

.card-bottom {
  text-align: center;
}

.card-number {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  letter-spacing: 2px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}
</style>