<template>
  <div>메인페이지</div>
  <div>
    <router-link :to="{ path: '/lab', query: { memberId: 1 } }"
      >실험실 페이지로 가볼까용</router-link
    >
  </div>
</template>

<script setup></script>

<style scoped></style>
