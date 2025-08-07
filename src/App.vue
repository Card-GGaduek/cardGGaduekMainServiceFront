<!-- App.vue -->
<template>
  <div class="app-wrapper">
    <div class="title-section">
      <h3 class="title-line">카드가 가득</h3>
      <h2 class="subtitle-line">혜택이 까득</h2>
    </div>

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
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const router = useRouter();
const hideNavbar = computed(() => route.path === '/lab/fortune');

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
  top: 100px;
  left: 50%;
  transform: translateX(-500px);
  text-align: left;
  z-index: 10;
}

.title-section h3 {
  font-size: 40px;
  font-weight: 600;
  color: #cc5500;
  margin: 0;
  animation: fadeIn 1s ease-in-out;
  letter-spacing: -0.3px;
}

.title-section h2 {
  font-size: 52px;
  font-weight: 800;
  background: linear-gradient(90deg, #ff7f50, #d62828);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 4px 0 0 0;
  animation: popUp 1s ease-out;
  letter-spacing: -1px;
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
  /* left: calc(50% -550px); */
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
