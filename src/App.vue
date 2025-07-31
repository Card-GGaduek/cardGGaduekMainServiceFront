<template>
  <div class="app-wrapper">
    <div class="app-content">
      <router-view />
      <Navbar />
    </div>
  </div>
</template>

<script setup>
import MainHeader from '@/layout/MainHeader.vue'
import Navbar from '@/layout/Navbar.vue'

</script>

<style scoped>
/* 전역 스타일 */
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden; /* 페이지 전체 스크롤 방지 */
}

#app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-content {
  flex-grow: 1; /* 남는 공간을 모두 차지 */
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  position: relative; /* 자식 요소의 position:absolute 기준점 */
}

.app-wrapper {
  width: 100dvw;
  height: 100dvh;
  background-color: #ffcd39;
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
  box-shadow: 0 0 8px rgba(0,0,0,0.05);
}

/* 💡 화면이 768px 이상일 때만 오른쪽으로 이동 */
@media (min-width: 1025px) {
  .app-content {
    transform: translateX(200px); /* or left: 100px */
  }
}
</style>