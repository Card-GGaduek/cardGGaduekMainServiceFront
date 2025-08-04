<template>
  <div class="main-page">
    <MainHeader :showNotification="true" />

    <div class="swiper-container">
      <Swiper
        :slides-per-view="'auto'"
        :centered-slides="true"
        :space-between="16"
        :loop="false"
        :initial-slide="1"
        @slideChange="onSlideChange"
        class="card-swiper"
      >
        <SwiperSlide
          v-for="(card, index) in cards"
          :key="card.cardId"
          class="swiper-slide-custom"
        >
          <div class="card-container">
            <div
              class="card"
              :class="{
                active: index === activeIndex,
                inactive: index !== activeIndex,
                flipped: flippedCards.has(index),
                'no-animation': isSliding,
              }"
              @click="toggleCardFlip(index)"
            >
              <div class="card-inner">
                <div class="card-front">
                  <img
                    :src="card.cardImageUrl"
                    alt="카드 이미지"
                    class="card-image"
                  />
                </div>
                <div class="card-back">
                  <div class="card-back-content">
                    <div class="card-back-header">
                      <h3 class="card-back-title">
                        {{ getCardBackInfo(card.cardId)?.cardName || '카드명' }}
                      </h3>
                      <p class="card-back-company">
                        {{
                          getCardBackInfo(card.cardId)?.cardCompany || '카드사'
                        }}
                      </p>
                    </div>

                    <div class="benefits-section">
                      <div
                        v-for="(benefit, benefitIndex) in (
                          getCardBackInfo(card.cardId)?.benefits || []
                        ).slice(0, 3)"
                        :key="benefitIndex"
                        class="benefit-item"
                      >
                        <div class="benefit-icon">
                          <span
                            v-if="benefit.storeCategory === 'CONVENIENCE_STORE'"
                            class="category-emoji"
                            >🏪</span
                          >
                          <span
                            v-else-if="benefit.storeCategory === 'COFFEE_SHOP'"
                            class="category-emoji"
                            >☕</span
                          >
                          <span
                            v-else-if="
                              benefit.storeCategory === 'MOVIE_THEATER'
                            "
                            class="category-emoji"
                            >🎬</span
                          >
                          <span
                            v-else-if="benefit.storeCategory === 'GAS_STATION'"
                            class="category-emoji"
                            >⛽</span
                          >
                          <span
                            v-else-if="benefit.storeCategory === 'RESTAURANT'"
                            class="category-emoji"
                            >🍽️</span
                          >
                          <span
                            v-else-if="benefit.storeCategory === 'HOTEL'"
                            class="category-emoji"
                            >🏨</span
                          >
                          <span
                            v-else-if="benefit.storeCategory === 'THEME_PARK'"
                            class="category-emoji"
                            >🎡</span
                          >
                          <span v-else class="category-emoji">💳</span>
                        </div>
                        <span class="benefit-text">{{
                          benefit.description
                        }}</span>
                      </div>
                    </div>

                    <!-- 혜택 가능한 매장 보기 버튼 -->
                    <div
                      class="view-stores-button"
                      @click.stop="goToStoreList(card.cardId)"
                    >
                      <span>혜택 적용 가능한 매장 보기</span>
                    </div>

                    <div class="card-back-footer">
                      <div class="footer-item">
                        <span class="footer-icon">📞</span>
                        <span class="footer-text">신한카드</span>
                      </div>
                      <div class="footer-item">
                        <span class="footer-icon">🌐</span>
                        <span class="footer-text">신한은행</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 카드 편집 텍스트 (비활성 카드에만 표시) -->
            <div v-if="index !== activeIndex" class="card-edit-text">
              카드 편집
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- 버튼들을 Swiper 밖으로 이동하여 고정 -->
    <div class="fixed-card-buttons">
      <button class="card-button usage-history-btn" @click="goToAnalysis">
        이용내역 조회
      </button>
      <button class="card-button payment-btn" @click="goToPayment">
        결제하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainHeader from '@/layout/MainHeader.vue';
import { getCardList, getCardBack } from '@/api/maincard';
import { useRouter } from 'vue-router';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/vue';

const cards = ref([]);
const activeIndex = ref(1); // 두 번째 카드부터 시작
const flippedCards = ref(new Set()); // 뒤집힌 카드들의 인덱스를 저장
const isSliding = ref(false); // 슬라이딩 중인지 확인
const cardBackData = ref({}); // 카드 뒷면 데이터 저장

const router = useRouter();

// 이용내역 조회 페이지로 이동
const goToAnalysis = () => {
  router.push({ name: 'Analysis' });
};

// 결제 페이지로 이동
const goToPayment = () => {
  router.push('/payment/qr');
};

const goToStoreList = (cardId) => {
  console.log('카드 ID:', cardId); // 디버깅용
  if (!cardId) {
    console.error('카드 ID가 없습니다.');
    return;
  }

  try {
    router.push({
      name: 'Map', // 또는 'MapPage' - 라우터 설정에 맞게
      query: { cardId: cardId },
    });
  } catch (error) {
    console.error('페이지 이동 실패:', error);
  }
};

