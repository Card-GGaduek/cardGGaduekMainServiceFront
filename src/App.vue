<template>
  <div id="app">
    <router-view />
    <Navbar v-if="!hideNavbar" />
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

<style scoped></style>
