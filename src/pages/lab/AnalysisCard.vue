<template>
  <div v-if="analysis" class="analysis-card">
    <div class="analysis-header">
      <img src="@/assets/lab/analysis_icon.png" class="analysis-icon" />
      <div>
        <h4 class="mt-3 mx-3">이번 달 소비 성향 분석</h4>
        <p class="analysis-sub mx-3">나의 소비 DNA는?</p>
      </div>
    </div>

    <img
      :src="analysis.imageUrl"
      :alt="analysis.category"
      class="analysis-image"
    />

    <h3 class="analysis-result-title">{{ analysis.resultTitle }}</h3>
  </div>

  <div v-else class="analysis-placeholder">
    분석 결과를 불러오는 중입니다...
  </div>
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
  padding: 20px;
  margin-top: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.analysis-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.analysis-icon {
  width: 40px;
  height: auto;
  margin-right: 2px;
  margin-left: 8px;
}

.analysis-sub {
  margin: 4px 0 0;
  font-size: 14px;
  color: #999;
  text-align: left;
}

.analysis-image {
  width: 180px;
  margin: 12px 0;
}

.analysis-result-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.analysis-placeholder {
  text-align: center;
  margin: 20px 0;
  color: #aaa;
}
</style>
