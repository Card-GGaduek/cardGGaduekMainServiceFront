<script setup>
const props = defineProps({
    accommodation: {
        type: Object,
        required: true,
    },
});

// 체크인, 체크아웃 시간 형식 HH:mm:ss -> HH:mm
const toHHMM = (t) => {
    if(!t) return "";
    const parts = String(t).split(":");
    if(parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return String(t);
};
</script>

<template>
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
</template>

<style scoped>
/* 기존 이미지 및 제목 관련 스타일을 그대로 가져옵니다. */
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 12px;
}
h3 {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 8px;
}
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
</style>