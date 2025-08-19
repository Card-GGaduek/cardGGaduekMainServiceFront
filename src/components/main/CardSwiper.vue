<template>
  <div class="card-swiper-container">
    <!-- 안내 메시지 (선택 사항): 카드가 없을 때만 노출 -->
<!--    <div v-if="cards.length === 0" class="no-cards-message">-->
<!--      <p class="no-cards-text">등록된 카드가 없습니다</p>-->
<!--      <button class="link-card-button" @click="goToCardLink">-->
<!--        카드 연동하기-->
<!--      </button>-->
<!--    </div>-->

    <!-- 스와이퍼: 카드가 없더라도 항상 렌더링 -->
    <div class="swiper-container">
      <Swiper
          :slides-per-view="'auto'"
          :centered-slides="true"
          :space-between="16"
          :loop="false"
          :initial-slide="cards.length > 0 ? 1 : 0"
          @slideChange="onSlideChange"
          class="card-swiper"
      >
        <!-- 카드 목록 슬라이드 (카드가 있을 때만 렌더링) -->
        <SwiperSlide
            v-for="(card, index) in cards"
            :key="card.cardId ?? index"
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
                        {{ card.cardProductName }}
                      </h3>
                      <p class="card-back-company">
                        카드사
                        <!-- 현재 MyCardDTO에 은행 정보가 없어서 고정값 -->
                      </p>
                    </div>

                    <div class="benefits-section">
                      <div
                          class="benefits-container"
                          :class="{ expanded: expandedCards.has(index) }"
                      >
                        <div
                            v-for="(benefit, benefitIndex) in getDisplayBenefits(card.storeBenefitList, index)"
                            :key="benefitIndex"
                            class="benefit-item"
                        >
                          <div class="benefit-icon">
                            <span
                                v-if="benefit.storeCategory === 'CONVENIENCE_STORE'"
                                class="category-emoji"
                            >🏪</span>
                            <span
                                v-else-if="benefit.storeCategory === 'COFFEE_SHOP'"
                                class="category-emoji"
                            >☕</span>
                            <span
                                v-else-if="benefit.storeCategory === 'MOVIE_THEATER'"
                                class="category-emoji"
                            >🎬</span>
                            <span
                                v-else-if="benefit.storeCategory === 'GAS_STATION'"
                                class="category-emoji"
                            >⛽</span>
                            <span
                                v-else-if="benefit.storeCategory === 'RESTAURANT'"
                                class="category-emoji"
                            >🍽️</span>
                            <span
                                v-else-if="benefit.storeCategory === 'HOTEL'"
                                class="category-emoji"
                            >🏨</span>
                            <span
                                v-else-if="benefit.storeCategory === 'THEME_PARK'"
                                class="category-emoji"
                            >🎡</span>
                            <span v-else class="category-emoji">💳</span>
                          </div>
                          <span class="benefit-text">{{ benefit.description }}</span>
                        </div>
                      </div>

                      <!-- 더보기/접기 버튼 -->
                      <div
                          v-if="card.storeBenefitList && card.storeBenefitList.length > 2"
                          class="more-benefits-button"
                          @click.stop="toggleBenefitsExpand(index)"
                      >
                        <span v-if="!expandedCards.has(index)">
                          더보기 (+{{ card.storeBenefitList.length - 2 }})
                        </span>
                        <span v-else>접기</span>
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
                        <span class="footer-text">고객센터</span>
                      </div>
                      <div class="footer-item">
                        <span class="footer-icon">🌐</span>
                        <span class="footer-text">홈페이지</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div> <!-- /.card-inner -->
            </div> <!-- /.card -->
          </div> <!-- /.card-container -->
        </SwiperSlide>

        <!-- 카드 연동하기 (항상 마지막 슬라이드로 존재) -->
        <SwiperSlide class="swiper-slide-custom">
          <div class="card-container">
            <div
                class="card add-card"
                :class="{
                active: activeIndex === cards.length,
                inactive: activeIndex !== cards.length,
              }"
                @click="goToCardLink"
            >
              <div class="add-card-content">
                <div class="add-card-icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="white" />
                    <path d="M20 12V28M12 20H28" stroke="#999" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </div>
                <p class="add-card-text">카드 연동하기</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <!-- 카드 편집: 카드가 있을 때만 노출(원 코드 유지) -->
      <div v-if="cards.length > 0" style="display: flex; justify-content: center">
        <button class="card-edit-text" @click="goToCardEdit">카드 편집</button>
      </div>
    </div>

    <!-- 하단 고정 버튼: 카드가 있을 때만 노출(원 코드 유지) -->
    <div v-if="cards.length > 0" class="fixed-card-buttons">
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/vue';
import memberApi from '@/api/memberApi';

const cards = ref([1]);
const activeIndex = ref(0);               // 기본 0 (카드 없을 때 '연동하기'가 첫 슬라이드)
const flippedCards = ref(new Set());      // 뒤집힌 카드 인덱스 저장
const isSliding = ref(false);             // 슬라이딩 중 여부
const expandedCards = ref(new Set());     // 혜택 확장 카드 인덱스 저장

const router = useRouter();
const hasCards = computed(() => cards.value.length > 0);

