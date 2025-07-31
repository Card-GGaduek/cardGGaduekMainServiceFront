<script setup>
// 스크립트 부분은 이전과 동일합니다.
import { ref, computed } from 'vue';

const emit = defineEmits(['dates-selected']);
const currentDate = ref(new Date());
const checkInDate = ref(null);
const checkOutDate = ref(null);

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());
// 캡처 이미지가 'October 2020' 이므로 임시로 하드코딩. 실제 사용 시에는 아래 주석처리된 코드를 사용하세요.
// const monthName = computed(() => new Date(year.value, month.value).toLocaleString('en-US', { month: 'long' }));
const monthName = ref('October');
const displayYear = ref(2020);


const calendarGrid = computed(() => {
  const firstDayOfMonth = new Date(displayYear.value, currentDate.value.getMonth(), 1).getDay();
  const daysInMonth = new Date(displayYear.value, currentDate.value.getMonth() + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) { days.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(displayYear.value, currentDate.value.getMonth(), i)); }
  return days;
});

function selectDate(date) {
  if (!date) return;
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
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
  displayYear.value = currentDate.value.getFullYear();
  monthName.value = currentDate.value.toLocaleString('en-US', { month: 'long' });
}
function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  displayYear.value = currentDate.value.getFullYear();
  monthName.value = currentDate.value.toLocaleString('en-US', { month: 'long' });
}

function isDateInRange(date) {
  if (!date || !checkInDate.value || !checkOutDate.value) return false;
  return date > checkInDate.value && date < checkOutDate.value;
}
</script>

<template>
  <div class="calendar-wrapper">
    <div class="calendar-header d-flex justify-content-between align-items-center mb-3">
      <span class="fw-bold fs-5">{{ monthName }} {{ displayYear }}</span>
      <div>
        <button @click="previousMonth" class="btn border-0 p-1"><i class="bi bi-chevron-left"></i></button>
        <button @click="nextMonth" class="btn border-0 p-1"><i class="bi bi-chevron-right"></i></button>
      </div>
    </div>
    <div class="calendar-grid">
      <div class="day-name">Mo</div>
      <div class="day-name">Tu</div>
      <div class="day-name">We</div>
      <div class="day-name">Th</div>
      <div class="day-name">Fr</div>
      <div class="day-name">Sa</div>
      <div class="day-name">Su</div>

      <div
        v-for="(day, index) in calendarGrid"
        :key="index"
        class="day-cell"
        :class="{
          'not-day': !day,
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
/* 캡처16.PNG 디자인에 맞춘 스타일 */
.calendar-wrapper {
  padding: 0;
  background-color: #fff;
}
.calendar-header {
  padding: 0 0.5rem;
}
.calendar-header .fs-5 {
    font-size: 1.1rem !important;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px; /* 세로 간격 */
  row-gap: 15px; /* 가로 간격 */
  text-align: center;
}
.day-name {
  font-weight: normal;
  font-size: 0.9rem;
  color: #adb5bd; /* 연한 회색 */
}
.day-cell {
  padding: 8px 0;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50%;
  color: #495057;
}
.not-day {
  cursor: default;
}
/* 선택된 날짜 (이미지 속 노란색 원) */
.selected, .check-in, .check-out {
  background-color: #ffc107;
  color: #fff;
  font-weight: bold;
}
/* 범위 안의 날짜는 특별한 스타일 없음 */
.in-range {
  background-color: transparent;
}
</style>