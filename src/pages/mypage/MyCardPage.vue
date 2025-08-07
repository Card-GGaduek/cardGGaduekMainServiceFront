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

    // 2. 실제 카드 배열이 있는 response.data.data를 할당합니다.
    myCards.value = response;
    console.log(myCards.value);
  } catch (e) {
    console.error("카드 목록 조회 실패:", e);
    alert('카드 목록을 불러오는 데 실패했습니다.');
    // --- 에러 발생 시, 테스트를 위한 목업(Mockup) 데이터 ---
    // --- 목업 데이터 끝 ---
  } finally {
    isLoading.value = false; // 로딩 상태 종료
  }
});
</script>

<template>
  <div class="page-container">
    <div class="pt-4 logo-container">
      <img src="@/assets/logo/logo.jpg" alt="카드까득 로고" class="logo-img" />
    </div>
    <header class="page-header">
      <button @click="router.back()" class="back-button">&larr;</button>
      <h1 class="page-title">내 카드</h1>
      <div class="placeholder"></div>
    </header>

    <main class="content-area">
      <div v-if="isLoading" class="feedback-view">
        <div class="spinner-border" role="status"></div>
        <p class="mt-3">카드를 불러오는 중입니다...</p>
      </div>
      
      <div v-else-if="myCards.length === 0" class="feedback-view">
        <p>등록된 카드가 없습니다.</p>
      </div>

      <div v-else class="card-list">
        <div 
          v-for="card in myCards" 
          :key="card.cardId" 
          class="card-item"
        >
          <img :src="card.cardImageUrl" :alt="card.cardProductName" class="card-thumbnail" />
          <span class="card-item-name">{{ card.cardProductName }}</span>
        </div>
      </div>
    </main>
      <div class="add-card-group">
        <input type="text" placeholder="카드 추가하기" class="add-card-input" />
        <button class="add-card-button">인증하기</button>
      </div>
    
  </div>
</template>

<style scoped>
.logo-container {
  padding-left: 1rem; /* 이 부분을 추가하여 내부 요소를 가운데 정렬합니다. */
}

/* 로고 헤더 */
.logo-img {
  height:32px;
  background-color: white;
}

.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
.placeholder { width: 24px; color:white;}

.content-area {
  flex-grow: 1;
  padding: 20px 15px;
  padding-bottom: 120px; /* 푸터 높이만큼 공간 확보 */
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
  gap: 30px;
}

/* 새로운 카드 아이템 스타일 */
.card-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.card-item:hover {
  transform: scale(1.02);
}

.card-thumbnail {
  width: 70px;
  height: 44px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-item-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 푸터 스타일 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 420px;
  margin: 0 auto;
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-top: 1px solid #e9ecef;
}

.add-card-group {
  display: flex;
  margin-bottom: 10px;
}

.add-card-input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 8px 0 0 8px;
  padding: 10px 15px;
  outline: none;
}

.add-card-button {
  border: 1px solid #ccc;
  border-left: none;
  background-color: #e9ecef;
  padding: 10px 15px;
  border-radius: 0 8px 8px 0;
  font-weight: 500;
  cursor: pointer;
}

</style>