<template>
  <header class="py-1 px-3">
    <button class="back-button" @click="goBack">
      <i class="bi bi-arrow-left"></i>
    </button>
    <span class="title ms-2">{{ title }}</span>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: '',
  },
  backTo: {
    type: String,
    required: false,
    default: null,
  },
});

const router = useRouter();
const goBack = () => {
  if (props.backTo) {
    router.push(props.backTo);
  } else {
    router.back();
  }
};
</script>

<style scoped>
.back-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
.title {
  padding-left: 3px;
  font-size: 18px;
}
</style>
