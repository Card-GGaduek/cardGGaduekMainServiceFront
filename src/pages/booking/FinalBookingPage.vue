<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 1. URL 쿼리 파라미터에서 기본 예약 정보 가져오기
const roomId = ref(route.query.roomId);
const roomName = ref(route.query.roomName);
const checkIn = ref(route.query.checkIn);
const checkOut = ref(route.query.checkOut);

// 2. 폼 입력을 위한 ref 변수들 (v-model과 연결)
const guestName = ref('');
const guestPhone = ref('');
const guestEmail = ref('');
const requestText = ref('');
const selectedCouponId = ref(null);
const selectedCardId = ref(null);

// 3. 서버에서 받아온 데이터를 저장할 ref 변수들
const priceDetails = ref(null);    // 계산된 가격 정보
const userCards = ref([]);         // 사용자가 보유한 카드 목록
const userCoupons = ref([]);       // 사용자가 보유한 쿠폰 목록
const isLoadingPrice = ref(true);  // 가격 계산 로딩 상태

// 4. 서버에 가격 계산을 요청하는 함수
async function fetchPrice() {
  isLoadingPrice.value = true;
  try {
    const response = await axios.post('/api/booking/price', {
      roomId: roomId.value,
      checkInDate: checkIn.value,
      checkOutDate: checkOut.value,
      couponProductId: selectedCouponId.value,
      cardId: selectedCardId.value,
      memberId: 1, // 실제로는 로그인 정보에서 가져와야 함
    });
    priceDetails.value = response.data.data || response.data;
  } catch (error) {
    console.error("가격 계산 실패:", error);
    alert("금액을 불러오는 데 실패했습니다.");
  } finally {
    isLoadingPrice.value = false;
  }
}

// 5. '결제하기' 버튼 클릭 시 최종 예약 요청을 보내는 함수
async function submitBooking() {
  if (!guestName.value || !guestPhone.value) {
    alert('예약자 정보를 모두 입력해주세요.');
    return;
  }

  const bookingData = {
    roomId: roomId.value,
    checkInDate: checkIn.value,
    checkOutDate: checkOut.value,
    guestName: guestName.value,
    guestPhone: guestPhone.value,
    requestText: requestText.value,
    couponProductId: selectedCouponId.value,
    cardId: selectedCardId.value,
    memberId: 1, // 실제로는 로그인 정보에서 가져와야 함
  };

  try {
    const response = await axios.post('/api/booking', bookingData);
    const newBookingId = response.data;
    alert(`예약이 성공적으로 완료되었습니다. (예약 ID: ${newBookingId})`);
    router.push('/'); // 성공 시 홈으로 이동
  } catch (error) {
    console.error('예약 실패:', error);
    alert(error.response?.data?.message || '예약 처리 중 오류가 발생했습니다.');
  }
}

// 6. 카드나 쿠폰 선택이 변경될 때마다 가격 다시 계산
watch([selectedCouponId, selectedCardId], fetchPrice);

// 7. 페이지가 로드될 때 필요한 모든 데이터(가격, 보유카드/쿠폰) 초기 로드
async function fetchUserCards() {
  try {
    const response = await axios.get('/api/my/cards');
    userCards.value = response.data;
  } catch (error) {
    console.error("보유 카드 목록 조회 실패:", error);
  }
}

// 💡 2. 보유 쿠폰 목록을 가져오는 함수 추가
async function fetchUserCoupons() {
  try {
    const response = await axios.get('/api/member/coupons?memberId=3');
    userCoupons.value = response.data;
  } catch (error) {
    console.error("보유 쿠폰 목록 조회 실패:", error);
  }
}

// 💡 3. onMounted에서 더미 데이터를 삭제하고, API 호출 함수들을 실행
onMounted(() => {
  // 여러 API를 동시에 호출하여 페이지 로딩 속도를 높입니다.
  Promise.all([
    fetchPrice(),
    fetchUserCards(),
    fetchUserCoupons()
  ]);
});
</script>

