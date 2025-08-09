<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

// --- Props & Emits ---

const props = defineProps({
  bookedRanges: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['dates-selected']);


// --- 상태 관리 ---

const currentDate = ref(new Date());
const checkInDate = ref(null);
const checkOutDate = ref(null);


// --- 날짜 계산 ---

const today = new Date();
today.setHours(0, 0, 0, 0);

const fourMonthsLater = new Date();
fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);
fourMonthsLater.setDate(new Date(fourMonthsLater.getFullYear(), fourMonthsLater.getMonth() + 1, 0).getDate());
fourMonthsLater.setHours(23, 59, 59, 999);


// --- Computed 속성 ---

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());
const monthName = computed(() => 
  currentDate.value.toLocaleString('ko-KR', { month: 'long' })
);

const isPrevMonthDisabled = computed(() => {
  const currentMonthStart = new Date(year.value, month.value, 1);
  return currentMonthStart <= today;
});

const isNextMonthDisabled = computed(() => {
  const nextMonth = new Date(year.value, month.value + 1, 1);
  return nextMonth > fourMonthsLater;
});

const calendarGrid = computed(() => {
  const firstDayOfMonth = new Date(year.value, month.value, 1).getDay();
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) { days.push(null); }
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(year.value, month.value, i);
    dayDate.setHours(0, 0, 0, 0);
    days.push(dayDate);
  }
  return days;
});


// --- 함수 ---

const isDateBooked = (date) => {
  if (!date || !props.bookedRanges.length) return false;
  
  const checkTime = date.getTime();

  for (const range of props.bookedRanges) {
    if (range.status === 'CANCELED') continue;

    // 💡 변경점: 날짜 문자열을 시간대 문제 없이 안전하게 파싱합니다.
    const startParts = range.checkInDate.split('-').map(Number);
    const endParts = range.checkOutDate.split('-').map(Number);

    // new Date(YYYY, MM-1, DD) 형식으로 생성하여 항상 자정(00:00:00) 기준으로 만듭니다.
    const startTime = new Date(startParts[0], startParts[1] - 1, startParts[2]).getTime();
    const endTime = new Date(endParts[0], endParts[1] - 1, endParts[2]).getTime();
    
    if (checkTime >= startTime && checkTime <= endTime) {
      return true;
    }
  }
  return false;
};

const isDateUnavailable = (date) => {
  if (!date) return true;
  if (date < today || date > fourMonthsLater) return true;
  if (isDateBooked(date)) return true;
  return false;
};

function selectDate(date) {
  if (isDateUnavailable(date)) return;

  if (!checkInDate.value || (checkInDate.value && checkOutDate.value)) {
    checkInDate.value = date;
    checkOutDate.value = null;
  } else if (date > checkInDate.value) {
    checkOutDate.value = date;
    emit('dates-selected', { checkIn: checkInDate.value, checkOut: checkOutDate.value });
  } else {
    checkInDate.value = date;
  }
}

function previousMonth() {
  if (isPrevMonthDisabled.value) return;
  currentDate.value = new Date(year.value, month.value - 1, 1);
}

function nextMonth() {
  if (isNextMonthDisabled.value) return;
  currentDate.value = new Date(year.value, month.value + 1, 1);
}

function isDateInRange(date) {
  if (!date || !checkInDate.value || !checkOutDate.value) return false;
  const time = date.getTime();
  return time > checkInDate.value.getTime() && time < checkOutDate.value.getTime();
}

</script>

<template>
  <div class="calendar-wrapper">
    <div class="calendar-header d-flex justify-content-between align-items-center mb-3">
      <span class="fw-bold fs-5">{{ year }}년 {{ monthName }}</span>
      <div>
        <button @click="previousMonth" class="btn border-0 p-1" :disabled="isPrevMonthDisabled">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button @click="nextMonth" class="btn border-0 p-1" :disabled="isNextMonthDisabled">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
    <div class="calendar-grid">
      <div class="day-name">일</div>
      <div class="day-name">월</div>
      <div class="day-name">화</div>
      <div class="day-name">수</div>
      <div class="day-name">목</div>
      <div class="day-name">금</div>
      <div class="day-name">토</div>
      
      <div
        v-for="(day, index) in calendarGrid"
        :key="index"
        class="day-cell"
        :class="{
          'not-day': !day,
          'is-unavailable': isDateUnavailable(day),
          'selected': day && checkInDate && day.getTime() === checkInDate.getTime() && !checkOutDate,
          'check-in': day && checkInDate && day.getTime() === checkInDate.getTime(),
          'check-out': day && checkOutDate && day.getTime() === checkOutDate.getTime(),
          'in-range': isDateInRange(day)
        }"
        @click="selectDate(day)">
        <span v-if="day">{{ day.getDate() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-wrapper { padding: 0.5rem; border-radius: 8px; background-color: #fff; border: 1px solid #eee; }
.calendar-header { padding: 0 0.5rem; }
.calendar-header .fs-5 { font-size: 1.1rem !important; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
.day-name { font-weight: normal; font-size: 0.9rem; color: #adb5bd; }
.day-cell { padding: 8px 0; font-size: 0.9rem; font-weight: 500; cursor: pointer; border-radius: 50%; color: #495057; }
.not-day { cursor: default; }
.selected, .check-in, .check-out { background-color: #ffc107; color: #fff; font-weight: bold; }
.in-range { background-color: #fff3cd; border-radius: 0; }
.is-unavailable { color: #ced4da; cursor: not-allowed; text-decoration: line-through; }
.is-unavailable:hover { background-color: transparent !important; }
button:disabled i { color: #e9ecef; cursor: not-allowed; }
</style>