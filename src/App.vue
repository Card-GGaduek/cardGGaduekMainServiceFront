<!-- App.vue -->
<template>
  <div class="app-wrapper">
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
import { useRoute } from 'vue-router';

const route = useRoute();
const hideNavbar = computed(() => route.path === '/lab/fortune');
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
  background-color: #ffd559;
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

@media (min-width: 1025px) {
  .app-container {
    transform: translateX(200px);
  }
}
</style>