<template>
  <div class="booking-confirm-page">
    <div class="container page-container p-0">
      <header class="top-header d-flex align-items-center p-3">
        <button @click="router.back()" class="btn border-0 p-0 text-dark"><i class="bi bi-arrow-left fs-4"></i></button>
        <h5 class="fw-bold m-0 flex-grow-1 text-center">예약하기</h5>
      </header>

      <main class="scrollable-content p-3">
        <section class="card summary-card mb-4">
          <div class="card-body">
            <h5 class="card-title fw-bold">{{ roomName }}</h5>
            <p class="card-text text-muted"><span class="fw-bold">일정</span> {{ checkIn }} ~ {{ checkOut }}</p>
          </div>
        </section>

        <h5 class="fw-bold mb-3"><i class="bi bi-person-fill me-2"></i>예약자 정보</h5>
        <section class="card info-card mb-4">
          <div class="card-body">
            <div class="mb-3">
              <label for="guestName" class="form-label">이름</label>
              <input type="text" class="form-control" id="guestName" placeholder="ex. 홍길동" v-model="guestName">
            </div>
            <div class="mb-3">
              <label for="guestPhone" class="form-label">전화번호</label>
              <input type="tel" class="form-control" id="guestPhone" placeholder="ex. 010-1234-5678" v-model="guestPhone">
            </div>
            <div class="mb-3">
              <label for="guestEmail" class="form-label">이메일</label>
              <input type="email" class="form-control" id="guestEmail" placeholder="ex. example@example.com" v-model="guestEmail">
            </div>
            <div>
              <label for="requestText" class="form-label">요청사항</label>
              <textarea class="form-control" id="requestText" rows="4" placeholder="업체에 요청하실 내용을 적어주세요." v-model="requestText"></textarea>
              <div class="form-text text-end">{{ requestText.length }} / 500</div>
            </div>
          </div>
        </section>

        <section class="payment-summary">
          <select class="form-select mb-2" v-model="selectedCouponId">
            <option :value="null">쿠폰을 선택하세요</option>
            <option v-for="coupon in userCoupons" :key="coupon.id" :value="coupon.id">{{ coupon.name }}</option>
          </select>

          <select class="form-select mb-4" v-model="selectedCardId">
            <option :value="null">결제할 카드를 선택하세요</option>
            <option v-for="card in userCards" :key="card.id" :value="card.id">{{ card.name }}</option>
          </select>

          <hr>
          
          <div v-if="isLoadingPrice" class="text-center my-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="priceDetails">
            <div class="d-flex justify-content-between text-muted mb-2">
              <span>상품 금액</span>
              <span>{{ priceDetails.originalPrice.toLocaleString() }}원</span>
            </div>
            <div class="d-flex justify-content-between text-muted mb-2">
              <span>쿠폰 할인</span>
              <span>- {{ priceDetails.couponDiscountAmount.toLocaleString() }}원</span>
            </div>
            <div class="d-flex justify-content-between text-muted mb-3">
              <span>카드 할인</span>
              <span>- {{ priceDetails.cardDiscountAmount.toLocaleString() }}원</span>
            </div>
            <div class="d-flex justify-content-between align-items-center my-3">
              <span class="fw-bold">결제금액</span>
              <span class="fw-bold fs-4 text-warning">{{ priceDetails.finalPrice.toLocaleString() }}원</span>
            </div>
          </div>
          
          <button @click="submitBooking" class="btn btn-warning w-100 p-3 fw-bold">결제하고 예약 완료하기</button>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.booking-confirm-page {
  background-color: #f8f9fa;
}
.page-container {
  max-width: 420px;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
}
.top-header {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 10;
  border-bottom: 1px solid #eee;
}
.top-header .bi-arrow-left {
  position: absolute;
}

.card {
  border: none;
  border-radius: 12px;
}
.form-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #6c757d;
}
.form-control, .form-select {
  border: 1px solid #dee2e6;
  background-color: #fff;
}
.btn-warning {
  background-color: #ffc107;
  border: none;
  font-size: 1.1rem;
}
.text-warning {
  color: #ff9900 !important;
}
</style>