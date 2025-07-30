<template>
  <div v-if="analysis" class="analysis-card">
    <div class="analysis-header">
      <img src="@/assets/lab/analysis_icon.png" class="analysis-icon" />
      <div>
        <h2 class="mt-3 mx-3">이번 달 소비 성향 분석</h2>
        <p class="description mx-3">나의 소비 DNA는?</p>
      </div>
    </div>

    <img :src="analysis.imageUrl" :alt="analysis.category" class="image" />

    <h3 class="title">{{ analysis.resultTitle }}</h3>
  </div>

  <div v-else class="placeholder">분석 결과를 불러오는 중입니다...</div>
</template>

<script setup>
import { computed } from 'vue';

const { analysis } = defineProps({
  analysis: {
    type: Object,
    required: false,
  },
});

const formattedMonth = computed(() => {
  if (!analysis?.analysisMonth) return '';
  const [year, month] = analysis.analysisMonth.split('-');
  return `${year}년 ${Number(month)}월`;
});
</script>

<style scoped>
.analysis-card {
  background: #fff;
  padding: 16px;
  margin-top: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.image {
  width: 140px;
  margin: 12px 0;
}
.title {
  font-size: 1.2rem;
  font-weight: bold;
}
.sub {
  color: gray;
  font-size: 0.9rem;
}
.placeholder {
  text-align: center;
  margin: 20px 0;
  color: #aaa;
}
.analysis-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.analysis-icon {
  width: 50px;
  height: auto;
  margin-right: 8px;
}
.description {
  margin: 4px 0 0;
  font-size: 14px;
  color: #999;
}
</style>
