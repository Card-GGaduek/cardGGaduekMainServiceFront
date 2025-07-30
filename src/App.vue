<template>
  <div class="app-wrapper">
    <div class="app-content">
      <router-view />
      <Navbar v-if="!hideNavbar" />
    </div>
  </div>
</template>

<script setup>
import Navbar from './layout/Navbar.vue';

import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// lab/fortune에서는 숨김 처리했어요
const hideNavbar = computed(() => route.path === '/lab/fortune');
</script>

<style scoped>
.app-wrapper {
  width: 100dvw;
  height: 100dvh;
  background-color: #ffd559;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: hidden;
}

.app-content {
  position: relative;
  max-width: 430px;
  width: 100%;
  background-color: white;
  height: 100%;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

/* 💡 화면이 768px 이상일 때만 오른쪽으로 이동 */
@media (min-width: 1025px) {
  .app-content {
    transform: translateX(200px); /* or left: 100px */
  }
}
</style>
