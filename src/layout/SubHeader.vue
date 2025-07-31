<template>
  <header class="py-1 px-3">
    <button class="back-button" @click="goBack">
      <i class="fa-solid fa-arrow-left"></i>
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.back();
</script>

<style scoped>
.back-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
