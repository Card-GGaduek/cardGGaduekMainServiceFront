<template>
  <div id="app-container">
    <MainHeader />
    <main class="main-content">
      <router-view/>
    </main>
    <Navbar />
  </div>
</template>

<script setup>
import MainHeader from '@/layout/MainHeader.vue'
import Navbar from '@/layout/Navbar.vue'

</script>

<style>
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
</style>