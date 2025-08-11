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
const hoveredDate = ref(null); // [추가] 마우스 오버 날짜를 추적하는 상태


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

// [추가] 최종 체크아웃 날짜 (확정되었거나, 미리보기 중인 날짜)
const finalCheckoutDate = computed(() => checkOutDate.value || hoveredDate.value);

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

    const startParts = range.checkInDate.split('-').map(Number);
    const endParts = range.checkOutDate.split('-').map(Number);

    const startTime = new Date(startParts[0], startParts[1] - 1, startParts[2]).getTime();
    const endTime = new Date(endParts[0], endParts[1] - 1, endParts[2]).getTime();
    
    // [수정] 체크아웃 날짜를 포함하도록 '<=' 로 변경
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

/// <script setup> 안의 selectDate 함수를 아래 코드로 교체하세요.

function selectDate(date) {
  if (isDateUnavailable(date)) return;

  // [추가] 체크인 날짜를 다시 클릭하여 선택 해제하는 로직
  if (checkInDate.value && !checkOutDate.value && date.getTime() === checkInDate.value.getTime()) {
    checkInDate.value = null;
    hoveredDate.value = null; // 호버 상태도 초기화
    // 선택이 해제되었음을 부모 컴포넌트에 알려, 객실 목록 등이 초기화되도록 함
    emit('dates-selected', { checkIn: null, checkOut: null });
    return; // 함수 실행 종료
  }

  // 체크인이 없거나, 이미 범위 선택이 끝났으면 새로 시작
  if (!checkInDate.value || (checkInDate.value && checkOutDate.value)) {
    checkInDate.value = date;
    checkOutDate.value = null;
    hoveredDate.value = null;
  } 
  // 체크인만 있는 상태에서 클릭하면 체크아웃으로 설정하고 범위 확정
  else if (date > checkInDate.value) {
    checkOutDate.value = date;
    hoveredDate.value = null;
    emit('dates-selected', { checkIn: checkInDate.value, checkOut: checkOutDate.value });
  } 
  // 체크인 날짜보다 이전 날짜를 클릭하면, 그 날짜를 새로운 체크인으로 설정
  else {
    checkInDate.value = date;
  }
}

// [추가] 마우스 오버 핸들러 (슬라이드 효과)
function handleMouseOver(date) {
  if (date && checkInDate.value && !checkOutDate.value && date > checkInDate.value) {
    hoveredDate.value = date;
  }
}

// [추가] 달력 영역을 마우스가 떠났을 때 핸들러
function handleMouseLeave() {
  hoveredDate.value = null;
}

function previousMonth() {
  if (isPrevMonthDisabled.value) return;
  currentDate.value = new Date(year.value, month.value - 1, 1);
}

function nextMonth() {
  if (isNextMonthDisabled.value) return;
  currentDate.value = new Date(year.value, month.value + 1, 1);
}

// [수정] 미리보기 날짜를 반영하도록 수정
function isDateInRange(date) {
  if (!date || !checkInDate.value || !finalCheckoutDate.value) return false;
  const time = date.getTime();
  // 체크인 날짜가 체크아웃 날짜보다 크거나 같은 경우 범위가 아님
  if (checkInDate.value.getTime() >= finalCheckoutDate.value.getTime()) return false;
  return time > checkInDate.value.getTime() && time < finalCheckoutDate.value.getTime();
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
    <div class="calendar-grid" @mouseleave="handleMouseLeave">
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
          'selected': day && checkInDate && day.getTime() === checkInDate.getTime() && !finalCheckoutDate,
          'check-in': day && checkInDate && day.getTime() === checkInDate.getTime(),
          'check-out': day && finalCheckoutDate && day.getTime() === finalCheckoutDate.getTime(),
          'in-range': isDateInRange(day)
        }"
        @click="selectDate(day)"
        @mouseenter="handleMouseOver(day)"
      > <span v-if="day">{{ day.getDate() }}</span>
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
.day-cell {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50%;
  color: #495057;
  position: relative;
}
.not-day { cursor: default; background-color: transparent !important; }
.selected, .check-in, .check-out { background-color: #ffc107; color: #fff; font-weight: bold; }
.in-range { background-color: #fff3cd; border-radius: 0; }
.is-unavailable { color: #ced4da; cursor: not-allowed; text-decoration: line-through; }
.is-unavailable:hover { background-color: transparent !important; }
button:disabled i { color: #e9ecef; cursor: not-allowed; }

/* [추가] 선택 가능한 날짜에 대한 호버 효과 */
.day-cell:not(.not-day):not(.is-unavailable):not(.check-in):not(.check-out):not(.in-range):not(.selected):hover {
  background-color: #f5f5f5;
}

/* 범위 선택 시 양 끝의 border-radius를 자연스럽게 처리 */
.in-range.check-in, .check-in.in-range { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.in-range.check-out, .check-out.in-range { border-top-left-radius: 0; border-bottom-left-radius: 0; }
</style>