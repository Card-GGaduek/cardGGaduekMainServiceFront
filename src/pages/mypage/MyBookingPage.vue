<script setup>
// 1. vue에서 computed는 이제 필요 없으므로 제거해도 됩니다.
import { ref, onMounted, reactive } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import memberApi from "@/api/memberApi";
import MainHeader from "@/layout/MainHeader.vue";

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  try {
    const result = await memberApi.getMyInfo();
    const bookingsFromApi = result.bookingList || [];

    myPageInfo.bookingList = bookingsFromApi.map((booking) => ({
      ...booking,
      isExpanded: false,
    }));
    myPageInfo.email = result.email;
    myPageInfo.name = result.name;
  } catch (e) {
    console.error("내 정보 조회 실패:", e.message);
    alert(e.message);
  }
});

const myPageInfo = reactive({
  name: "",
  email: "",
  bookingList: [],
});

const toggleDetails = (booking) => {
  booking.isExpanded = !booking.isExpanded;
};

// 2. 예약 상태 코드를 한글로 변환하는 함수를 추가합니다.
const getStatusText = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "예약 완료";
    case "PENDING":
      return "예약 대기";
    case "CANCELED":
      return "취소됨"; // 'CANCELED'일 경우 '취소됨'을 반환
    default:
      return status; // 그 외의 경우 원래 상태값을 그대로 표시
  }
};
</script>

<template>
  <div class="page-container">
    <!-- <div class="pt-4 logo-container">
      <img src="@/assets/logo/logo.jpg" alt="카드까득 로고" class="logo-img" />
    </div>
    <header class="page-header">
      <button @click="router.back()" class="back-button">&larr;</button>
      <h1 class="page-title">내 예약내역</h1>
      <div class="placeholder"></div>
    </header> -->
    <MainHeader/>
    <main class="content-area">
      <div
        v-if="myPageInfo.bookingList.length === 0 || myPageInfo.booking"
        class="empty-message"
      >
        <p>예약 내역이 없습니다.</p>
      </div>

      <div v-else>
        <div
          v-for="booking in myPageInfo.bookingList"
          :key="booking.id"
          class="booking-card"
        >
          <div class="summary-view">
            <img
              src="@/assets/accommodations/제목 없음 1.png"
              alt="예약 이미지"
              class="thumbnail-image"
            />
            <div class="info-area">
              <div
                class="booking-title d-flex justify-content-between align-items-center"
              >
                <span>{{ booking.accommodationName }}</span>

                <span class="booking-status">{{
                  getStatusText(booking.status)
                }}
                </span>
              </div>
              <a @click.prevent="toggleDetails(booking)" class="details-link">
                {{
                  booking.isExpanded ? "상세정보 닫기" : "예약정보 보기"
                }}
                &rsaquo;
              </a>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="booking.isExpanded" class="details-view">
              <ul>
                <li>
                  <strong>예약 상태:</strong>
                  {{ getStatusText(booking.status) }}
                </li>
                <li><strong>이름:</strong> {{ booking.name }}</li>
                <li><strong>핸드폰:</strong> {{ booking.phone }}</li>
                <li><strong>이메일:</strong> {{ booking.email }}</li>
                <li><strong>체크인:</strong> {{ booking.checkInDate }}</li>
                <li><strong>체크아웃:</strong> {{ booking.checkOutDate }}</li>
                <li>
                  <strong>숙소 이름:</strong> {{ booking.accommodationName }}
                </li>
                <li><strong>방 이름:</strong> {{ booking.roomName }}</li>
                <li><strong>결제 금액:</strong> {{ booking.totalPrice }}원</li>
                <li><strong>요청사항:</strong> {{ booking.requestText }}</li>
                <li><strong>예약시간:</strong> {{ booking.bookedAt }}</li>
                <li><strong>주소:</strong> {{ booking.address }}</li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.logo-container {
  padding-left: 1rem; /* 이 부분을 추가하여 내부 요소를 가운데 정렬합니다. */
}

/* 로고 헤더 */
.logo-img {
  height: 32px;
  background-color: white;
}
/* 전체 페이지 컨테이너 */
.page-container {
  max-width: 420px;
  margin: 0 auto;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
}
.back-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}
.placeholder {
  width: 24px;
  color: white;
}

/* 메인 콘텐츠 영역 */
.content-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 15px;
}
.empty-message {
  text-align: center;
  color: #888;
  padding-top: 50px;
}

/* 예약 카드 */
.booking-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden; /* transition을 위해 추가 */
}

/* 요약 정보 뷰 */
.summary-view {
  display: flex;
  align-items: center;
  padding: 15px;
}
.thumbnail-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
}
.info-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}
.booking-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
}
.details-link {
  font-size: 14px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

/* 상세 정보 뷰 */
.details-view {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  margin: 10px 15px 0 15px;
}
.details-view ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  color: #333;
}
.details-view li {
  margin-top: 10px;
}
.details-view li strong {
  color: #555;
  margin-right: 8px;
}

/* 펼치기/접기 애니메이션 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.booking-status {
  font-size: 14px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
  color: #555;
  background-color: #e9ecef;
}

/* 예를 들어 '취소됨' 상태일 때 특별한 스타일을 주고 싶다면 */
.is-canceled .booking-status {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
