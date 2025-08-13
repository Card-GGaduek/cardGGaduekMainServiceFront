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

// 디버깅을 위한 콘솔 로그
console.log('Route query params:', route.query);
console.log('Parsed booking data:', bookingData.value);

// 결제 관련 데이터
const productName = computed(() => bookingData.value.roomName || '숙박 상품');
const originalPrice = computed(() => bookingData.value.originalPrice);
const couponDiscountAmount = computed(() => bookingData.value.couponDiscountAmount);

// 현재 선택된 카드의 할인 금액 계산 (실시간으로 변경)
const currentCardDiscount = computed(() => {
  const selected = selectedCard.value;
  if (!selected) return 0;

  const isSelectedCard = selected.name === bookingData.value.selectedCardName ||
      selected.cardId == bookingData.value.selectedCardId ||
      selected.id == bookingData.value.selectedCardId;

  if (isSelectedCard) {
    return bookingData.value.cardDiscountAmount || bookingData.value.confirmedCardDiscount || 0;
  }

  return 0;
});

// 현재 최종 결제 금액 계산 (실시간으로 변경)
const currentFinalAmount = computed(() => {
  const original = originalPrice.value;
  const couponDiscount = couponDiscountAmount.value;
  const cardDiscount = currentCardDiscount.value;

  console.log('Computing final amount:');
  console.log('- Original price:', original);
  console.log('- Coupon discount:', couponDiscount);
  console.log('- Card discount:', cardDiscount);

  const baseAmount = original - couponDiscount - cardDiscount;
  const finalAmount = Math.max(baseAmount, 0);

  console.log('- Final amount:', finalAmount);
  return finalAmount;
});

// 할인 정보 표시 여부
const hasAnyDiscount = computed(() => {
  return couponDiscountAmount.value > 0 || currentCardDiscount.value > 0;
});

const showPriceChangeNotice = computed(() => {
  return userCards.value.some(card => isSelectedCardFromBooking(card)) && userCards.value.length > 1;
});

// 계산된 속성
const selectedCard = computed(() => {
  return userCards.value[activeCardIndex.value] || null;
});

// 결제 가능 여부
const canPayment = computed(() => {
  return selectedCard.value &&
      userCards.value.length > 0 &&
      !isProcessing.value &&
      currentFinalAmount.value > 0;
});

// 카드가 예약 페이지에서 선택한 카드인지 확인하는 함수
const isSelectedCardFromBooking = (card) => {
  if (!card || !bookingData.value.selectedCardId) return false;

  // 이름 비교용 - 카드 객체에 name이 없다면 cardProductName 사용
  const cardName = card.name || card.cardProductName;
  const selectedName = bookingData.value.selectedCardName;

  const nameMatch = cardName === selectedName;

  const cardIdStr = (card.cardId ?? card.id)?.toString();
  const selectedCardIdStr = bookingData.value.selectedCardId?.toString();
  const idMatch = cardIdStr === selectedCardIdStr;

  console.log('Checking if card is from booking:');
  console.log('- Card name:', cardName);
  console.log('- Selected card name:', selectedName);
  console.log('- Name match:', nameMatch);
  console.log('- ID match:', idMatch);

  return nameMatch || idMatch;
};

