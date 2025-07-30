<template>
  <MainHeader :showNotification="true" />
  <!-- 나머지 메인 페이지 내용 -->
  <div>메인페이지</div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import MainHeader from '@/layout/MainHeader.vue';
const router = useRouter();

</script>

<style scoped>
</style>
