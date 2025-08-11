<script setup>
import { ref, onMounted, computed } from "vue";
import BookingCalendar from "@/pages/booking/BookingCalendar.vue"; // 1. 달력 컴포넌트 import
import { useRoute, useRouter } from "vue-router";
import api from "@/api/index.js";
import SubHeader from "@/layout/SubHeader.vue";

const route = useRoute();
const router = useRouter();

const selectedDates = ref(null);
const accommodationId = route.params.id;
const accommodation = ref(null);
const existingBookings = ref([]);

function formatPrice(price) {
  // price 값이 null이거나 undefined일 경우, 빈 문자열을 반환하여 에러 방지
  if (price === null || price === undefined) return "";
  // toLocaleString('ko-KR')은 숫자를 한국 원화 표기법(세 자리 콤마)에 맞게 바꿔줍니다.
  return price.toLocaleString("ko-KR");
}

/**
 * [기준 데이터 1] 취소된 예약을 제외한 실제 유효한 예약 목록
 */
const activeBookings = computed(() => {
  if (!existingBookings.value) return [];
  return existingBookings.value.filter(
    (booking) => booking.status !== "CANCELED"
  );
});

/**
 * [기준 데이터 2] 사용자가 선택한 날짜 (시간 초기화 완료)
 */
const normalizedSelectedDates = computed(() => {
  if (
    !selectedDates.value ||
    !selectedDates.value.checkIn ||
    !selectedDates.value.checkOut
  ) {
    return null;
  }
  const checkIn = new Date(selectedDates.value.checkIn);
  checkIn.setHours(0, 0, 0, 0);

  const checkOut = new Date(selectedDates.value.checkOut);
  checkOut.setHours(0, 0, 0, 0);

  return { checkIn, checkOut };
});

/**
 * [기능 1] 달력에서 비활성화할 날짜 범위 계산
 */
