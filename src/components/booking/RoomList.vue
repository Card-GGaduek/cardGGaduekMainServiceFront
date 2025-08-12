<script setup>
import RoomCard from "./RoomCard.vue";

const props = defineProps({
    rooms: {
        type: Array,
        required: true,
    },
    isDateSelected: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["book-room"]);

function handleBooking(room) {
    emit("book-room", room);
}
</script>

<template>
  <section class="p-3 pt-0">
    <h6 class="fw-bold mb-3 p-1">
      <i class="bi bi-door-open-fill mb-5"></i>객실을 선택하세요
    </h6>
    <div class="room-list">
      <div v-if="rooms.length > 0">
        <RoomCard
          v-for="room in rooms"
          :key="room.id"
          :room="room"
          @book="handleBooking"
        />
      </div>
      <div v-else-if="isDateSelected" class="text-center p-4 text-muted">
        <p>
          선택하신 날짜에 예약 가능한 객실이 없습니다. <br />
          다른 날짜를 선택해주세요.
        </p>
      </div>
       </div>
  </section>
</template>

<style scoped>
/* RoomList 컴포넌트에만 해당하는 스타일 (필요시 추가) */
</style>