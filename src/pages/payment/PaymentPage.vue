<template>
  <div class="payment-card-page">
    <div class="container page-container p-0">
      <!-- 헤더 -->
      <header class="top-header d-flex align-items-center px-3 py-1">
        <button @click="$router.back()" class="btn border-0 p-0 text-dark">
          <i class="bi bi-arrow-left fs-4"></i>
        </button>
      </header>

      <!-- 메인 컨텐츠 -->
      <main class="payment-content p-3">
        <!-- 결제 금액 및 상품 정보 -->
        <section class="payment-info-section mb-3">
          <h2 class="product-name mb-1">{{ productName }}</h2>
          <h1 class="payment-price mb-2">{{ currentFinalAmount.toLocaleString() }}원</h1>

          <!-- 할인 정보 컨테이너 -->
          <div class="discount-info-container">
            <!-- 쿠폰 할인 (항상 표시) -->
            <div class="discount-benefit-card mb-1">
              <div class="d-flex justify-content-between align-items-center">
                <span class="discount-label">쿠폰 할인</span>
                <div class="d-flex align-items-center">
                  <span class="discount-amount">
                    -{{ couponDiscountAmount.toLocaleString() }}원
                  </span>
                  <i class="bi bi-chevron-right ms-2 text-muted"></i>
                </div>
              </div>
            </div>

            <!-- 카드 할인 (항상 표시, 동적으로 변경) -->
            <div class="discount-benefit-card">
              <div class="d-flex justify-content-between align-items-center">
                <span class="discount-label">{{ selectedCard?.name || '카드' }} 할인</span>
                <div class="d-flex align-items-center">
                  <span class="discount-amount" :class="{ 'text-success': currentCardDiscount > 0 }">
                    -{{ currentCardDiscount.toLocaleString() }}원
                  </span>
                  <i class="bi bi-chevron-right ms-2 text-muted"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- 가격 변동 안내 -->
          <div v-if="showPriceChangeNotice" class="price-change-notice">
            <i class="bi bi-info-circle me-2"></i>
            <span>카드 선택에 따라 할인 금액이 달라집니다.</span>
          </div>
        </section>

        <!-- 카드 슬라이더 -->
        <section class="card-slider-section">
          <!-- 로딩 중일 때 -->
          <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2 text-muted">카드 정보를 불러오는 중...</p>
          </div>

          <!-- 카드가 있을 때 -->
          <div v-else-if="userCards.length > 0" class="card-swiper-container">
            <div class="swiper-container">
              <Swiper
                  :slides-per-view="'auto'"
                  :centered-slides="true"
                  :space-between="16"
                  :loop="false"
                  :initial-slide="0"
                  @slideChange="onSlideChange"
                  class="card-swiper"
              >
                <SwiperSlide
                    v-for="(card, index) in userCards"
                    :key="card.cardId"
                    class="swiper-slide-custom"
                >
                  <div class="card-container">
                    <div class="payment-card" :class="{
                      active: index === activeCardIndex,
                      inactive: index !== activeCardIndex,
                      'benefit-card': isSelectedCardFromBooking(card)
                    }">
                      <img
                          :src="card.cardImageUrl"
                          :alt="card.name || '카드 이미지'"
                          class="card-image"
                          @error="handleImageError"
                      />
                      <!-- 선택된 카드 뱃지 -->
                      <div v-if="isSelectedCardFromBooking(card)" class="benefit-badge">
                        <i class="bi bi-star-fill"></i>
                        선택된 카드
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>

            <!-- 카드 혜택 안내 -->
            <div class="card-benefit-notice">
              <p v-if="selectedCard && isSelectedCardFromBooking(selectedCard)" class="benefit-text benefit-active">
                혜택이 적용되는 카드입니다. 할인 금액이 반영되었습니다.
              </p>
              <p v-else class="benefit-text">
                해당 카드는 예약 시 확인한 혜택이 제공되지 않습니다.
              </p>
            </div>
          </div>

          <!-- 카드가 없을 때 -->
          <div v-else class="no-cards-message">
            <div class="text-center py-3">
              <i class="bi bi-credit-card fs-1 text-muted mb-2"></i>
              <p class="text-muted">등록된 카드가 없습니다.</p>
            </div>
          </div>
        </section>

        <!-- 결제 버튼 -->
        <section class="payment-button-section">
          <button
              @click="requestPayment"
              class="payment-submit-btn"
              :disabled="!canPayment || isProcessing"
          >
            <span v-if="isProcessing">
              <div class="spinner-border spinner-border-sm me-2" role="status"></div>
              처리중...
            </span>
            <span v-else>
              {{ currentFinalAmount.toLocaleString() }}원 결제하기
            </span>
          </button>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import axiosInstance from '@/api/axiosInstance';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import memberApi from '@/api/memberApi';

