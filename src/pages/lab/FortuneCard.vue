<template>
  <div class="fortune-card-wrapper">
    <!-- 스크롤 가능한 전체 콘텐츠 -->
    <div class="fortune-scroll-container">
      <!-- 배경과 모든 콘텐츠를 포함하는 컨테이너 -->
      <div class="fortune-content">
        <!-- 닫기 버튼 -->
        <button class="close-button" @click="goBack">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- 배너 영역 (배경 이미지 포함) -->
        <div class="fortune-banner">
          <!-- 배너 내부 행운지수 텍스트 -->
          <div class="fortune-index" v-if="fortune">
            행운지수 {{ fortune.fortuneIndex }}
          </div>
        </div>

        <!-- 나머지 콘텐츠 -->
        <div v-if="fortune" class="fortune-overlay">
          <div class="fortune-section" style="margin-top: 40px">
            <div class="fortune-section-title">오늘의 소비 메세지</div>
            <hr class="fortune-divider" />
            <div class="fortune-section-content">{{ fortune.message }}</div>
          </div>

          <div class="fortune-section">
            <div class="fortune-section-title">행운의 아이템</div>
            <hr class="fortune-divider" />
            <div class="fortune-item">
              <img :src="fortune.luckyItemImageUrl" alt="행운 아이템 이미지" />
              <div class="fortune-item-name">{{ fortune.luckyItem }}</div>
            </div>
          </div>

          <!-- 하단 여백 -->
          <div class="bottom-spacing"></div>
        </div>

        <div v-else class="fortune-loading">운세를 불러오는 중 ...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import labApi from '@/api/labApi';

const route = useRoute();
const router = useRouter();
const fortune = ref(null);

const goBack = () => {
  // memberId를 유지하면서 /lab으로 이동
  const memberId = route.query.memberId;
  if (memberId) {
    router.push({ path: '/lab', query: { memberId } });
  } else {
    router.push('/lab');
  }
};

onMounted(async () => {
  const memberId = Number(route.query.memberId); // URL에서 추출
  if (!memberId) return;

  try {
    const response = await labApi.getFortune(memberId);
    fortune.value = response.data;
  } catch (err) {
    console.error('운세 불러오기 실패:', err);
  }
});
</script>

<style scoped>
.fortune-card-wrapper {
  width: 100%;
  max-width: 375px;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

/* 스크롤 가능한 전체 컨테이너 */
.fortune-scroll-container {
  width: 100%;
  height: 100vh;
  overflow-y: auto; /* 세로 스크롤 활성화 */
  overflow-x: hidden;
}

/* 전체 콘텐츠 컨테이너 */
.fortune-content {
  width: 100%;
  min-height: 100vh; /* 최소 높이를 화면 높이로 설정 */
  background-image: url('@/assets/lab/fortune_result_back.png');
  background-size: cover; /* 화면에 맞게 조정 */
  background-repeat: no-repeat;
  background-position: center top;
  position: relative;
  padding-bottom: 50px; /* 하단 여백 추가 */
}

/* 닫기 버튼 */
.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 20px;
  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
}

/* 배너 영역 */
.fortune-banner {
  height: 240px; /* 배너 높이 설정 */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 행운지수 위치 (배너 중앙) */
.fortune-index {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-top: -10px; /* 칸의 중앙으로 조정 */
}

/* 본문 콘텐츠 */
.fortune-overlay {
  padding: 0 16px;
  box-sizing: border-box;
  text-align: center;
}

/* 메시지, 아이템 공통 박스 */
.fortune-section {
  margin-bottom: 24px;
  background: #ffffff; /* 내부 배경색 */
  border: 2px solid #333; /* 테두리 진하게 */
  padding: 16px;
}

.fortune-section-title {
  font-weight: bold;
  font-size: 18px;
}

.fortune-section-content {
  font-size: 16px;
  font-weight: 500;
  padding: 5px;
}

/* 아이템 */
.fortune-item {
  text-align: center; /* 아이템은 가운데 정렬 유지 */
}

.fortune-item img {
  width: 300px;
  height: auto;
  object-fit: contain;
  margin-bottom: 6px;
}

.fortune-item-name {
  font-size: 16px;
  font-weight: 500;
}

/* 하단 여백 */
.bottom-spacing {
  height: 50px;
}

/* 로딩 */
.fortune-loading {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #444;
}

/* 기존 스크롤바 스타일링 제거 */
</style>
