<!-- App.vue -->
<template>
  <div class="app-wrapper">

    <!-- 메인 로고 섹션 -->
    <div class="logo-section">
      <img src="@/assets/main/webmainlogo.png" alt="카드까득 혜택까득" class="main-logo" />
    </div>

    <!-- 검색창 -->
    <div class="search-section">
      <div class="search-bar">
        <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            placeholder="매장 키워드를 입력하세요"
            class="search-input"
        />
        <button @click="handleSearch" class="search-button">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <!-- 검색 태그들 -->
      <div class="search-tags">
        <button class="tag tag-cafe">
          <span class="tag-icon">☕</span>
          <span class="tag-text">카페</span>
        </button>
        <button class="tag tag-convenience">
          <span class="tag-icon">🏪</span>
          <span class="tag-text">편의점</span>
        </button>
        <button class="tag tag-cinema">
          <span class="tag-icon">🎬</span>
          <span class="tag-text">영화관</span>
        </button>
        <button class="tag tag-gas">
          <span class="tag-icon">⛽</span>
          <span class="tag-text">주유소</span>
        </button>
      </div>
      <div class="search-tags-row2">
        <button class="tag tag-hotel">
          <span class="tag-icon">🏨</span>
          <span class="tag-text">호텔</span>
        </button>
        <button class="tag tag-restaurant">
          <span class="tag-icon">🍽️</span>
          <span class="tag-text">음식점</span>
        </button>
        <button class="tag tag-playground">
          <span class="tag-icon">🎡</span>
          <span class="tag-text">놀이공원</span>
        </button>
      </div>
    </div>

    <!-- 노션 이동 버튼 -->
    <a
        href="https://www.notion.so/PJT_13_WeFin-22c014feab4d805e952ae019598b7895"
        target="_blank"
        rel="noopener noreferrer"
        class="notion-button"
    >
      <img src="@/assets/lab/cardGGaduek.gif" alt="카드까득" class="icon" />
      <span>카드까득의<br />정보가 까득!</span>
      <div class="arrow">›</div>
    </a>

    <!-- 앱 화면 -->
    <div class="app-container">
      <!-- 스크롤 가능한 콘텐츠 영역 -->
      <div
          class="scroll-area"
          :class="{ 'fortune-scroll': route.path === '/lab/fortune' }"
      >
        <router-view />
      </div>

      <!-- 하단 고정 네비게이션 -->
      <Navbar v-if="!hideNavbar" />
    </div>
  </div>
</template>

<script setup>
import Navbar from './layout/Navbar.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const router = useRouter();
const hiddenPaths = ['/lab/fortune', '/login', '/join','/payment/qr','/card/select','/card/connectlogin','/payment/completepage','/payment','/booking/confirm'];
const hideNavbar = computed(() => hiddenPaths.includes(route.path));

// 검색
const keyword = ref('');
const handleSearch = () => {
  if (keyword.value.trim()) {
    console.log('검색어: ', keyword.value);

    // MapPage로 라우팅
    router.push({
      name: 'MapPage',
      query: {
        keyword: keyword.value.trim(),
      },
    });

    // 검색 후 입력창 초기화
    keyword.value = '';
  }
};

window.addEventListener('token-expired', () => {
  const store = useAuthStore();
  store.logout();
  router.push('/login');
});
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.app-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #feefc5; /* 0.6 = 60% 불투명 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
  position: relative;
}

/* 메인 로고 섹션 */
.logo-section {
  position: absolute;
  top: 120px;
  left: 49.7%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
}

.main-logo {
  height: 80px;
  width: auto;
}

.app-container {
  position: relative;
  max-width: 420px;
  width: 100%;
  height: 100%;
  background-color: white;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;
}

.fortune-scroll {
  background-color: #f9ebd2 !important;
}

/* 검색창 스타일 */
.search-section {
  position: absolute;
  top: 220px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 490px;
}

.search-bar {
  position: relative;
  height: 60px;
  border: 3px solid #FFCD39;
  border-radius: 25px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.1);
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  padding-right: 60px;
  font-size: 16px;
  background: transparent;
  color: #333;
  border: none;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  outline: none;
  box-shadow: none;
}

.search-button {
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #ffcd39;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: #FFCD39;
  transform: translateY(-50%) scale(1.05);
}

/* 검색 태그 스타일 */
.search-tags,
.search-tags-row2 {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  justify-content: flex-start;
}

.search-tags-row2 {
  margin-bottom: 0;
}

.tag {
  padding: 6px 12px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  color: #333;
  border: 1px solid #e8e8e8;
  min-width: 80px;
  justify-content: center;

  /* 그림자 효과 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);  /* 아래로 진한 그림자 */
}


.tag-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
}

.tag-text {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.tag:hover {
  background-color: #dcdcdc; /* hover 효과 확실하게 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 그림자 유지 or 조금 진하게 */
  cursor: pointer;
}


/* 노션 버튼 스타일 */
.notion-button {
  position: absolute;
  bottom: 40px;
  left: 45%;
  transform: translateX(-50%);
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: #fff9d5;
  color: black;
  border-radius: 40px;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: bold;
  font-size: 13px;
  width: 180px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.notion-button:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notion-button span {
  line-height: 1.3;
  flex: 1;
  margin-left: 8px;
}

.icon {
  width: 45px;
  height: auto;
}

.arrow {
  font-size: 18px;
  color: #ff7f50;
}

/* 반응형 스타일 */
@media (max-width: 1024px) {
  .notion-button,
  .search-section,
  .logo-section,
  .top-logo-section {
    display: none;
  }

  .app-wrapper {
    background-image: none;
    background-color: rgb(255, 240, 179);
  }
}

@media (min-width: 1025px) {
  .app-container {
    transform: translateX(200px);
  }

  .search-section {
    transform: translateX(-34vw);
  }

  .logo-section {
    transform: translateX(-34vw);
  }

  .top-logo-section {
    transform: translateX(-34vw);
  }

  .notion-button {
    transform: translateX(-80%);
  }
}

/* 애니메이션 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popUp {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.logo-section,
.search-section {
  animation: fadeIn 0.6s ease-out;
}

.tag {
  animation: popUp 0.4s ease-out;
}

.tag:nth-child(1) { animation-delay: 0.1s; }
.tag:nth-child(2) { animation-delay: 0.2s; }
.tag:nth-child(3) { animation-delay: 0.3s; }
.tag:nth-child(4) { animation-delay: 0.4s; }
</style>

<style>


/* 1500px 미만에서만 보이지 않도록 */
@media (max-width: 1499px) {
  .logo-section,
  .search-section,
  .search-tags,
  .search-tags-row2,
  .notion-button {
    display: none !important;
  }

  .app-wrapper {
    background-image: none;
    background-color: rgb(228, 193, 47);
  }
}


</style>