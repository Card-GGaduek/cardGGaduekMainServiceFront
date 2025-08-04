<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// --- 상태 관리 ---
const roomId = ref(route.query.roomId);
const roomName = ref(route.query.roomName);
const checkIn = ref(route.query.checkIn);
const checkOut = ref(route.query.checkOut);

const guestName = ref('');
const guestPhone = ref('');
const emailId = ref('');
const emailDomain = ref('');
const requestText = ref('');
const numberOfGuests = ref(1);
const selectedCouponId = ref(null);
const selectedCardId = ref(null);

const priceDetails = ref(null);
const userCards = ref([]);
const userCoupons = ref([]);
const isLoadingPrice = ref(true);

const errors = ref({
  guestName: '',
  guestPhone: '',
  guestEmail: ''
});

const guestEmail = computed(() => {
  if (emailId.value && emailDomain.value) {
    return `${emailId.value}@${emailDomain.value}`;
  }
  return '';
});

// --- 함수 ---
function validateForm() {
  errors.value = { guestName: '', guestPhone: '', guestEmail: '' };
  let isValid = true;

  if (!guestName.value) {
    errors.value.guestName = '이름을 입력해주세요.';
    isValid = false;
  }

  const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
  if (!guestPhone.value) {
    errors.value.guestPhone = '전화번호를 입력해주세요.';
    isValid = false;
  } else if (!phoneRegex.test(guestPhone.value)) {
    errors.value.guestPhone = '올바른 전화번호 형식 (010-1234-5678) 이 아닙니다.';
    isValid = false;
  }

  if (!guestEmail.value) {
    errors.value.guestEmail = '이메일을 입력해주세요.';
    isValid = false;
  }

  return isValid;
}

async function submitBooking() {
  if (!validateForm()) {
    const firstError = Object.values(errors.value).find(e => e);
    if (firstError) {
      alert(firstError);
    }
    return;
  }

  const bookingData = {
    roomId: roomId.value,
    checkInDate: checkIn.value,
    checkOutDate: checkOut.value,
    name: guestName.value,
    phone: guestPhone.value,
    email: guestEmail.value,
    requestText: requestText.value,
    numberOfGuests: numberOfGuests.value,
    couponProductId: selectedCouponId.value,
    cardId: selectedCardId.value,
    memberId: 1, // 실제로는 로그인 정보에서 가져와야 함
  };

  try {
    const response = await axios.post('/api/bookings', bookingData);
    const newBookingId = response.data;
    alert(`예약이 성공적으로 완료되었습니다. (예약 ID: ${newBookingId})`);
    router.push('/');
  } catch (error) {
    console.error('예약 실패:', error);
    alert(error.response?.data?.message || '예약 처리 중 오류가 발생했습니다.');
  }
}

async function fetchPrice() {
  isLoadingPrice.value = true;
  try {
    const response = await axios.post('/api/bookings/price', {
      roomId: roomId.value,
      checkInDate: checkIn.value,
      checkOutDate: checkOut.value,
      couponProductId: selectedCouponId.value,
      cardId: selectedCardId.value,
      memberId: 1,
    });
    priceDetails.value = response.data.data || response.data;
  } catch (error) {
    console.error("가격 계산 실패:", error);
  } finally {
    isLoadingPrice.value = false;
  }
}

watch(guestPhone, (newVal, oldVal) => {
  if (newVal.length < oldVal.length) return;
  guestPhone.value = newVal
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/, (match, p1, p2, p3) => {
      if (!p2) return p1;
      if (!p3) return `${p1}-${p2}`;
      return `${p1}-${p2}-${p3}`;
    });
});
watch([selectedCouponId, selectedCardId], fetchPrice);

onMounted(async () => {
  userCards.value = [{ id: 1, name: '나의 현대카드' }, { id: 7, name: '나의 신한카드' }];
  userCoupons.value = [{ id: 1, name: '10,000원 할인쿠폰' }, { id: 3, name: '5% 할인쿠폰' }];
  await fetchPrice();
});

function decreaseGuests() {
  if (numberOfGuests.value > 1) {
    numberOfGuests.value--;
  }
}
function increaseGuests() {
  if (numberOfGuests.value < 4) {
    numberOfGuests.value++;
  }
}
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
              <input type="text" class="form-control" :class="{ 'is-invalid': errors.guestName }" id="guestName" placeholder="ex. 홍길동" v-model="guestName">
              <div v-if="errors.guestName" class="invalid-feedback">{{ errors.guestName }}</div>
            </div>
            <div class="mb-3">
              <label for="guestPhone" class="form-label">전화번호</label>
              <input type="text" class="form-control" :class="{ 'is-invalid': errors.guestPhone }" id="guestPhone" placeholder="010-1234-5678" v-model="guestPhone" maxlength="13">
              <div v-if="errors.guestPhone" class="invalid-feedback">{{ errors.guestPhone }}</div>
            </div>
             <div class="mb-3">
              <label for="numberOfGuests" class="form-label">인원</label>
              <div class="input-group">
                <button class="btn btn-outline-secondary" type="button" @click="decreaseGuests">-</button>
                <input type="text" class="form-control text-center" :value="`${numberOfGuests}명`" readonly>
                <button class="btn btn-outline-secondary" type="button" @click="increaseGuests">+</button>
              </div>
            </div>
            <div class="mb-3">
              <label for="guestEmail" class="form-label">이메일</label>
              <div class="input-group" :class="{ 'is-invalid': errors.guestEmail }">
                <input type="text" class="form-control" id="guestEmail" placeholder="email" v-model="emailId">
                <span class="input-group-text">@</span>
                <select class="form-select" v-model="emailDomain">
                  <option value="" disabled>도메인 선택</option>
                  <option value="naver.com">naver.com</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="daum.net">daum.net</option>
                </select>
              </div>
              <div v-if="errors.guestEmail" class="invalid-feedback d-block">{{ errors.guestEmail }}</div>
            </div>
            <div>
              <label for="requestText" class="form-label">요청사항</label>
              <textarea class="form-control" id="requestText" rows="4" placeholder="업체에 요청하실 내용을 적어주세요." v-model="requestText"></textarea>
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
            <div class="spinner-border spinner-border-sm" role="status"></div>
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
.booking-confirm-page { background-color: #f8f9fa; }
.page-container { max-width: 420px; background-color: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; }
.scrollable-content { flex-grow: 1; overflow-y: auto; }
.top-header { position: sticky; top: 0; background-color: #fff; z-index: 10; border-bottom: 1px solid #eee; }
.top-header .bi-arrow-left { position: absolute; }
.card { border: none; border-radius: 12px; }
.form-label { font-weight: bold; font-size: 0.9rem; color: #6c757d; }
.form-control, .form-select { border: 1px solid #dee2e6; background-color: #fff; }
.btn-warning { background-color: #ffc107; border: none; font-size: 1.1rem; }
.text-warning { color: #ff9900 !important; }
.invalid-feedback { font-size: 0.8rem; }
</style>