<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
// 실제 프로젝트의 설정된 axios 인스턴스를 가져옵니다.
// import api from '@/utils/api';

// api 객체가 없으므로, 임시로 axios를 사용합니다.
// 실제 환경에서는 위의 api import를 사용하세요.
import api from "@/api/index.js";

const route = useRoute();
const router = useRouter();

// --- 상태 관리 ---
const roomId = ref(route.query.roomId);
const roomName = ref(route.query.roomName);
const checkIn = ref(route.query.checkIn);
const checkOut = ref(route.query.checkOut);

const guestName = ref("");
const guestPhone = ref("");
const emailId = ref("");
const emailDomain = ref("");
const requestText = ref("");
const numberOfGuests = ref(1);
const selectedCouponId = ref(null);
const selectedCardId = ref(null);

const priceDetails = ref(null);
const userCards = ref([]);
const userCoupons = ref([]);
const isLoading = ref(true); // 전체 로딩 상태로 통합

const errors = ref({
  guestName: "",
  guestPhone: "",
  guestEmail: "",
});

const guestEmail = computed(() => {
  if (emailId.value && emailDomain.value) {
    return `${emailId.value}@${emailDomain.value}`;
  }
  return "";
});

// --- 함수 ---
function validateForm() {
  errors.value = { guestName: "", guestPhone: "", guestEmail: "" };
  let isValid = true;

  if (!guestName.value) {
    errors.value.guestName = "이름을 입력해주세요.";
    isValid = false;
  }

  const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
  if (!guestPhone.value) {
    errors.value.guestPhone = "전화번호를 입력해주세요.";
    isValid = false;
  } else if (!phoneRegex.test(guestPhone.value)) {
    errors.value.guestPhone =
        "올바른 전화번호 형식 (010-1234-5678) 이 아닙니다.";
    isValid = false;
  }

  if (!guestEmail.value) {
    errors.value.guestEmail = "이메일을 입력해주세요.";
    isValid = false;
  }

  return isValid;
}

/**
 * [중요] 예약 생성 API 호출
 * 데이터 생성(예약)은 GET이 아닌 POST 방식을 사용하는 것이 웹 표준(REST)에 맞습니다.
 * GET은 데이터를 조회할 때 사용되며, 서버의 상태를 변경하지 않아야 합니다. (멱등성, 안전성)
 * 현재 요청에 따라 GET으로 구현했지만, 실제 프로덕션에서는 POST 사용을 강력히 권장합니다.
 * 백엔드에서도 @GetMapping이 아닌 @PostMapping으로 받아야 합니다.
 */
/**
 * 예약 생성 API 호출
 * POST 방식으로 예약 데이터를 요청 본문(body)에 담아 전달합니다.
 */
async function submitBooking() {
  if (!validateForm()) {
    const firstError = Object.values(errors.value).find((e) => e);
    if (firstError) {
      alert(firstError);
    }
    return;
  }

  // [수정] POST 요청으로 보낼 데이터 객체
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
  };

  try {
    // [수정] .get({ params: ... }) -> .post(데이터) 로 변경
    const response = await api.post("api/booking", bookingData);

    const newBookingId = response.data.data || response.data;

    // [수정] 예약 성공 시 결제 페이지로 이동하도록 변경
    // 예약 정보와 결제 정보를 query parameter로 전달
    router.push({
      path: '/payment',
      query: {
        bookingId: newBookingId,
        roomId: roomId.value,
        roomName: roomName.value,
        checkIn: checkIn.value,
        checkOut: checkOut.value,
        name: guestName.value,
        phone: guestPhone.value,
        email: guestEmail.value,
        requestText: requestText.value,
        numberOfGuests: numberOfGuests.value,
        couponProductId: selectedCouponId.value,
        // 가격 정보 전달
        originalPrice: priceDetails.value?.originalPrice || 0,
        finalPrice: priceDetails.value?.finalPrice || 0,
        couponDiscountAmount: priceDetails.value?.couponDiscountAmount || 0,
        cardDiscountAmount: priceDetails.value?.cardDiscountAmount || 0,
        // 선택된 카드 정보
        cardId: selectedCardId.value,
        // 선택된 카드 정보와 확정된 할인 금액
        selectedCardName: selectedCardId.value ? userCards.value.find(card => card.id === selectedCardId.value)?.name : null,
        selectedCardId: selectedCardId.value,
        // 확정된 할인 금액 - 이미 계산된 값을 그대로 전달
        confirmedCardDiscount: priceDetails.value?.cardDiscountAmount || 0
      }
    });

  } catch (error) {
    console.error("예약 실패:", error);
    alert(error.response?.data?.message || "예약 처리 중 오류가 발생했습니다.");
  }
}

