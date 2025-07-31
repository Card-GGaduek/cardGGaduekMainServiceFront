<!-- src/components/analysis/TabNav.vue -->
<template>
  <div class="tabs-container">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: tab.key === activeTab }"
      @click="$emit('change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TabNav',
  emits: ['change'],
  props: {
    activeTab: { 
      type: String, 
      required: true 
    },
  },
  data() {
    return {
      tabs: [
        { key: 'cardPerformance',      label: '카드 실적' },
        { key: 'MonthlySpending',     label: '월별 실적' },
        { key: 'cardRecommend', label: '카드 추천' },
      ],
    }
  },
}
</script>

<style scoped>
.tabs-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
  height: 44px;
  margin: 0 auto;
  padding: 4px;
  background: #FFFFFF;
  border: 1px solid rgba(217, 217, 217, 0.3);
  border-radius: 12px;     
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
}

.tabs-container button {
  flex: 1;
  height: 36px;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: 8px;      
  font-family: 'KoPubWorldDotum', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 36px;
  text-align: center;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tabs-container button.active {
  background: #FFCD39;
  color: #FFFFFF;
  font-weight: 700;
  margin: 0 4px;
}

@media (max-width: 375px) {
  .tabs-container {
    padding: 3px;
  }
  .tabs-container button {
    height: 32px;
    border-radius: 6px;      
    font-size: 13px;
    line-height: 32px;
  }
  .tabs-container button.active {
    margin: 0 3px;
  }
}

@media (max-width: 320px) {
  .tabs-container button {
    height: 28px;
    border-radius: 4px;    
    font-size: 12px;
    line-height: 28px;
  }
  .tabs-container button.active {
    margin: 0 2px;
  }
}
</style>
