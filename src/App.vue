<!--<template>-->
<!--  <div class="app-wrapper">-->
<!--    <div class="app-content">-->
<!--      <router-view />-->

<!--      &lt;!&ndash; ✅ QR 페이지에서는 Navbar 숨기기 &ndash;&gt;-->
<!--      <Navbar v-if="!$route.meta.hideNav" />-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import Navbar from './layout/Navbar.vue'-->
<!--</script>-->

<!--<style scoped>-->
<!--.app-wrapper {-->
<!--  width: 100dvw;-->
<!--  height: 100dvh;-->
<!--  background-color: #ffcd39;-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  align-items: flex-start;-->
<!--  overflow-x: hidden;-->
<!--}-->

<!--.app-content {-->
<!--  position: relative;-->
<!--  max-width: 430px;-->
<!--  width: 100%;-->
<!--  background-color: white;-->
<!--  height: 100%;-->
<!--  box-shadow: 0 0 8px rgba(0,0,0,0.05);-->
<!--}-->

<!--/* 💡 화면이 768px 이상일 때만 오른쪽으로 이동 */-->
<!--@media (min-width: 1025px) {-->
<!--  .app-content {-->
<!--    transform: translateX(200px);-->
<!--  }-->
<!--}-->
<!--</style>-->

<!-- App.vue -->
<template>
  <div class="app-wrapper">
    <div class="app-container">
      <!-- ✅ 스크롤 영역 -->
      <div class="scroll-area">
        <router-view />
      </div>

      <!-- ✅ 고정 네비게이션바 -->
      <Navbar v-if="!$route.meta.hideNav" />
    </div>
  </div>
</template>

<script setup>
import Navbar from './layout/Navbar.vue'
</script>

<style scoped>
.app-wrapper {
  background-color: #ffcd39;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 모바일 화면 중앙 박스 */
.app-container {
  position: relative;
  max-width: 430px;
  width: 100%;
  height: 100%;
  background-color: white;
  box-shadow: 0 0 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

/* 스크롤 가능한 영역 (Navbar 제외) */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px; /* ✅ Navbar 공간 확보 */
}

/* 데스크톱에서만 위치 조정 (선택) */
@media (min-width: 1025px) {
  .app-container {
    transform: translateX(200px);
  }
}
</style>