const loadCards = async () => {
  try {
    const response = await getCardList(1);
    cards.value = response.data.data;
  } catch (err) {
    console.error('카드 리스트 로드 실패:', err);
  }
};

const maskCardNumber = (number) => {
  return number?.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const getCardBackInfo = (cardId) => {
  return cardBackData.value[cardId];
};

const onSlideChange = (swiper) => {
  // 슬라이딩 시작 시 애니메이션 비활성화
  isSliding.value = true;

  // 즉시 모든 카드를 앞면으로 되돌리기 (애니메이션 없이)
  flippedCards.value.clear();

  activeIndex.value = swiper.activeIndex;

  // 약간의 딜레이 후 애니메이션 다시 활성화
  setTimeout(() => {
    isSliding.value = false;
  }, 100);
};

const toggleCardFlip = async (index) => {
  // 활성 카드(가운데 카드)만 뒤집기 가능
  if (index === activeIndex.value) {
    if (flippedCards.value.has(index)) {
      flippedCards.value.delete(index);
    } else {
      // 카드 뒷면 데이터가 없으면 API 호출
      const cardId = cards.value[index].cardId;
      if (!cardBackData.value[cardId]) {
        try {
          const response = await getCardBack(cardId);
          cardBackData.value[cardId] = response.data.data;
        } catch (err) {
          console.error('카드 뒷면 데이터 로드 실패:', err);
          return;
        }
      }
      flippedCards.value.add(index);
    }
  }
};

onMounted(() => {
  loadCards();
});
</script>

<style scoped>
.main-page {
  width: 100%;
  overflow: hidden;
}

.swiper-container {
  width: 100%;
  padding: 1rem 0;
  overflow: visible;
}

.card-swiper {
  width: 100%;
  overflow: visible;
}

.swiper-slide-custom {
  width: 220px !important; /* 슬라이드 고정 너비 */
  flex-shrink: 0;
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.card {
  background-color: transparent;
  border-radius: 20px;
  width: 220px;
  height: 350px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.3s ease;
  transform-origin: center;
  cursor: pointer;
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.4s ease-in-out;
  transform-style: preserve-3d;
  border-radius: 20px;
}

/* 슬라이딩 중일 때 애니메이션 비활성화 */
.card.no-animation .card-inner {
  transition: none;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 20px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border: none;
  outline: none;
  transform: translateZ(0);
  will-change: transform;
}

.card-back {
  transform: rotateY(180deg);
  background-image: url('@/assets/main/cardback.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
}

.card-back-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
  /* 회색 영역을 피해서 오른쪽 흰색 영역에만 위치 */
  margin-left: 60px; /* 회색 줄 너비만큼 여백 */
  padding: 20px 20px 20px 0;
}

.card-back-header {
  text-align: left;
  margin-top: 5px;
}

.card-back-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 5px 0;
  line-height: 1.2;
}

.card-back-company {
  font-size: 12px;
  color: #555;
  margin: 0;
}

.benefits-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 15px 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 0;
}

.benefit-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  flex-shrink: 0;
}

.category-emoji {
  font-size: 15px;
}

.benefit-text {
  font-size: 11px;
  color: #333;
  font-weight: 400;
  line-height: 1.3;
}

.card-back-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.view-stores-button {
  padding: 5px 5px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: white;
  margin: 0 auto;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.view-stores-button:hover {
  background-color: #f4f4f4;
}

.view-stores-button .icon {
  width: 14px;
  height: 14px;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.footer-icon {
  font-size: 12px;
}

.footer-text {
  font-size: 11px;
  color: #666;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease, transform 0.3s ease;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.card-info {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: white;
  text-shadow: 0 0 3px black;
}

.card-info .card-number {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.card-info .card-name,
.card-info .card-bank {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

/* 비활성 카드 스타일 */
.card.inactive {
  transform: scale(0.85);
  opacity: 0.6;
  cursor: default;
}

.card.inactive .card-image {
  filter: grayscale(80%) brightness(0.6) contrast(0.8);
}

/* 활성 카드 스타일 */
.card.active {
  transform: scale(1);
  opacity: 1;
  z-index: 10;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.card.active .card-image {
  filter: none;
}

/* 고정된 카드 버튼 스타일 */
.fixed-card-buttons {
  display: flex;
  gap: 10px;
  margin: 0px auto 0;
  width: 220px;
  justify-content: center;
  position: relative;
  z-index: 20; /* Swiper보다 위에 표시 */
}

.card-button {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.usage-history-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #e0e0e0;
}

.usage-history-btn:hover {
  background-color: #e9ecef;
}

.payment-btn {
  background-color: #ffd559;
  color: white;
}

.payment-btn:hover {
  background-color: #f4c025;
}

/* 카드 편집 텍스트 스타일 */
.card-edit-text {
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* Swiper 기본 스타일 오버라이드 */
:deep(.swiper-wrapper) {
  align-items: center;
}

:deep(.swiper-slide) {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
