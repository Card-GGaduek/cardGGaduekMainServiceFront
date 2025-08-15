<script setup>
// 부모로부터 room 객체를 props로 받습니다.
const props = defineProps({
    room: {
        type: Object,
        required: true,
    },
});
// 부모 컴포넌트로 이벤트를 전달하기 위해 emit을 정의합니다.
const emit = defineEmits(["books"]);

// 가격 포맷팅 유틸리티 함수
function formatPrice(price) {
    if(price === null || price === undefined) return "";
    return price.toLocaleString("ko-KR");
}

function handleBookingClick() {
    emit("book", props.room);
}
</script>

<template>
  <div class="card room-card mb-3">
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
        <button @click="handleBookingClick" class="btn btn-warning fw-bold w-50">
          선택하기
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 기존 RoomCard 관련 스타일을 그대로 가져옵니다. */
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
.capacity-info {
  color: #b4b4b4 !important;
}
.price-action-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.price-action-wrapper .card-text {
  margin-bottom: 0;
}
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
</style>