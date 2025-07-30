<template>
  <SubHeader />
  <div class="lab-page">
    <header class="lab-header">
      <h1 class="lab-title mt-4">🧪 실험실</h1>
    </header>

    <MissionCard :missions="missions" />

    <div class="fortune-section">
      <div class="fortune-title">
        <img src="@/assets/lab/fortune_icon.png" class="fortune-icon" />
        <div>
          <h2 class="mt-3 mx-3">오늘의 소비 운세</h2>
          <p class="description fortune-sub">지름신으로부터 지켜줄게요 !</p>
        </div>
      </div>

      <div class="fortune-content">
        <img
          src="@/assets/lab/fortune.png"
          alt="포춘쿠키"
          class="fortune-image"
        />
        <button class="fortune-button" @click="goToFortune">운세 뽑기</button>
      </div>

      <div v-if="isLoading" class="fortune-loading-overlay">
        <img
          src="@/assets/lab/fortune_loading.gif"
          alt="로딩 애니메이션"
          class="fortune-loading-gif"
        />
      </div>
    </div>

    <AnalysisCard :analysis="analysis" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import labApi from '@/api/labApi';

import MissionCard from '@/pages/lab/MissionCard.vue';
import AnalysisCard from '@/pages/lab/AnalysisCard.vue';
import SubHeader from '@/layout/SubHeader.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 사용자 ID 가져오기 (로그인 or 쿼리(테스트용))
const memberId = route.query.memberId ?? authStore.state.value?.user?.id;

const isLoading = ref(false);
const goToFortune = () => {
  isLoading.value = true;

  setTimeout(() => {
    router.push({ path: '/lab/fortune', query: { memberId } });
  }, 2000);
};

const missions = ref([]);
const analysis = ref(null);

onMounted(async () => {
  if (!memberId) {
    console.warn('memberId가 존재하지 않습니다.');
    return;
  }

  try {
    const response = await labApi.getLabOverview(memberId);
    missions.value = response.data.missions;
    analysis.value = response.data.analysis;
  } catch (err) {
    console.error('LAB API ERROR:', err);
  }
});
</script>

<style scoped>
.lab-page {
  padding: 16px;
  padding-bottom: 80px;
  background-color: #fff;
}

/* Header */
.lab-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.back-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
.lab-title {
  font-size: 24px;
  font-weight: bold;
  margin-left: 8px;
}

/* 운세 */
.fortune-section {
  background: #fdfdfd;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.fortune-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.fortune-icon {
  width: 60px;
  height: auto;
  margin-right: 8px;
}
.fortune-sub {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
}
.fortune-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fortune-image {
  width: 200px;
  margin: 16px auto;
}
.fortune-button {
  padding: 12px 24px;
  font-size: 1rem;
  background-color: #5b4cf0;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.fortune-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fdebd0; /* 배경색은 gif 배경과 맞추면 좋음 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.fortune-loading-gif {
  width: 320px;
}
.description {
  margin: 4px 0 0;
  font-size: 14px;
  color: #999;
}
</style>
