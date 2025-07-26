<!-- src/pages/common/NotFoundPage.vue -->
<template>
  <div class="not-found text-center">
    <h1>😵 404</h1>
    <p>페이지를 찾을 수 없습니다.</p>
    <RouterLink to="/" class="btn btn-primary mt-3">홈으로 돌아가기</RouterLink>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  padding: 100px 20px;
}
</style>
