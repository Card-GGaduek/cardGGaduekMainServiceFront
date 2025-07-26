<template>
  <div id="app">
    <MainHeader />
    <router-view />
    <Navbar />
  </div>
</template>

<script setup>
import MainHeader from './layout/MainHeader.vue'
import Navbar from './layout/Navbar.vue'
</script>

<style scoped>

</style>