// 이용내역 조회: 현재 슬라이드가 실제 카드일 때만 동작
const goToAnalysis = () => {
  const idx = activeIndex.value;
  if (idx >= cards.value.length) {
    // 현재 선택이 '카드 연동하기' 슬라이드인 경우
    alert('먼저 카드를 연동해 주세요.');
    return;
  }
  const current = cards.value[idx];
  if (!current) return;

  router.push({
    name: 'Analysis',
    query: { cardProductId: current.cardProductId },
  });
};

// 결제 페이지로 이동(항상 가능)
const goToPayment = () => {
  router.push('/payment/qr');
};

const goToStoreList = (cardId) => {
  if (!cardId) {
    console.error('카드 ID가 없습니다.');
    return;
  }
  router.push({
    name: 'MapPage',
    query: { cardId },
  });
};

const goToCardLink = () => {
  router.push({ name: 'CardSelectPage' });
};

const goToCardEdit = () => {
  router.push({ path: '/card' });
};

const loadCards = async () => {
  try {
    const result = await memberApi.getMyCard();

    // API 응답 형태 대응: 배열 또는 {data:{data:[...]}}
    const list =
        Array.isArray(result) ? result :
            (Array.isArray(result?.data?.data) ? result.data.data :
                (Array.isArray(result?.data) ? result.data : []));

    cards.value = list.filter(Boolean);

    // 카드가 있으면 두 번째 카드부터 시작(디자인 의도 유지), 없으면 0
    activeIndex.value = cards.value.length > 1 ? 1 : 0;

    // 상태 초기화
    flippedCards.value.clear();
    expandedCards.value.clear();
  } catch (err) {
    const userMessage =
        err?.userMessage ||
        (err?.code === 'ECONNABORTED'
            ? '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
            : '카드 정보를 불러오는데 실패했습니다.');
    alert(userMessage);
    console.error('카드 리스트 로드 실패:', err);
    cards.value = [];
    activeIndex.value = 0;
  }
};

// 혜택 표시 개수 제어
const getDisplayBenefits = (benefits, cardIndex) => {
  if (!Array.isArray(benefits)) return [];
  const isExpanded = expandedCards.value.has(cardIndex);
  return isExpanded ? benefits : benefits.slice(0, 2);
};

// 혜택 더보기/접기
const toggleBenefitsExpand = (cardIndex) => {
  if (expandedCards.value.has(cardIndex)) {
    expandedCards.value.delete(cardIndex);
  } else {
    expandedCards.value.add(cardIndex);
  }
};

const onSlideChange = (swiper) => {
  isSliding.value = true;

  // 모든 카드 앞면으로
  flippedCards.value.clear();
  // 혜택 확장 초기화
  expandedCards.value.clear();

  activeIndex.value = swiper.activeIndex;

  setTimeout(() => {
    isSliding.value = false;
  }, 100);
};

// 카드 뒤집기: 활성 카드이면서 실제 카드 인덱스일 때만
const toggleCardFlip = (index) => {
  if (index !== activeIndex.value) return;
  if (index >= cards.value.length) return; // '카드 연동하기' 슬라이드 방지

  if (flippedCards.value.has(index)) {
    flippedCards.value.delete(index);
  } else {
    flippedCards.value.add(index);
  }
};

onMounted(() => {
  loadCards();
});
</script>

<style scoped>
/* 기존 CSS 그대로 유지 */
.card-swiper-container {
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
  width: 220px !important;
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
  margin-left: 60px;
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
  margin: 12px 0;
  min-height: 0;
}

.benefits-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 100px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.benefits-container.expanded {
  max-height: 180px;
  overflow-y: auto;
}

.more-benefits-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 15px;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: center;
  color: #666;
}

.more-benefits-button:hover {
  background-color: rgba(255, 255, 255, 1);
  border-color: #bbb;
  color: #333;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  min-height: 32px;
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

.card.inactive {
  transform: scale(0.85);
  opacity: 0.6;
  cursor: default;
}

.card.inactive .card-image {
  filter: grayscale(80%) brightness(0.6) contrast(0.8);
}

.card.active {
  transform: scale(1);
  opacity: 1;
  z-index: 10;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.card.active .card-image {
  filter: none;
}

.fixed-card-buttons {
  display: flex;
  gap: 10px;
  margin: 0px auto 0;
  width: 220px;
  justify-content: center;
  position: relative;
  z-index: 20;
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

.card-edit-text {
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  text-align: center;
  border: none;
  background-color: white;
}

/* 카드가 없을 때 메시지 스타일 */
.no-cards-message {
  text-align: center;
  padding: 20px;
  margin-top: 20px;
}

.no-cards-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.link-card-button {
  background-color: #ffd559;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.link-card-button:hover {
  background-color: #f4c025;
}

/* 카드 연동하기 전용 스타일 */
.add-card {
  background-color: #D0D0D0;
  border: 2px dashed #999;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  perspective: none;
}

.add-card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.add-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-card-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

.add-card.active {
  transform: scale(1);
  opacity: 1;
  z-index: 10;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.add-card.inactive {
  transform: scale(0.85);
  opacity: 0.6;
}

:deep(.swiper-wrapper) {
  align-items: center;
}

:deep(.swiper-slide) {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
