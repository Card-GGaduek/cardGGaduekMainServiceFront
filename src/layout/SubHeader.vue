<template>
  <header class="bg-light border-bottom py-2 px-3 d-flex align-items-center">
    <button class="back-button" @click="goBack">←</button>
    <span class="ms-2">{{ title }}</span>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: ''
  }
})

const router = useRouter()
const goBack = () => router.back()
</script>

<style scoped>
.back-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
