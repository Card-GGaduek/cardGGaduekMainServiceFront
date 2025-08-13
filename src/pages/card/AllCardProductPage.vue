<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api/index'; // 설정된 Axios 인스턴스

const router = useRouter();
const route = useRoute();

const cardList = ref([]);
const isLoading = ref(true);
const error = ref(null);

// API를 호출하여 카드 목록을 가져오는 함수
async function fetchCardList() {
  try {
    isLoading.value = true;
    const response = await api.get('/api/card-products');
    cardList.value = response.data.data || response.data;
    error.value = null;
  } catch (err) {
    console.error("카드 목록을 불러오는 데 실패했습니다:", err);
    error.value = "데이터를 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
}

// 컴포넌트가 마운트될 때 API 호출 함수 실행
onMounted(() => {
  fetchCardList();
});

// 상세 페이지로 이동하는 함수
function goToDetail(id) {
  router.push(`/card-detail/${id}`);
}

function goTo(path) { if (path) router.push(path); }
function goBack() { router.back(); }
</script>

<template>
  <div class="mobile-screen">
    <header class="page-header">
      <button class="back-button" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h1 class="page-title"><i class="bi bi-gem"></i>혜택 좋은 카드 전체 보기</h1>
    </header>

    <main class="content-area">
      <div v-if="isLoading" class="status-message">로딩 중...</div>
      <div v-else-if="error" class="status-message error">{{ error }}</div>
      
      <ul v-else class="card-list">
        <li 
          v-for="(card, index) in cardList" 
          :key="card.id" 
          class="card-item"
          @click="goToDetail(card.id)"
        >
          <span class="rank">{{ index + 1 }}</span>
          <img :src="card.cardImageUrl" :alt="card.cardProductName" class="card-image" />
          <span class="card-name">{{ card.cardProductName }}</span>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
/* 전체적인 모바일 화면 레이아웃 */
.mobile-screen {
  
  
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa; /* 이미지와 유사한 배경색 */
  border: 1px solid #e0e0e0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 상단 헤더 */
.page-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  
  /* 그라데이션 텍스트 효과 */
  background: linear-gradient(45deg, #F9D423, #F7971E); /* 밝은 레몬(#F9D423)에서 부드러운 골드(#F7971E)로 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

/* 아이콘에도 동일한 그라데이션 적용 */
.page-title i {
  margin-right: 8px;
  font-size: 18px;
  background: linear-gradient(45deg, #F9D423, #F7971E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.back-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  margin-right: 12px;
  color: #333;
}

.page-title {
  font-size: 19px;
  font-weight: bold;
  color: #0d6efd;
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
  margin: 0;
}

/* 메인 콘텐츠 (스크롤 영역) */
.content-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.card-list {
  list-style: none;
  padding: 0 16px; /* 목록 좌우 여백 */
  margin: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.card-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.card-item:last-child {
  border-bottom: none;
}

.rank {
  font-size: 16px;
  font-weight: 600;
  color: #555;
  width: 30px;
  text-align: left;
  flex-shrink: 0;
}

.card-image {
  width: 80px; /* 이미지 크기 조정 */
  height: 50px; /* 이미지 크기 조정 */
  object-fit: cover;
  border-radius: 4px;
  margin: 0 12px;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.card-name {
  font-size: 15px;
  font-weight: 500;
  color: #212529;
}

/* 로딩/에러 메시지 스타일 */
.status-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.status-message.error {
  color: #dc3545;
}
</style>