// 함수들
const fetchUserCards = async () => {
  try {
    const result = await memberApi.getMyCard();
    userCards.value = result;
    console.log('로드된 카드 데이터:', userCards.value);

    // 예약 페이지에서 선택한 카드를 기본 선택으로 설정
    const selectedCardIndex = userCards.value.findIndex(card =>
        card.name === bookingData.value.selectedCardName ||
        card.cardId === bookingData.value.selectedCardId ||
        card.id === bookingData.value.selectedCardId
    );

    if (selectedCardIndex !== -1) {
      activeCardIndex.value = selectedCardIndex;
      console.log('Found and selected booking card at index:', selectedCardIndex);
    } else {
      activeCardIndex.value = 0;
      console.log('Booking card not found, selecting first card');
    }
  } catch (error) {
    console.error("카드 목록 조회 실패:", error);
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
  const newIndex = swiper.activeIndex;
  console.log('Slide changed to index:', newIndex);

  // activeCardIndex를 먼저 업데이트
  activeCardIndex.value = newIndex;

  // Vue의 nextTick을 사용하여 계산된 속성이 업데이트된 후 로깅
  nextTick(() => {
    console.log('Active card index:', activeCardIndex.value);
    console.log('Selected card:', selectedCard.value);
    console.log('Current card discount:', currentCardDiscount.value);
    console.log('Current final amount:', currentFinalAmount.value);
  });
};

// 이미지 로딩 에러 처리
const handleImageError = (event) => {
  console.error('카드 이미지 로드 실패:', event.target.src);
  event.target.src = '/default-card-image.png';
};

// 결제 요청
const requestPayment = () => {
  if (!selectedCard.value) {
    alert('결제할 카드를 선택해주세요.');
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

  // 아임포트 가맹점 식별코드 초기화
  IMP.init("imp47740267");

  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  const merchantUid = "order_" + new Date().getTime();

  // 결제 요청 데이터 - 현재 최종 금액으로 결제
  const paymentData = {
    pg: "uplus", // 토스페이먼츠
    pay_method: "card",
    merchant_uid: merchantUid,
    name: productName.value,
    amount: currentFinalAmount.value, // 동적으로 계산된 금액 사용
    buyer_email: bookingData.value.email || "test@example.com",
    buyer_name: bookingData.value.name || "고객",
    buyer_tel: bookingData.value.phone || "010-1234-5678",
    buyer_addr: "서울시 강남구",
    buyer_postcode: "12345"
  };

  // 모바일인 경우 리다이렉트 URL 추가
  if (isMobile) {
    paymentData.m_redirect_url = `${window.location.origin}/payment/complete`;
  }

  IMP.request_pay(paymentData, async function (rsp) {
    isProcessing.value = false;

    if (!isMobile) {
      await handlePaymentResult(rsp, merchantUid);
    }
  });
};

// 결제 결과 처리 (예약 처리 제거, 결제 검증만)
const handlePaymentResult = async (rsp, merchantUid) => {
  if (rsp.success) {
    try {
      // 백엔드에 결제 검증 요청
      const response = await fetch("http://localhost:8080/payment/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: new URLSearchParams({
          imp_uid: rsp.imp_uid,
          merchant_uid: rsp.merchant_uid,
          amount: currentFinalAmount.value,
          category: 'ACCOMMODATION',
          memberId: 7,
          cardId: selectedCard.value.cardId,
          storeName: bookingData.value.roomName || productName.value
        })
      });

      // 응답 Content-Type 점검
      const ct = response.headers.get('content-type') || '';
      const isJson = ct.includes('application/json');

      // 상태코드/본문 로깅
      if (!response.ok) {
        const raw = isJson ? await response.json().catch(() => ({})) : await response.text();
        console.error("[payment/complete] HTTP", response.status, raw);

        if (response.status === 401 || response.status === 403) {
          alert("인증 또는 권한 문제로 결제 검증이 거부됐습니다. 로그인 상태와 CORS/CSRF 설정을 확인해주세요.");
        } else if (response.status === 415) {
          alert("서버가 전송한 Content-Type을 지원하지 않습니다. (415) 백엔드 consumes/produces 확인 필요");
        } else {
          alert("서버 오류로 결제 검증에 실패했습니다. (" + response.status + ")");
        }
        return;
      }

      // JSON 아니면 원문 확인
      if (!isJson) {
        const raw = await response.text();
        console.error("[payment/complete] Non-JSON response:", raw);
        alert("결제 검증 응답이 JSON이 아닙니다. 백엔드에서 JSON을 반환하도록 설정해주세요.");
        return;
      }

      const result = await response.json();

      if (result.success) {
        // 결제 성공 - CompletePage로 이동 (알림창 제거)
        router.push({
          path: '/payment/completepage',
          query: {
            impUid: rsp.imp_uid,
            amount: currentFinalAmount.value,
            productName: productName.value,
            roomName: bookingData.value.roomName,
            // 필요한 다른 예약 정보들도 전달 가능
            checkIn: bookingData.value.checkIn,
            checkOut: bookingData.value.checkOut,
            name: bookingData.value.name
          }
        });
      } else {
        alert("⚠️ 결제는 되었지만 거래 저장에 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error('결제 검증 실패:', error);
      alert("❌ 결제 검증 중 오류가 발생했습니다. 고객센터로 문의해주세요.");
    }
  } else {
    alert("❌ 결제 실패: " + rsp.error_msg);
    router.back();
  }
};

// activeCardIndex 변경을 감지하여 가격 업데이트 강제 실행
watch(activeCardIndex, (newIndex, oldIndex) => {
  console.log(`Card index changed from ${oldIndex} to ${newIndex}`);

  nextTick(() => {
    const card = userCards.value[newIndex];
    console.log('Watched card change:');
    console.log('- New card:', card?.name);
    console.log('- Has benefit:', card ? isSelectedCardFromBooking(card) : false);
    console.log('- Current discount:', currentCardDiscount.value);
    console.log('- Current final amount:', currentFinalAmount.value);
  });
});

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  console.log('Payment page mounted');
  console.log('Route query params:', route.query);

  // URL 파라미터가 제대로 전달되었는지 확인
  if (!route.query.originalPrice || route.query.originalPrice === '0') {
    console.warn('가격 정보가 전달되지 않았습니다:', route.query);
    alert('결제 정보가 올바르지 않습니다. 다시 시도해주세요.');
    router.back();
    return;
  }

  await fetchUserCards();

  // 아임포트 스크립트 로드 확인
  if (!window.IMP) {
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
    script.onload = () => {
      console.log('아임포트 스크립트가 로드되었습니다.');
    };
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