const route = useRoute();
const router = useRouter();

// 상태 관리
const userCards = ref([]);
const activeCardIndex = ref(0);
const isProcessing = ref(false);
const isLoading = ref(true);

// FinalBookingPage에서 전달받은 데이터 - 숫자 변환 처리
const bookingData = ref({
  bookingId: route.query.bookingId ? parseInt(route.query.bookingId) : null,
  roomId: route.query.roomId,
  roomName: route.query.roomName,
  checkIn: route.query.checkIn,
  checkOut: route.query.checkOut,
  name: route.query.name,
  phone: route.query.phone,
  email: route.query.email,
  requestText: route.query.requestText,
  numberOfGuests: parseInt(route.query.numberOfGuests) || 1,
  couponProductId: route.query.couponProductId,
  finalPrice: parseInt(route.query.finalPrice) || 0,
  originalPrice: parseInt(route.query.originalPrice) || 0,
  couponDiscountAmount: parseInt(route.query.couponDiscountAmount) || 0,
  cardDiscountAmount: parseInt(route.query.cardDiscountAmount) || 0,
  // 예약 페이지에서 선택된 카드 정보
  selectedCardName: route.query.selectedCardName,
  selectedCardId: route.query.selectedCardId,
  // 예약 페이지에서 확정된 카드 할인 금액
  confirmedCardDiscount: parseInt(route.query.confirmedCardDiscount) || 0
});

// 결제 관련 데이터
const productName = computed(() => bookingData.value.roomName || '숙박 상품');
const originalPrice = computed(() => bookingData.value.originalPrice);
const couponDiscountAmount = computed(() => bookingData.value.couponDiscountAmount);

// 현재 선택된 카드
const selectedCard = computed(() => userCards.value[activeCardIndex.value] || null);

// 현재 선택된 카드의 할인 금액
const currentCardDiscount = computed(() => {
  const selected = selectedCard.value;
  if (!selected) return 0;

  const isSelectedCard =
      selected.name === bookingData.value.selectedCardName ||
      selected.cardId == bookingData.value.selectedCardId ||
      selected.id == bookingData.value.selectedCardId;

  if (isSelectedCard) {
    return bookingData.value.cardDiscountAmount || bookingData.value.confirmedCardDiscount || 0;
  }
  return 0;
});

// 최종 결제 금액
const currentFinalAmount = computed(() => {
  const baseAmount = originalPrice.value - couponDiscountAmount.value - currentCardDiscount.value;
  return Math.max(baseAmount, 0);
});

// 표시/가능여부
const showPriceChangeNotice = computed(
    () => userCards.value.some(card => isSelectedCardFromBooking(card)) && userCards.value.length > 1
);

const canPayment = computed(
    () => selectedCard.value && userCards.value.length > 0 && !isProcessing.value && currentFinalAmount.value > 0
);

// 예약 페이지에서 선택한 카드인지 확인
const isSelectedCardFromBooking = (card) => {
  if (!card || !bookingData.value.selectedCardId) return false;

  const cardName = card.name || card.cardProductName;
  const selectedName = bookingData.value.selectedCardName;
  const nameMatch = cardName === selectedName;

  const cardIdStr = (card.cardId ?? card.id)?.toString();
  const selectedCardIdStr = bookingData.value.selectedCardId?.toString();
  const idMatch = cardIdStr === selectedCardIdStr;

  return nameMatch || idMatch;
};

