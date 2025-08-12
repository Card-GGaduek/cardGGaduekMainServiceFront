<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/index.js";

// Layout 및 자식 컴포넌트들 import
import SubHeader from "@/layout/SubHeader.vue";
import AccommodationDetail from "@/components/booking/AccommodationDetail.vue";
import BookingCalendar from "@/components/booking/BookingCalendar.vue";
import RoomList from "@/components/booking/RoomList.vue";

const route = useRoute();
const router = useRouter();

// --- 상태 관리 (State) ---
const accommodationId = route.params.id;
const accommodation = ref(null);
const existingBookings = ref([]);
const selectedDates = ref(null);

// --- 비즈니스 로직 (Computed Properties) ---
// 이 복잡한 로직들은 페이지 레벨에 두는 것이 적합합니다.
const activeBookings = computed(() => {
  if (!existingBookings.value) return [];
  return existingBookings.value.filter(
    (booking) => booking.status !== "CANCELED"
  );
});

const normalizedSelectedDates = computed(() => {
  if (!selectedDates.value || !selectedDates.value.checkIn || !selectedDates.value.checkOut) {
    return null;
  }
  const checkIn = new Date(selectedDates.value.checkIn);
  checkIn.setHours(0, 0, 0, 0);
  const checkOut = new Date(selectedDates.value.checkOut);
  checkOut.setHours(0, 0, 0, 0);
  return { checkIn, checkOut };
});

const fullyBookedDateRanges = computed(() => {
  // ... (기존의 복잡한 로직은 그대로 유지)
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
      ranges.push({ checkInDate: rangeStart, checkOutDate: formatDate(checkoutDate) });
      rangeStart = fullyBookedDates[i];
      rangeEnd = fullyBookedDates[i];
    }
  }

  const lastCheckoutDate = new Date(rangeEnd);
  lastCheckoutDate.setDate(lastCheckoutDate.getDate() + 1);
  ranges.push({ checkInDate: rangeStart, checkOutDate: formatDate(lastCheckoutDate) });
  return ranges;
});

const availableRooms = computed(() => {
  if (!accommodation.value || !accommodation.value.rooms) return [];
  if (!normalizedSelectedDates.value) {
    return accommodation.value.rooms;
  }
  const { checkIn: userCheckIn, checkOut: userCheckOut } = normalizedSelectedDates.value;
  return accommodation.value.rooms.filter((room) => {
    const bookingsForThisRoom = activeBookings.value.filter((b) => b.roomId === room.id);
    const isBooked = bookingsForThisRoom.some((booking) => {
      const existingCheckIn = new Date(booking.checkInDate);
      existingCheckIn.setHours(0, 0, 0, 0);
      const existingCheckOut = new Date(booking.checkOutDate);
      existingCheckOut.setHours(0, 0, 0, 0);
      return userCheckIn <= existingCheckOut && userCheckOut >= existingCheckIn;
    });
    return !isBooked;
  });
});


// --- API 통신 & 이벤트 핸들러 ---
async function fetchAccommodationDetail() {
  if (!accommodationId) return;
  try {
    const response = await api.get(`/api/accommodations/${accommodationId}`);
    accommodation.value = response.data.data;
    const responseBooking = await api.get(`api/booking/${accommodationId}`);
    existingBookings.value = responseBooking.data.data;
  } catch (error) {
    console.error("숙소 또는 예약 정보 조회 실패:", error);
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

// --- 유틸리티 함수 ---
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

onMounted(fetchAccommodationDetail);
</script>

<template>
  <SubHeader title="예약하기" class="fw-bold mb-2" />

  <div v-if="accommodation" class="booking-page-container p-2">
    <AccommodationDetail :accommodation="accommodation" />

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
        <RoomList
          :rooms="availableRooms"
          :is-date-selected="!!(selectedDates && selectedDates.checkIn)"
          @book-room="handleBooking"
        />
      </div>
    </div>

    <div v-else class="text-center mt-5">
      <p>숙소 정보를 불러오는 중이거나 찾을 수 없습니다.</p>
      <router-link to="/">홈으로 돌아가기</router-link>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 레벨의 레이아웃 스타일만 남깁니다. */
.booking-page-container {
  margin: 0 auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
}
</style>