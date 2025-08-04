<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['dates-selected']);

// --- 상태 관리 ---
const currentDate = ref(new Date()); // 달력이 현재 보여주는 월
const checkInDate = ref(null);
const checkOutDate = ref(null);

// --- 날짜 계산 ---
const today = new Date();
today.setHours(0, 0, 0, 0);

const fourMonthsLater = new Date();
fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);
fourMonthsLater.setHours(23, 59, 59, 999); // 4개월째 되는 달의 마지막 순간까지 포함

// --- Computed 속성 ---
const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());
const monthName = computed(() => 
  currentDate.value.toLocaleString('ko-KR', { month: 'long' })
);

// '이전 달' 버튼 비활성화 여부
const isPrevMonthDisabled = computed(() => {
  const prevMonth = new Date(year.value, month.value - 1, 1);
  return prevMonth.getFullYear() < today.getFullYear() || 
         (prevMonth.getFullYear() === today.getFullYear() && prevMonth.getMonth() < today.getMonth());
});

// '다음 달' 버튼 비활성화 여부
const isNextMonthDisabled = computed(() => {
  const nextMonth = new Date(year.value, month.value + 1, 1);
  return nextMonth > fourMonthsLater;
});

// 달력 그리드 데이터 생성
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
function selectDate(date) {
  if (!date || date < today || date > fourMonthsLater) return;

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
          'is-past': day && (day < today || day > fourMonthsLater),
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
/* 전체적인 스타일은 이전과 동일 */
.calendar-wrapper { padding: 0.5rem; border-radius: 8px; background-color: #fff; border: 1px solid #eee; }
.calendar-header { padding: 0 0.5rem; }
.calendar-header .fs-5 { font-size: 1.1rem !important; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
.day-name { font-weight: normal; font-size: 0.9rem; color: #adb5bd; }
.day-cell { padding: 8px 0; font-size: 0.9rem; font-weight: 500; cursor: pointer; border-radius: 50%; color: #495057; }
.not-day { cursor: default; }

/* 선택된 날짜 (체크인/체크아웃) */
.selected, .check-in, .check-out { background-color: #ffc107; color: #fff; font-weight: bold; }
/* 선택 범위 안의 날짜 */
.in-range { background-color: #fff3cd; border-radius: 0; }
/* 비활성화된 날짜 */
.is-past { color: #ced4da; cursor: not-allowed; text-decoration: line-through; }
.is-past:hover { background-color: transparent !important; }
/* 비활성화된 버튼 */
button:disabled i { color: #e9ecef; cursor: not-allowed; }
</style>