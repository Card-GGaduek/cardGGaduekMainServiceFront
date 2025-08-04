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
import MainHeader from '@/layout/MainHeader.vue';
import CardSwiper from '@/components/main/CardSwiper.vue';
import RecommendedCards from '@/components/main/RecommendedCards.vue';
import MonthlyBenefit from '@/components/main/MonthlyBenefit.vue';
import LabButton from '@/components/main/LabButton.vue';
import AdBanner from '@/components/main/AdBanner.vue';
</script>

<style scoped>
.main-page {
  width: 100%;
  overflow: hidden;
}
</style>