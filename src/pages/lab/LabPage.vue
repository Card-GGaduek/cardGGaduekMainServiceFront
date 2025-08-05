<template>
  <div class="lab-page-wrapper">
    <SubHeader :backTo="'/'" />
    <div class="lab-page-scroll">
      <div class="lab-page">
        <header class="lab-header">
          <img src="@/assets/lab/lab_icon.png" class="lab-icon" />
          <h1 class="lab-title mt-4">실험실</h1>
        </header>

        <MissionCard :missions="missions" />

        <div class="fortune-section">
          <div class="fortune-title">
            <img src="@/assets/lab/fortune_icon.png" class="fortune-icon" />
            <div>
              <h3 class="mt-3 mx-1">오늘의 소비 운세</h3>
              <p class="description fortune-sub">지름신으로부터 지켜줄게요 !</p>
            </div>
          </div>

          <div class="fortune-content">
            <img
              src="@/assets/lab/fortune.png"
              alt="포춘쿠키"
              class="fortune-image"
            />
            <button class="fortune-button" @click="goToFortune">
              운세 뽑기
            </button>
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
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import labApi from '@/api/labApi';

import MissionCard from '@/pages/lab/MissionCard.vue';
import AnalysisCard from '@/pages/lab/AnalysisCard.vue';
import SubHeader from '@/layout/SubHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const goToFortune = () => {
  isLoading.value = true;

  setTimeout(() => {
    router.push({ path: '/lab/fortune' });
  }, 2000);
};

const missions = ref([]);
const analysis = ref(null);

onMounted(async () => {
  try {
    const response = await labApi.getLabOverview();
    missions.value = response.data.missions;
    analysis.value = response.data.analysis;
  } catch (err) {
    console.error('LAB API ERROR:', err);
  }
});
</script>

<style scoped>
.lab-icon {
  width: 60px;
  height: auto;
  /* margin-right: 8px; */
}
.lab-page-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.lab-page-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* NavBar 높이만큼 하단 여백 확보 */
  padding-bottom: 80px;
}

.lab-page {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  box-sizing: border-box;
  min-height: 100%;
}

/* Header */
.lab-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.lab-title {
  font-size: 35px;
  font-weight: 600;
  margin-left: 8px;
}

/* 운세 */
.fortune-section {
  background: #fdfdfd;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  /* text-align: center; */
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
  margin-left: 8px;
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
  width: 250px;
  margin: 5px auto 14px auto;
}
.fortune-button {
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 600;
  background-color: #ffd559;
  color: #5e514d;
  /* color: white; */
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.fortune-loading-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 100%;
  background-color: #fae8cb;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.fortune-loading-gif {
  width: 320px;
  max-width: 90%;
}
.description {
  margin: 4px 0 0 5px;
  font-size: 14px;
  color: #999;
}

/* 스크롤바 완전히 숨기기 */
.lab-page-scroll {
  /* 웹킷 기반 브라우저 (Chrome, Safari, Edge) */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.lab-page-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
