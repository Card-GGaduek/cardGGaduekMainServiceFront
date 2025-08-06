<template>
  <div class="main-page">
    <MainHeader :showNotification="true" />

    <!-- 카드 스와이퍼 컴포넌트 -->
    <CardSwiper />

    <!-- 추천 카드 컴포넌트 -->
    <RecommendedCards />

    <!-- 월별 혜택 컴포넌트 -->
    <MonthlyBenefit />

    <!-- 실험실 페이지 이동 버튼 컴포넌트 -->
    <LabButton />

    <!-- 광고형배너 -->
    <AdBanner />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import MainHeader from '@/layout/MainHeader.vue';
import CardSwiper from '@/components/main/CardSwiper.vue';
import RecommendedCards from '@/components/main/RecommendedCards.vue';
import MonthlyBenefit from '@/components/main/MonthlyBenefit.vue';
import LabButton from '@/components/main/LabButton.vue';
import AdBanner from '@/components/main/AdBanner.vue';

// 페이지 초기화 로직만 필요하다면 여기에
onMounted(() => {
  console.log('Main 페이지 로드됨');
  // 필요한 초기화 로직이 있다면 여기에 추가
});
</script>

<style scoped>
.main-page {
  width: 100%;
  overflow: hidden;
}
</style>