const fullyBookedDateRanges = computed(() => {
  if (!accommodation.value || !accommodation.value.rooms) return [];

  const totalRoomTypes = accommodation.value.rooms.length;
  if (totalRoomTypes === 0) return [];

  const bookedRoomTypesByDate = {};

  activeBookings.value.forEach((booking) => {
    let currentDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);

    while (currentDate <= checkOutDate) {
      const dateString = formatDate(currentDate);
      if (!bookedRoomTypesByDate[dateString]) {
        bookedRoomTypesByDate[dateString] = new Set();
      }
      bookedRoomTypesByDate[dateString].add(booking.roomId);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  const fullyBookedDates = Object.keys(bookedRoomTypesByDate).filter(
    (date) => bookedRoomTypesByDate[date].size >= totalRoomTypes
  );

  if (fullyBookedDates.length === 0) return [];

  fullyBookedDates.sort();

  const ranges = [];
  let rangeStart = fullyBookedDates[0];
  let rangeEnd = fullyBookedDates[0];

  for (let i = 1; i < fullyBookedDates.length; i++) {
    const prevDate = new Date(fullyBookedDates[i - 1]);
    const currentDate = new Date(fullyBookedDates[i]);

    if (currentDate.getTime() === prevDate.getTime() + 86400000) {
      rangeEnd = fullyBookedDates[i];
    } else {
      const checkoutDate = new Date(rangeEnd);
      checkoutDate.setDate(checkoutDate.getDate() + 1);
      ranges.push({
        checkInDate: rangeStart,
        checkOutDate: formatDate(checkoutDate),
      });
      rangeStart = fullyBookedDates[i];
      rangeEnd = fullyBookedDates[i];
    }
  }

  const lastCheckoutDate = new Date(rangeEnd);
  lastCheckoutDate.setDate(lastCheckoutDate.getDate() + 1);
  ranges.push({
    checkInDate: rangeStart,
    checkOutDate: formatDate(lastCheckoutDate),
  });

  return ranges;
});

/**
 * [기능 2] 사용자가 선택한 날짜에 예약 가능한 객실 목록 계산
 */
const availableRooms = computed(() => {
  if (!accommodation.value || !accommodation.value.rooms) return [];

  // 날짜가 선택되지 않았다면 모든 객실을 보여줌
  if (!normalizedSelectedDates.value) {
    return accommodation.value.rooms;
  }

  const { checkIn: userCheckIn, checkOut: userCheckOut } =
    normalizedSelectedDates.value;

  return accommodation.value.rooms.filter((room) => {
    const bookingsForThisRoom = activeBookings.value.filter(
      (b) => b.roomId === room.id
    );

    const isBooked = bookingsForThisRoom.some((booking) => {
      // 기존 예약 날짜들도 시간 초기화
      const existingCheckIn = new Date(booking.checkInDate);
      existingCheckIn.setHours(0, 0, 0, 0);

      const existingCheckOut = new Date(booking.checkOutDate);
      existingCheckOut.setHours(0, 0, 0, 0);

      // 시간값이 제거된 순수 날짜로만 정확하게 비교
      return userCheckIn <= existingCheckOut && userCheckOut >= existingCheckIn;
    });

    return !isBooked;
  });
});

// --- 이하 함수들은 변경할 필요 없습니다 ---

async function fetchAccommodationDetail() {
  if (!accommodationId) return;
  try {
    const response = await api.get(`/api/accommodations/${accommodationId}`);
    accommodation.value = response.data.data;
  } catch (error) {
    console.error("숙소 상세 정보 조회 실패:", error);
  }
  try {
    const responseBooking = await api.get(`api/booking/${accommodationId}`);
    console.log("서버로부터 받은 원본 예약 데이터:", responseBooking.data.data);
    existingBookings.value = responseBooking.data.data;
  } catch (error) {
    console.error("기존 예약 목록 조회 실패", error);
  }
}
// 체크인, 체크아웃 시간 형식 HH:mm:ss -> HH:mm
const toHHMM = (t) => {
  if (!t) return "";

  const parts = String(t).split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return String(t);
};

async function fetchUserCards() {
  try {
    // 기존 코드 삭제
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

function handleDatesSelected(dates) {
  selectedDates.value = dates;
}

function handleBooking(room) {
  if (!selectedDates.value || !selectedDates.value.checkIn) {
    alert("체크인 날짜를 먼저 선택해주세요.");
    return;
  }
  router.push({
    name: "FinalBookingPage",
    query: {
      roomId: room.id,
      roomName: room.name,
      checkIn: formatDate(selectedDates.value.checkIn),
      checkOut: formatDate(selectedDates.value.checkOut),
    },
  });
}

function formatDate(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

onMounted(() => {
  fetchAccommodationDetail();
});
</script>

<template>
  <SubHeader title="예약하기" class="fw-bold mb-2" />

  <div v-if="accommodation" class="booking-page-container p-2">
    <section class="main-image-section">
      <h3 class="fw-bold">{{ accommodation.name }}</h3>
      <p class="mb-0 small">
        <i class="bi bi-clock me-2"></i>체크인
        {{ toHHMM(accommodation.checkInTime) }}
      </p>
      <p class="mb-0 small">
        <i class="bi bi-clock me-2"></i>체크아웃
        {{ toHHMM(accommodation.checkOutTime) }}
      </p>
      <img
        src="@/assets/accommodations/제목 없음 1.png"
        class="main-image mb-5"
      />
    </section>
    <h6 class="fw-bold mb-3">
      <i class="bi bi-calendar-check me-2"></i>일정을 선택하세요
    </h6>
    <BookingCalendar
      :booked-ranges="fullyBookedDateRanges"
      @dates-selected="handleDatesSelected"
      class="mb-5"
    />
  </div>

  <div class="booking-page-bg">
    <div v-if="accommodation" class="container booking-page-container p-0">
      <div class="scrollable-content">
        <section class="p-3 pt-0">
          <h6 class="fw-bold mb-3 p-1">
            <i class="bi bi-door-open-fill mb-5"></i>객실을 선택하세요
          </h6>
          <div class="room-list">
            <div v-if="availableRooms.length > 0" class="room-list">
              <div
                class="card room-card mb-3"
                v-for="room in availableRooms"
                :key="room.id"
              >
                <div class="card-body">
                  <h6 class="card-title">{{ room.name }}</h6>
                  <img
                    src="@/assets/accommodations/image 90.png"
                    alt="RoomImage"
                    class="mb-1"
                  />
                  <p class="card-text text-muted small mb-1 capacity-info">
                    일반객실 기준, 최대 {{ room.maxCapacity }}인
                  </p>
                  <div class="price-action-wrapper">
                    <p class="card-text fw-bold">
                      1박 {{ formatPrice(room.pricePerNight) }}원
                    </p>
                    <button
                      @click="handleBooking(room)"
                      class="btn btn-warning fw-bold w-50"
                    >
                      선택하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else-if="selectedDates && selectedDates.checkIn"
              class="text-center p-4 text-muted"
            >
              <p>
                선택하신 날짜에 예약 가능한 객실이 없습니다. <br />
                다른 날짜를 선택해주세요.
              </p>
              <div v-if="availableRooms.length > 0" class="room-list">
                <div
                  class="card room-card mb-3"
                  v-for="room in availableRooms"
                  :key="room.id"
                >
                  <div class="card-body">
                    <h6 class="card-title">{{ room.name }}</h6>
                    <img
                      src="@/assets/accommodations/image 90.png"
                      alt="RoomImage"
                      class="mb-1"
                    />
                    <p class="card-text text-muted small mb-1 capacity-info">
                      일반객실 기준, 최대 {{ room.maxCapacity }}인
                    </p>
                    <div class="price-action-wrapper">
                      <p class="card-text fw-bold">
                        1박 {{ formatPrice(room.pricePerNight) }}원
                      </p>
                      <button
                        @click="handleBooking(room)"
                        class="btn btn-warning fw-bold w-50"
                      >
                        선택하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else-if="selectedDates && selectedDates.checkIn"
                class="text-center p-4 text-muted"
              >
                <p>
                  선택하신 날짜에 예약 가능한 객실이 없습니다. <br />
                  다른 날짜를 선택해주세요.
                </p>
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
/* 공통 배경 */

/* 페이지 컨테이너 */
.booking-page-container {
  margin: 0 auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

/* 스크롤 가능한 영역 */
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
}

/* 상단 헤더 */

/* 이미지 섹션 */
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 12px;
}

/* 텍스트 */
h3 {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 8px;
}

/* 제목 왼쪽에 강조 라인 */
h3::before {
  content: "";
  position: absolute;
  top: -0.1rem;
  left: 0;
  width: 4px;
  height: 1.2em;
  background-color: #ffc107;
  border-radius: 4px;
}

h6 {
  color: #343a40;
}

/* 객실 카드 */
.room-card {
  border: none;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
  background-color: #fff;
}

.room-card:hover {
  transform: translateY(-4px);
}

.room-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 버튼 */
.btn-warning {
  background: linear-gradient(135deg, #ffc107, #ffb300);
  color: #fff;
  border: none;
  font-weight: bold;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-warning:hover {
  transform: scale(1.02);
  background-color: #ffb300;
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
  transition: all 0.2s;
}

.day-cell:hover {
  background-color: #ffe082;
  border-radius: 50%;
}

.day-cell.selected {
  background-color: #ffc107;
  color: #fff;
  border-radius: 50%;
  font-weight: bold;
}

.capacity-info {
  color: #b4b4b4 !important;
}

.price-action-wrapper {
  display: flex; /* 자식 요소들을 가로로 정렬합니다. */
  justify-content: space-between; /* 양쪽 끝으로 요소를 밀어냅니다. */
  align-items: center; /* 세로 방향으로 중앙에 정렬합니다. */
  gap: 10px; /* 요소 사이에 최소 간격을 줍니다. */
}

/* p 태그가 기본적으로 갖는 아래쪽 여백(margin)을 제거하여 버튼과 높이를 맞춥니다. */
.price-action-wrapper .card-text {
  margin-bottom: 0;
}
</style>