// 카드 불러오기
const fetchUserCards = async () => {
  try {
    const result = await memberApi.getMyCard();
    userCards.value = result;

    const selectedIdx = userCards.value.findIndex(card =>
        card.name === bookingData.value.selectedCardName ||
        card.cardId === bookingData.value.selectedCardId ||
        card.id === bookingData.value.selectedCardId
    );
    activeCardIndex.value = selectedIdx !== -1 ? selectedIdx : 0;
  } catch (error) {
    const userMessage = error.userMessage ||
        (error.code === 'ECONNABORTED'
            ? '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
            : '카드 정보를 불러오는데 실패했습니다.');
    alert(userMessage);
    userCards.value = [];
  } finally {
    isLoading.value = false;
  }
};

const onSlideChange = (swiper) => {
  activeCardIndex.value = swiper.activeIndex;
  nextTick(() => {});
};

// 이미지 로딩 에러 처리
const handleImageError = (event) => {
  event.target.src = '/default-card-image.png';
};

// 결제 요청
const requestPayment = () => {
  if (!selectedCard.value) {
    alert('결제할 카드를 선택해주세요.');
    return;
  }
  if (!selectedCard.value.cardId && !selectedCard.value.id) {
    alert('선택된 카드의 ID를 찾을 수 없습니다.');
    return;
  }
  if (currentFinalAmount.value <= 0) {
    alert('결제 금액이 올바르지 않습니다.');
    return;
  }

  const IMP = window.IMP;
  if (!IMP) {
    alert('결제 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요.');
    return;
  }

  isProcessing.value = true;
  IMP.init('imp47740267');

  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  const merchantUid = 'order_' + new Date().getTime();

  const paymentData = {
    pg: 'uplus',
    pay_method: 'card',
    merchant_uid: merchantUid,
    name: productName.value,
    amount: currentFinalAmount.value,
    buyer_email: bookingData.value.email || 'test@example.com',
    buyer_name: bookingData.value.name || '고객',
    buyer_tel: bookingData.value.phone || '010-1234-5678',
    buyer_addr: '서울시 강남구',
    buyer_postcode: '12345'
  };

  if (isMobile) {
    const qs = new URLSearchParams();
    if (bookingData.value.bookingId != null) {
      qs.append('bookingId', String(bookingData.value.bookingId));
    }
    paymentData.m_redirect_url =
        `${window.location.origin}/payment/complete` +
        (qs.toString() ? `?${qs.toString()}` : '');
  }


  IMP.request_pay(paymentData, async function (rsp) {
    isProcessing.value = false;
    if (!isMobile) {
      await handlePaymentResult(rsp, merchantUid);
    }
  });
};