/**
 * 가격 정보 조회 API 호출
 * GET 요청으로 변경하고, 데이터를 query parameter로 전달합니다.
 */
async function fetchPrice() {
  isLoading.value = true;
  try {
    // POST 요청에 맞는 데이터 객체
    const priceData = {
      roomId: roomId.value,
      checkInDate: checkIn.value,
      checkOutDate: checkOut.value,
      couponProductId: selectedCouponId.value,
      cardId: selectedCardId.value,
    };
    const response = await api.post("api/booking/price", priceData);
    priceDetails.value = response.data.data || response.data;
  } catch (error) {
    console.error("가격 계산 실패:", error);
    priceDetails.value = null; // 실패 시 가격 정보 초기화
  } finally {
    isLoading.value = false;
  }
}

// [추가] 사용자 보유 카드 목록 조회
async function fetchUserCards() {
  try {
    // memberId 등 식별자를 파라미터로 넘길 수 있습니다.
    const response = await api.get("api/card");
    userCards.value = response.data.data || response.data;
  } catch (e) {
    console.error("카드 목록 조회 실패", e);
    // API 실패 시 목업 데이터 제공
  }
}

// [추가] 사용자 보유 쿠폰 목록 조회
async function fetchUserCoupons() {
  try {
    const response = await api.get("api/member/coupons");

    // 서버로부터 받은 원본 데이터 배열을 먼저 변수에 담습니다.
    const travelCoupons = response.data.data.memberCoupons.filter(coupon => coupon.couponCategory === 'TRAVEL');
    userCoupons.value = travelCoupons;
    console.log("1. [원본 데이터] 서버에서 받은 모습:", userCoupons.value);
  } catch (e) {
    console.error("쿠폰 목록 조회 실패", e);
  }
}

