<template>
  <div class="fortune-card-wrapper">
    <!-- 스크롤 가능한 전체 콘텐츠 -->
    <div class="fortune-scroll-container">
      <!-- 배경과 모든 콘텐츠를 포함하는 컨테이너 -->
      <div class="fortune-content">
        <!-- 닫기 버튼 -->
        <button class="close-button" @click="goBack">
          <i class="bi bi-x-lg fs-2"></i>
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
              <div class="fortune-item-media">
                <img
                  :src="fortune.luckyItemImageUrl"
                  alt="행운 아이템 이미지"
                />
              </div>
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
import { useRouter } from 'vue-router';
import labApi from '@/api/labApi';

const router = useRouter();
const fortune = ref(null);

const goBack = () => {
  router.push('/lab');
};

onMounted(async () => {
  try {
    const response = await labApi.getFortune();
    fortune.value = response.data;
  } catch (err) {
    console.error('운세 불러오기 실패:', err);
  }
});
</script>

<style scoped>
.fortune-card-wrapper {
  width: 100%;
  max-width: 430px;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

/* 스크롤 가능한 전체 컨테이너 */
.fortune-scroll-container {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.fortune-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 전체 콘텐츠 컨테이너 */
.fortune-content {
  width: 100%;
  min-height: 100vh;
  background-image: url('@/assets/lab/fortune_result_back.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  position: relative;
  padding-bottom: 50px;
}

/* 닫기 버튼 */
.close-button {
  color: black;
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
  height: 240px;
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
  margin-top: -15px;
}

/* 본문 콘텐츠 */
.fortune-overlay {
  padding: 0 16px;
  box-sizing: border-box;
  text-align: center;
  max-width: 430px;
  margin: 0 auto;
}

/* 메시지, 아이템 공통 박스 */
.fortune-section {
  margin-bottom: 24px;
  background: #ffffff;
  border: 2px solid #333;
  padding: 16px;
  box-sizing: border-box;
}

.fortune-section-title {
  font-weight: bold;
  font-size: 20px;
}

.fortune-section-content {
  font-size: 18px;
  font-weight: 500;
  padding: 5px;
}

/* 아이템 */
.fortune-item {
  text-align: center;
}

.fortune-item-media {
  height: clamp(160px, 35vw, 220px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fortune-item-media img {
  width: auto;
  height: auto;
  max-width: 80%;
  max-height: 100%;
  object-fit: contain;
  /* margin-bottom: 6px; */
  display: block;
}

.fortune-item-name {
  font-size: 18px;
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

/* 반응형 대응 */
@media (max-width: 430px) {
  .fortune-overlay {
    padding: 0 12px;
  }

  .fortune-section {
    padding: 12px;
  }

  .fortune-index {
    font-size: 24px;
  }
}
</style>
