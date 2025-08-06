<script setup>
import { ref, onMounted } from 'vue';
import BookingCalendar from '@/pages/booking/BookingCalendar.vue'; // 1. 달력 컴포넌트 import
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';


const route = useRoute();
const router = useRouter();

const selectedDates = ref(null);

const accommodationId = route.params.id;

const accommodation = ref(null);

async function fetchUserCards() {
  try { // 기존 코드 삭제
    if (!memberId) {
      console.error("로그인 정보가 없습니다.");
      return;
    }
    const response = await axios.get(`/api/card`);
    userCards.value = response.data.data || response.data;
  } catch (error) {
    console.error("보유 카드 목록 조회 실패:", error);
  }
}

async function fetchAccommodationDetail() {
  if (!accommodationId) return;
  try {
    const response = await axios.get(`/api/accommodations/${accommodationId}`);
    console.log("API 응답 성공:", response.data);

    // 💡 변경점: response.data 대신 response.data.data를 할당
    accommodation.value = response.data.data; 

  } catch (error) {
    console.error("숙소 상세 정보 조회 실패:", error);
  }
}

function handleDatesSelected(dates) {
  selectedDates.value = dates;
  console.log('선택된 체크인:', dates.checkIn);
  console.log('선택된 체크아웃:', dates.checkOut);
}

function handleBooking(room) {
  // 날짜가 선택되지 않았으면 경고
  if (!selectedDates.value || !selectedDates.value.checkIn) {
    alert('체크인 날짜를 먼저 선택해주세요.');
    return;
  }

  // 최종 예약 페이지로 이동하면서 쿼리 파라미터로 정보 전달
  router.push({
    name: 'FinalBookingPage',
    query: {
      roomId: room.id,
      roomName: room.name,
      checkIn: formatDate(selectedDates.value.checkIn),
      checkOut: formatDate(selectedDates.value.checkOut),
    }
  });
}

// Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환하는 헬퍼 함수
function formatDate(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
onMounted(() => {
  fetchAccommodationDetail();
});
</script>

<template>
    <router-link to="/booking">뒤로 가기</router-link>
    <section class="p-3">
    <h6 class="fw-bold mb-3"><i class="bi bi-calendar-check me-2"></i>일정을 선택하세요</h6>
    
    <BookingCalendar @dates-selected="handleDatesSelected" />

  </section>
  <div class="booking-page-bg">
    <div v-if="accommodation" class="container booking-page-container p-0">
      
      <header class="top-header d-flex align-items-center p-3">
        <router-link to="/" class="text-dark"><i class="bi bi-arrow-left fs-4"></i></router-link>
        <h5 class="fw-bold m-0 flex-grow-1 text-center">예약하기</h5>
      </header>

      <div class="scrollable-content">
        <section class="main-image-section">
          <img src="@/assets/accommodations/부산펜션.png" class="main-image" alt="Main accommodation image">
          <div class="image-overlay-content p-3 text-white">
            <h3 class="fw-bold">{{ accommodation.name }}</h3>
            <p class="mb-0 small"><i class="bi bi-clock me-2"></i>체크인 {{ accommodation.checkInTime }} 체크아웃 {{ accommodation.checkOutTime }}</p>
          </div>
        </section>

        <hr class="my-4">

        <section class="p-3 pt-0">
          <h6 class="fw-bold mb-3"><i class="bi bi-door-open-fill me-2"></i>객실을 선택하세요</h6>
          <div class="room-list">
            <div class="card room-card mb-3" v-for="room in accommodation.rooms" :key="room.id">
              <img src="@/assets/accommodations/부산펜션.png" alt="RoomImage"/>
              <div class="card-body">
                <h6 class="card-title fw-bold">{{ room.name }}</h6>
                <p class="card-text text-muted small mb-1">최대 수용 인원: {{ room.maxCapacity }}</p>
                <p class="card-text fw-bold">1박 {{ room.pricePerNight }}원</p>
                <button  @click="handleBooking(room)" class="btn btn-warning w-100 fw-bold">선택하기</button>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
    <div v-else class="text-center mt-5">
      <p>숙소 정보를 찾을 수 없습니다.</p>
      <router-link to="/">홈으로 돌아가기</router-link>
    </div>
  </div>
</template>

<style scoped>
/* 전체 페이지 스타일 */
.booking-page-bg {
  background-color: #f8f9fa;
}
.booking-page-container {
  max-width: 420px;
  background-color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
   /* 하단 네비게이션 공간 확보 */
}
/* 스크롤 가능 영역 설정 */
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
}
/* 상단 헤더 */
.top-header {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
  border-bottom: 1px solid #eee;
}
.bi-arrow-left {
  position: absolute;
}

/* 메인 이미지 섹션 */
.main-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}
.image-overlay-content {

  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}
.image-overlay-content p {
  opacity: 0.9;
}

/* 달력 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  text-align: center;
}
.day-name {
  font-weight: bold;
  font-size: 0.8rem;
  color: #6c757d;
}
.day-cell {
  padding: 8px 0;
  font-size: 0.9rem;
}
.day-cell.selected {
  background-color: #ffc107;
  color: #fff;
  border-radius: 50%;
  font-weight: bold;
}

/* 객실 카드 */
.room-card {
  border: 1px solid #eee;
  border-radius: 12px;
}
.btn-warning {
  background-color: #ffc107;
  border: none;
}
</style>