watch(guestPhone, (newVal) => {
  // 숫자만 남기고, 형식에 맞게 하이픈(-) 추가
  const cleaned = newVal.replace(/\D/g, "");
  let formatted = "";
  if (cleaned.length <= 3) {
    formatted = cleaned;
  } else if (cleaned.length <= 7) {
    formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(
        7,
        11
    )}`;
  }
  guestPhone.value = formatted;
});

// 쿠폰이나 카드가 변경될 때마다 가격을 다시 계산합니다.
watch([selectedCouponId, selectedCardId], fetchPrice);

onMounted(async () => {
  isLoading.value = true;
  // 카드, 쿠폰, 가격 정보를 병렬로 동시에 가져옵니다.
  await Promise.all([fetchUserCards(), fetchUserCoupons(), fetchPrice()]);
  isLoading.value = false;
});

function decreaseGuests() {
  if (numberOfGuests.value > 1) numberOfGuests.value--;
}
function increaseGuests() {
  if (numberOfGuests.value < 4) numberOfGuests.value++;
}
</script>

<template>
  <div class="booking-confirm-page">
    <div class="container page-container p-0">
      <header class="top-header d-flex align-items-center p-3">
        <button @click="router.back()" class="btn border-0 p-0 text-dark">
          <i class="bi bi-arrow-left fs-4"></i>
        </button>
        <h5 class="fw-bold m-0 flex-grow-1 text-center">예약하기</h5>
      </header>

      <main class="scrollable-content p-3">
        <section class="card summary-card mb-4">
          <div class="card-body">
            <h5 class="card-title fw-bold">{{ roomName }}</h5>
            <p class="card-text text-muted">
              <span class="fw-bold">일정</span> {{ checkIn }} ~ {{ checkOut }}
            </p>
          </div>
        </section>

        <h5 class="fw-bold mb-3">
          <i class="bi bi-person-fill me-2"></i>예약자 정보
        </h5>
        <section class="card info-card mb-4">
          <div class="card-body">
            <div class="mb-3">
              <label for="guestName" class="form-label">이름</label>
              <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.guestName }"
                  id="guestName"
                  placeholder="ex. 홍길동"
                  v-model="guestName"
              />
              <div v-if="errors.guestName" class="invalid-feedback">
                {{ errors.guestName }}
              </div>
            </div>
            <div class="mb-3">
              <label for="guestPhone" class="form-label">전화번호</label>
              <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.guestPhone }"
                  id="guestPhone"
                  placeholder="010-1234-5678"
                  v-model="guestPhone"
                  maxlength="13"
              />
              <div v-if="errors.guestPhone" class="invalid-feedback">
                {{ errors.guestPhone }}
              </div>
            </div>
            <div class="mb-3">
              <label for="numberOfGuests" class="form-label">인원</label>
              <div class="input-group">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="decreaseGuests"
                >
                  -
                </button>
                <input
                    type="text"
                    class="form-control text-center"
                    :value="`${numberOfGuests}명`"
                    readonly
                />
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="increaseGuests"
                >
                  +
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label for="guestEmail" class="form-label">이메일</label>
              <div
                  class="input-group"
                  :class="{ 'is-invalid': errors.guestEmail }"
              >
                <input
                    type="text"
                    class="form-control"
                    id="guestEmail"
                    placeholder="email"
                    v-model="emailId"
                />
                <span class="input-group-text">@</span>
                <select class="form-select" v-model="emailDomain">
                  <option value="" disabled>도메인 선택</option>
                  <option value="naver.com">naver.com</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="daum.net">daum.net</option>
                </select>
              </div>
              <div v-if="errors.guestEmail" class="invalid-feedback d-block">
                {{ errors.guestEmail }}
              </div>
            </div>
            <div>
              <label for="requestText" class="form-label">요청사항</label>
              <textarea
                  class="form-control"
                  id="requestText"
                  rows="4"
                  placeholder="업체에 요청하실 내용을 적어주세요."
                  v-model="requestText"
              ></textarea>
            </div>
          </div>
        </section>

        <section class="payment-summary">
          <select class="form-select mb-2" v-model="selectedCouponId">
            <option :value="null">쿠폰을 선택하세요</option>
            <option
                v-for="coupon in userCoupons"
                :key="coupon.id"
                :value="coupon.id"
            >
              {{ coupon.couponName }}
            </option>
          </select>
          <select class="form-select mb-4" v-model="selectedCardId">
            <option :value="null">결제할 카드를 선택하세요</option>
            <option v-for="card in userCards" :key="card.id" :value="card.id">
              {{ card.name }}
            </option>
          </select>
          <hr />

          <div v-if="isLoading" class="text-center my-3">
            <div class="spinner-border spinner-border-sm" role="status"></div>
          </div>
          <div v-else-if="priceDetails">
            <div class="d-flex justify-content-between text-muted mb-2">
              <span>상품 금액</span>
              <span>{{ priceDetails.originalPrice.toLocaleString() }}원</span>
            </div>
            <div class="d-flex justify-content-between text-muted mb-2">
              <span>쿠폰 할인</span>
              <span
              >-
                {{ priceDetails.couponDiscountAmount.toLocaleString() }}원</span
              >
            </div>
            <div class="d-flex justify-content-between text-muted mb-3">
              <span>카드 할인</span>
              <span
              >-
                {{ priceDetails.cardDiscountAmount.toLocaleString() }}원</span
              >
            </div>
            <div class="d-flex justify-content-between align-items-center my-3">
              <span class="fw-bold">결제금액</span>
              <span class="fw-bold fs-4 text-warning"
              >{{ priceDetails.finalPrice.toLocaleString() }}원</span
              >
            </div>
          </div>

          <button
              @click="submitBooking"
              class="btn btn-warning w-100 p-3 fw-bold"
          >
            결제하고 예약 완료하기
          </button>
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
.form-control,
.form-select {
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
.invalid-feedback {
  font-size: 0.8rem;
}
</style>