// ✅ 결제만 성공하면 즉시 CompletePage로 이동 (백엔드 저장은 백그라운드로 시도)
const handlePaymentResult = async (rsp, merchantUid) => {
  if (!rsp.success) {
    alert('❌ 결제 실패: ' + rsp.error_msg);
    router.back();
    return;
  }

  // 1) 먼저 CompletePage로 즉시 이동
  router.replace({
    path: '/payment/completepage',
    query: {
      impUid: rsp.imp_uid,
      amount: currentFinalAmount.value,
      productName: productName.value,
      roomName: bookingData.value.roomName,
      checkIn: bookingData.value.checkIn,
      checkOut: bookingData.value.checkOut,
      name: bookingData.value.name
    }
  });

  // 2) 거래 저장은 백그라운드로 시도(실패해도 UI 방해 X)
  try {
    const payload = new URLSearchParams();
    payload.append('imp_uid', rsp.imp_uid);
    payload.append('merchant_uid', rsp.merchant_uid);
    payload.append('amount', String(currentFinalAmount.value));
    payload.append('cardId', String(selectedCard.value.cardId ?? selectedCard.value.id));
    payload.append('storeName', bookingData.value.roomName || productName.value);
    if (bookingData.value.bookingId != null) {      // ✅ 있을 때만 보냄
      payload.append('bookingId', String(bookingData.value.bookingId));
    };

    await axiosInstance.post('/payment/complete', {
      imp_uid: rsp.imp_uid,
      merchant_uid: rsp.merchant_uid,
      amount: Number(currentFinalAmount.value || 0),
      storeName: bookingData.value.roomName || productName.value,
      cardId: selectedCard.value?.cardId ?? selectedCard.value?.id,
      bookingId: bookingData.value.bookingId ?? null
    },{
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
  }
};

// 인덱스 변경 감지
watch(activeCardIndex, () => {
  nextTick(() => {});
});

// 마운트
onMounted(async () => {
  if (!route.query.originalPrice || route.query.originalPrice === '0') {
    alert('결제 정보가 올바르지 않습니다. 다시 시도해주세요.');
    router.back();
    return;
  }

  await fetchUserCards();

  if (!window.IMP) {
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
    script.onload = () => {};
    script.onerror = () => {
      alert('결제 모듈 로드에 실패했습니다. 인터넷 연결을 확인해주세요.');
    };
    document.head.appendChild(script);
  }
});
</script>





<style scoped>
.payment-card-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-header {
  background-color: #f8f9fa;
  border: none;
  padding: 8px 16px;
}

.payment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px 16px;
}

.payment-info-section {
  text-align: left;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.payment-price {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0;
  /* 가격 변화 애니메이션 */
  transition: all 0.3s ease;
}

.discount-benefit-card {
  background-color: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  /* 할인 정보 변화 애니메이션 */
  transition: all 0.3s ease;
}

.discount-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.discount-amount {
  font-size: 14px;
  font-weight: 600;
  color: #ffcd39;
  /* 할인 금액 변화 애니메이션 */
  transition: all 0.3s ease;
}

.discount-amount.text-success {
  color: #28a745 !important;
}

.price-change-notice {
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin-top: 8px;
}

.card-slider-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 380px;
}

.card-swiper-container {
  width: 100%;
  overflow: hidden;
}

.swiper-container {
  width: 100%;
  overflow: visible;
  padding: 8px 0;
}

.card-swiper {
  width: 100%;
  overflow: visible;
  padding: 0px 0 15px 0;
}

.swiper-slide-custom {
  width: 220px !important;
  flex-shrink: 0;
}

.card-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-card {
  width: 220px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.payment-card.active {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  z-index: 10;
}

.payment-card.inactive {
  transform: scale(0.9);
  opacity: 0.7;
}

.payment-card.benefit-card {
  border: 2px solid #ffcd39;
}

.payment-card.benefit-card.active {
  border: 2px solid #ff6600;
  box-shadow: 0 8px 20px rgba(255, 153, 0, 0.3);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.benefit-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff9500, #ffcd39);
  color: white;
  padding: 5px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(255, 149, 0, 0.4);
}

.benefit-badge i {
  font-size: 9px;
}

.card-benefit-notice {
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 혜택 안내 변화 애니메이션 */
  transition: all 0.3s ease;
}

.benefit-text {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  /* 텍스트 변화 애니메이션 */
  transition: all 0.3s ease;
}

.benefit-text.benefit-active {
  color: #ffcd39;
  font-weight: 600;
}

.payment-submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #ffcd39;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 8px rgba(255, 213, 89, 0.3);
}

.payment-submit-btn:hover:not(:disabled) {
  background-color: #ffcd39;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 213, 89, 0.4);
}

.payment-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background-color: #d6d8db !important;
  color: #6c757d !important;
  box-shadow: none !important;
}

.payment-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.spinner-border-sm {
  width: 0.8rem;
  height: 0.8rem;
}

.no-cards-message {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* Swiper 커스텀 스타일 */
:deep(.swiper-wrapper) {
  align-items: center;
}

:deep(.swiper-slide) {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

:deep(.swiper-slide:not(.swiper-slide-active)) {
  opacity: 0.8;
}
</style>