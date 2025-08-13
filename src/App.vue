<!-- App.vue -->
<template>
  <div class="app-wrapper">
    <!-- 타이틀 문구 -->
    <div class="title-section">
      <h3 class="title-line">카드가 가득</h3>
      <h2 class="subtitle-line">혜택이 까득</h2>
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
      <!-- ✅ 스크롤 가능한 콘텐츠 영역 -->
      <div
        class="scroll-area"
        :class="{ 'fortune-scroll': route.path === '/lab/fortune' }"
      >
        <router-view />
      </div>

      <!-- ✅ 하단 고정 네비게이션 -->
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
  background-color: rgb(255, 240, 179);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
  position: relative;
}

.app-container {
  position: relative;
  max-width: 430px;
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

.title-section {
  position: absolute;
  top: clamp(32px, 8vh, 84px);
  left: 50%;
  transform: translateX(-43vw);
  text-align: left;
  z-index: 10;
}

.title-section h3 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #cc5500;
  margin: 0;
  animation: fadeIn 1s ease-in-out;
  letter-spacing: -0.3px;
}

.title-section h2 {
  font-size: 3.25rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ff7f50, #d62828);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 4px 0 0 0;
  animation: popUp 1s ease-out;
  letter-spacing: -1px;
}

/* 검색창 스타일 */
.search-section {
  position: absolute;
  top: calc(clamp(32px, 8vh, 84px) + clamp(120px, 12vh, 120px));
  transform: translateX(-34vw);
  z-index: 10;
  width: 350px;
}

.search-bar {
  position: relative;
  height: 70px;
  border: 4px solid #ff7f50;
  border-radius: 50px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.1);
}

/* 인풋이 버튼 밑으로 들어가지 않게 오른쪽 여백 확보 */
.search-input {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  padding-right: 92px;
  font-size: 20px;
  background: transparent;
  color: #333;
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
  right: 0;
  transform: translateY(-50%);
  width: 62px;
  height: 62px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7f50, #d62828);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 30px;
  transition: transform 0.2s ease;
}

.search-button:hover {
  background: linear-gradient(135deg, #ff9060, #f04747);
  transform: scale(1.05);
  transform: translateY(-50%);
}

/* ✨ Animation Effects */
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

.main-text h2 {
  font-weight: 600;
}

.notion-button {
  position: absolute;
  bottom: 40px;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: #fff9d5;
  color: black;
  border-radius: 40px;
  padding: 6px 16px;
  text-decoration: none;
  font-weight: bold;
  font-size: 13px;
  width: 180px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  transform: translateX(-80%);
}

.notion-button span {
  line-height: 1.3;
  flex: 1;
  margin-left: 7px;
}

.icon {
  width: 50px;
  height: auto;
}

.arrow {
  font-size: 20px;
}

@media (min-width: 1025px) {
  .app-container {
    transform: translateX(200px);
  }
}

@media (max-width: 1024px) {
  .notion-button {
    display: none;
  }
  .title-section {
    display: none;
  }
  .search-section {
    display: none;
  }
}
</style>

<style>
.app-wrapper {
  background-image: url('@/assets/test.png');
  background-size: 1000px auto;
  background-repeat: no-repeat;
  background-position: 62% center;
  background-attachment: local;
}

@media (max-width: 1024px) {
  .app-wrapper {
    background-image: none;
  }
}
</style>
